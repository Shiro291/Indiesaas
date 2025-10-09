import { NextRequest } from "next/server";
import { db } from "@/database/db";
import { registrations, eventStatistics } from "@/database/schema";
import { eq } from "drizzle-orm";
import { ipaymuService } from "@/lib/ipaymu/ipaymu.service";

/**
 * POST /api/payments/ipaymu-callback
 * 
 * Handle payment callback from Ipaymu payment gateway
 * This endpoint processes payment status updates from Ipaymu
 * 
 * @param {NextRequest} request - The incoming request object containing payment callback data
 * @returns {Response} A JSON response confirming the callback processing result
 * 
 * Request Body (from Ipaymu):
 * - id: Transaction ID from Ipaymu
 * - status: Payment status ("berhasil" for success, "gagal" for failure)
 * - keterangan: Description of the transaction status
 * - sign: Signature for verification
 * 
 * Response:
 * - 200: Success - Payment processed successfully
 * - 401: Unauthorized - Invalid signature
 * - 404: Not found - Registration not found for the transaction ID
 * - 500: Server error - Internal processing error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify the callback signature to ensure it's from Ipaymu
    if (!ipaymuService.verifyCallbackSignature(body)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Process the callback based on status
    const { id, status, keterangan } = body;
    
    if (status === "berhasil") {
      // Find the registration associated with this transaction
      const registration = await db.query.registrations.findFirst({
        where: eq(registrations.paymentId, id)
      });

      if (!registration) {
        return Response.json({ error: "Registration not found" }, { status: 404 });
      }

      // Update registration status to confirmed
      await db
        .update(registrations)
        .set({
          paymentStatus: "PAID",
          status: "CONFIRMED",
          updatedAt: new Date()
        })
        .where(eq(registrations.paymentId, id));

      // Update event statistics
      await db
        .insert(eventStatistics)
        .values({
          eventId: registration.eventId,
          totalRevenue: registration.totalAmount,
          totalRegistrations: 1
        })
        .onConflictDoUpdate({
          target: eventStatistics.eventId,
          set: {
            totalRevenue: eventStatistics.totalRevenue + registration.totalAmount,
            totalRegistrations: eventStatistics.totalRegistrations + 1,
            lastUpdated: new Date()
          }
        });

      return Response.json({ message: "Payment confirmed successfully" });
    } else if (status === "gagal") {
      // Update registration status to failed
      await db
        .update(registrations)
        .set({
          paymentStatus: "FAILED",
          status: "CANCELLED",
          updatedAt: new Date()
        })
        .where(eq(registrations.paymentId, id));

      return Response.json({ message: "Payment failed" });
    } else {
      return Response.json({ message: `Unhandled status: ${status}` });
    }
  } catch (error) {
    console.error("Ipaymu callback error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}