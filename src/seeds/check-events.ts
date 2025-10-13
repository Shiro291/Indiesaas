import { db } from "@/database/db";
import { events, eventCategories, categories, tickets } from "@/database/schema";
import { eq, and, desc } from "drizzle-orm";

async function checkEvents() {
  console.log("Checking events in the database...");
  
  try {
    // Get all events with their categories and tickets
    const eventResults = await db.query.events.findMany({
      with: {
        categories: {
          with: {
            category: true
          }
        },
        tickets: true
      },
      orderBy: desc(events.createdAt)
    });

    console.log(`Found ${eventResults.length} events:`);
    
    eventResults.forEach(event => {
      console.log(`\nEvent: ${event.title}`);
      console.log(`  Description: ${event.description}`);
      console.log(`  Location: ${event.location}`);
      console.log(`  Start Date: ${event.startDate}`);
      console.log(`  End Date: ${event.endDate}`);
      console.log(`  Max Capacity: ${event.maxCapacity}`);
      console.log(`  Categories: ${event.categories.map(ec => ec.category.name).join(', ')}`);
      console.log(`  Tickets:`);
      event.tickets.forEach(ticket => {
        console.log(`    - ${ticket.name}: ${ticket.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })} (${ticket.maxCapacity} available)`);
      });
    });
    
    console.log("\nCheck completed successfully!");
  } catch (error) {
    console.error("Error checking events:", error);
    process.exit(1);
  }
}

checkEvents();