import { NextRequest } from "next/server";
import { eventService } from "@/lib/services/event.service";

/**
 * GET /api/events/[id]
 * 
 * Retrieve details for a specific event by ID
 * 
 * @param {NextRequest} request - The incoming request object
 * @param {Object} params - URL parameters
 * @param {string} params.id - The event ID as a string
 * @returns {Response} A JSON response containing the event details and registration status
 * 
 * Path Parameters:
 * - id: The numeric ID of the event to retrieve
 * 
 * Response:
 * - 200: Success - Returns event object with registration status
 * - 400: Bad request - Invalid event ID
 * - 404: Not found - Event does not exist
 * - 500: Server error - Returns error message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id);
    
    if (isNaN(eventId)) {
      return Response.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const event = await eventService.getEventById(eventId);

    if (!event) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if registration is currently open
    const now = new Date();
    const isRegistrationOpen = 
      event.registrationOpenDate <= now && 
      event.registrationCloseDate >= now;

    return Response.json({ 
      event: {
        ...event,
        isRegistrationOpen
      } 
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return Response.json({ error: "Failed to fetch event details" }, { status: 500 });
  }
}