import { db } from "@/database/db";
import { 
  events, 
  tickets, 
  registrations, 
  attendees, 
  eventCategories, 
  categories,
  users 
} from "@/database/schema";
import { eq, and, inArray, gte, lte, sql } from "drizzle-orm";
import { ipaymuService } from "@/lib/ipaymu/ipaymu.service";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { site } from "@/config/site";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CreateRegistrationRequest {
  eventId: number;
  userId: string;
  ticketSelections: {
    ticketId: number;
    quantity: number;
  }[];
  attendeesData: {
    fullName: string;
    gender: string;
    ageCategory: string;
    beltLevel: string;
    phoneNumber: string;
    biodataUrl?: string;
    consentUrl?: string;
  }[];
  paymentMethod: "ONLINE" | "OFFLINE";
}

interface CreateRegistrationResponse {
  registrationId: number;
  paymentUrl?: string;
  registrationNumber: string;
}

export class RegistrationService {
  /**
   * Create a new registration with attendees
   */
  async createRegistration(request: CreateRegistrationRequest): Promise<CreateRegistrationResponse> {
    return await db.transaction(async (tx) => {
      // Verify event exists and is active
      const event = await tx.query.events.findFirst({
        where: eq(events.id, request.eventId),
        columns: {
          id: true,
          title: true,
          registrationOpenDate: true,
          registrationCloseDate: true,
          maxCapacity: true,
          adminFee: true
        }
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // Check if registration is open
      const now = new Date();
      if (now < event.registrationOpenDate || now > event.registrationCloseDate) {
        throw new Error("Registration is not open for this event");
      }

      // Get selected tickets and verify availability
      const ticketIds = request.ticketSelections.map(sel => sel.ticketId);
      const availableTickets = await tx.query.tickets.findMany({
        where: and(
          eq(tickets.eventId, request.eventId),
          inArray(tickets.id, ticketIds)
        )
      });

      // Calculate total cost
      let totalAmount = 0;
      let totalAttendees = 0;

      for (const selection of request.ticketSelections) {
        const ticket = availableTickets.find(t => t.id === selection.ticketId);
        if (!ticket) {
          throw new Error(`Ticket with ID ${selection.ticketId} not found`);
        }

        // Verify ticket availability
        const attendeesForTicket = await tx.query.attendees.findMany({
          where: eq(attendees.ticketId, ticket.id)
        });
        
        if (attendeesForTicket.length + selection.quantity > ticket.maxCapacity) {
          throw new Error(`Not enough capacity for ticket ${ticket.name}`);
        }

        totalAmount += ticket.price * selection.quantity;
        totalAttendees += selection.quantity;
      }

      // Add admin fee
      const adminFee = event.adminFee || 0;
      totalAmount += adminFee;

      // Generate registration number
      const registrationNumber = `REG-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

      // Create registration
      const [newRegistration] = await tx
        .insert(registrations)
        .values({
          eventId: request.eventId,
          userId: request.userId,
          registrationNumber,
          totalAmount,
          adminFee,
          paymentMethod: request.paymentMethod,
          status: "PENDING",
          paymentStatus: request.paymentMethod === "OFFLINE" ? "PENDING" : "PENDING",
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Create attendees
      for (let i = 0; i < request.attendeesData.length; i++) {
        const attendeeData = request.attendeesData[i];
        const ticketSelection = request.ticketSelections[i % request.ticketSelections.length]; // Assign ticket based on selection
        
        await tx.insert(attendees).values({
          registrationId: newRegistration.id,
          fullName: attendeeData.fullName,
          gender: attendeeData.gender,
          ageCategory: attendeeData.ageCategory,
          beltLevel: attendeeData.beltLevel,
          phoneNumber: attendeeData.phoneNumber,
          biodataUrl: attendeeData.biodataUrl,
          consentUrl: attendeeData.consentUrl,
          ticketId: ticketSelection.ticketId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Handle payment processing
      if (request.paymentMethod === "ONLINE" && totalAmount > 0) {
        // Get user details for payment
        const user = await tx.query.users.findFirst({
          where: eq(users.id, request.userId),
          columns: {
            name: true,
            email: true
          }
        });

        if (!user) {
          throw new Error("User not found");
        }

        // Prepare Ipaymu transaction
        const ipaymuRequest = {
          product: [`Event Registration: ${event.title}`],
          qty: [1],
          price: [totalAmount],
          amount: totalAmount,
          note: `Registration for ${event.title}`,
          name: user.name,
          email: user.email,
          phone: request.attendeesData[0].phoneNumber, // Use first attendee's phone
          returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/registration/${newRegistration.id}/status`,
          notifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/ipaymu-callback`,
        };

        const paymentResponse = await ipaymuService.createTransaction(ipaymuRequest);

        // Update registration with payment info
        await tx
          .update(registrations)
          .set({
            paymentId: paymentResponse.KodeTransaksi,
            updatedAt: new Date()
          })
          .where(eq(registrations.id, newRegistration.id));

        return {
          registrationId: newRegistration.id,
          paymentUrl: paymentResponse.PaymentUrl,
          registrationNumber
        };
      } else {
        // For offline payment or free events, registration is created but payment is pending
        return {
          registrationId: newRegistration.id,
          registrationNumber
        };
      }
    });
  }

  /**
   * Update registration status after payment
   */
  async updateRegistrationStatus(registrationId: number, status: string, paymentStatus: string) {
    await db
      .update(registrations)
      .set({
        status,
        paymentStatus,
        updatedAt: new Date()
      })
      .where(eq(registrations.id, registrationId));
  }

  /**
   * Get registration details by ID
   */
  async getRegistrationDetails(registrationId: number) {
    return await db.query.registrations.findFirst({
      where: eq(registrations.id, registrationId),
      with: {
        attendees: true,
        event: {
          with: {
            tickets: true
          }
        }
      }
    });
  }

  /**
   * Send registration confirmation email
   */
  async sendConfirmationEmail(registrationId: number) {
    const registration = await this.getRegistrationDetails(registrationId);
    if (!registration) {
      throw new Error("Registration not found");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, registration.userId),
      columns: {
        name: true,
        email: true
      }
    });

    if (!user) {
      throw new Error("User not found for registration");
    }

    // Send confirmation email using Resend
    await resend.emails.send({
      from: site.mailFrom,
      to: user.email,
      subject: `Registration Confirmation for ${registration.event.title}`,
      html: `
        <h2>Registration Confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>Your registration for <strong>${registration.event.title}</strong> has been confirmed.</p>
        <p><strong>Registration Number:</strong> ${registration.registrationNumber}</p>
        <p><strong>Event Date:</strong> ${registration.event.startDate}</p>
        <p><strong>Total Amount:</strong> Rp. ${(registration.totalAmount / 100).toFixed(2)}</p>
        <p>Thank you for registering!</p>
      `
    });
  }

  /**
   * Get registrations for an event with filters
   */
  async getEventRegistrations(
    eventId: number,
    ageCategory?: string,
    beltLevel?: string,
    status?: string
  ) {
    let whereClause = eq(attendees.registrationId, registrations.id);
    if (ageCategory) {
      whereClause = and(whereClause, eq(attendees.ageCategory, ageCategory));
    }
    if (beltLevel) {
      whereClause = and(whereClause, eq(attendees.beltLevel, beltLevel));
    }

    return await db.query.registrations.findMany({
      where: eq(registrations.eventId, eventId),
      with: {
        attendees: {
          where: whereClause,
          with: {
            ticket: true
          }
        },
        user: {
          columns: {
            name: true,
            email: true
          }
        }
      }
    });
  }

  /**
   * Export registrations to CSV format
   */
  async exportRegistrationsToCSV(eventId: number) {
    const registrations = await db.query.registrations.findMany({
      where: eq(registrations.eventId, eventId),
      with: {
        attendees: {
          with: {
            ticket: true
          }
        },
        user: {
          columns: {
            name: true,
            email: true
          }
        }
      }
    });

    // Create CSV content
    let csvContent = "Registration Number,User Name,User Email,Full Name,Gender,Age Category,Belt Level,Phone Number,Ticket Type,Registration Date\n";
    
    for (const registration of registrations) {
      for (const attendee of registration.attendees) {
        csvContent += `${registration.registrationNumber},"${registration.user?.name || ''}","${registration.user?.email || ''}","${attendee.fullName}","${attendee.gender}","${attendee.ageCategory}","${attendee.beltLevel}","${attendee.phoneNumber}","${attendee.ticket?.name || ''}","${attendee.createdAt}"\n`;
      }
    }

    return csvContent;
  }
}

export const registrationService = new RegistrationService();