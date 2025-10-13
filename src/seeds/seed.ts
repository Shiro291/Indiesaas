import seedEvents from "./seed-events";

async function runSeeds() {
  try {
    await seedEvents();
    console.log("All seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed execution failed:", error);
    process.exit(1);
  }
}

runSeeds();