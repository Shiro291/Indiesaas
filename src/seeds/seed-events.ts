import { db } from "@/database/db";
import { 
  events, 
  categories, 
  eventCategories, 
  tickets,
  users,
  eventStatistics
} from "@/database/schema";
import { randomUUID } from "crypto";

export default async function seedEvents() {
  console.log("Seeding events...");
  
  // Create or get a default user
  const defaultUser = await db.insert(users).values({
    id: `user-${randomUUID()}`,
    name: "System Admin",
    email: "admin@example.com",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }).onConflictDoNothing().returning();
  
  const userId = defaultUser[0]?.id || "user-system";

  // Create some categories
  const martialArtsCategory = await db.insert(categories).values({
    name: "Martial Arts",
    description: "Martial arts events and competitions",
    createdAt: new Date(),
    updatedAt: new Date()
  }).onConflictDoNothing().returning();
  
  const culturalCategory = await db.insert(categories).values({
    name: "Cultural",
    description: "Cultural and traditional events",
    createdAt: new Date(),
    updatedAt: new Date()
  }).onConflictDoNothing().returning();
  
  const sportsCategory = await db.insert(categories).values({
    name: "Sports",
    description: "Sports and athletic events",
    createdAt: new Date(),
    updatedAt: new Date()
  }).onConflictDoNothing().returning();
  
  // Create sample events
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const registrationOpen = new Date(now);
  registrationOpen.setDate(registrationOpen.getDate() - 1); // Already open
  const registrationClose = new Date(now);
  registrationClose.setDate(registrationClose.getDate() + 5); // Closes in 5 days

  // Event 1: National Karate Championship
  const karateEvent = await db.insert(events).values({
    title: "National Karate Championship 2024",
    description: "Annual national karate championship featuring various categories and belt levels.",
    startDate: tomorrow,
    endDate: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000), // One day event
    registrationOpenDate: registrationOpen,
    registrationCloseDate: registrationClose,
    location: "Jakarta Convention Center, Jakarta",
    image: "https://images.unsplash.com/photo-1548978480-91a347f6a4a4?auto=format&fit=crop&q=80&w=1200",
    eventId: `evt-${Date.now()}-${randomUUID().slice(0, 8)}`,
    maxCapacity: 500,
    adminFee: 10000, // 10,000 IDR
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  // Link karate event to martial arts category
  await db.insert(eventCategories).values({
    eventId: karateEvent[0].id,
    categoryId: martialArtsCategory[0].id
  });

  // Add tickets for karate event
  await db.insert(tickets).values({
    eventId: karateEvent[0].id,
    name: "General Admission",
    description: "Entry ticket for the championship",
    price: 150000, // 150,000 IDR
    availableFrom: registrationOpen,
    availableUntil: registrationClose,
    maxCapacity: 450,
    type: "ONSITE",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  await db.insert(tickets).values({
    eventId: karateEvent[0].id,
    name: "VIP",
    description: "VIP ticket with reserved seating",
    price: 300000, // 300,000 IDR
    availableFrom: registrationOpen,
    availableUntil: registrationClose,
    maxCapacity: 50,
    type: "ONSITE",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Add statistics for karate event
  await db.insert(eventStatistics).values({
    eventId: karateEvent[0].id,
    totalRevenue: 0,
    totalRegistrations: 0,
    lastUpdated: new Date(),
    createdAt: new Date()
  });

  // Event 2: Cultural Dance Festival
  const danceEvent = await db.insert(events).values({
    title: "Indonesian Cultural Dance Festival",
    description: "Celebrating the rich diversity of Indonesian cultural dances from different regions.",
    startDate: nextWeek,
    endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000), // Three day event
    registrationOpenDate: registrationOpen,
    registrationCloseDate: new Date(registrationClose.getTime() + 2 * 24 * 60 * 60 * 1000), // Extended registration
    location: "Taman Ismail Marzuki, Jakarta",
    image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=1200",
    eventId: `evt-${Date.now() + 1}-${randomUUID().slice(0, 8)}`,
    maxCapacity: 300,
    adminFee: 5000, // 5,000 IDR
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  // Link dance event to cultural category
  await db.insert(eventCategories).values({
    eventId: danceEvent[0].id,
    categoryId: culturalCategory[0].id
  });

  // Add tickets for dance event
  await db.insert(tickets).values({
    eventId: danceEvent[0].id,
    name: "General Admission",
    description: "Entry to the cultural dance festival",
    price: 75000, // 75,000 IDR
    availableFrom: registrationOpen,
    availableUntil: new Date(registrationClose.getTime() + 2 * 24 * 60 * 60 * 1000),
    maxCapacity: 250,
    type: "ONSITE",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Add statistics for dance event
  await db.insert(eventStatistics).values({
    eventId: danceEvent[0].id,
    totalRevenue: 0,
    totalRegistrations: 0,
    lastUpdated: new Date(),
    createdAt: new Date()
  });

  // Event 3: Marathon Run
  const marathonEvent = await db.insert(events).values({
    title: "Jakarta Marathon 2024",
    description: "Annual Jakarta marathon open to participants of all levels.",
    startDate: nextMonth,
    endDate: new Date(nextMonth.getTime() + 24 * 60 * 60 * 1000), // One day event
    registrationOpenDate: registrationOpen,
    registrationCloseDate: new Date(nextMonth.getTime() - 24 * 60 * 60 * 1000), // Close one day before
    location: "National Monument (Monas), Jakarta",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=1200",
    eventId: `evt-${Date.now() + 2}-${randomUUID().slice(0, 8)}`,
    maxCapacity: 1000,
    adminFee: 15000, // 15,000 IDR
    createdAt: new Date(),
    updatedAt: new Date()
  }).returning();
  
  // Link marathon event to sports category
  await db.insert(eventCategories).values({
    eventId: marathonEvent[0].id,
    categoryId: sportsCategory[0].id
  });

  // Add tickets for marathon event
  await db.insert(tickets).values({
    eventId: marathonEvent[0].id,
    name: "Runner",
    description: "Registration for the marathon",
    price: 250000, // 250,000 IDR
    availableFrom: registrationOpen,
    availableUntil: new Date(nextMonth.getTime() - 24 * 60 * 60 * 1000),
    maxCapacity: 900,
    type: "ONSITE",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  await db.insert(tickets).values({
    eventId: marathonEvent[0].id,
    name: "Supporter",
    description: "Entry as a supporter",
    price: 50000, // 50,000 IDR
    availableFrom: registrationOpen,
    availableUntil: new Date(nextMonth.getTime() - 24 * 60 * 60 * 1000),
    maxCapacity: 100,
    type: "ONSITE",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Add statistics for marathon event
  await db.insert(eventStatistics).values({
    eventId: marathonEvent[0].id,
    totalRevenue: 0,
    totalRegistrations: 0,
    lastUpdated: new Date(),
    createdAt: new Date()
  });

  console.log("Events seeded successfully!");
}

seedEvents().catch((error) => {
  console.error("Error seeding events:", error);
  process.exit(1);
});