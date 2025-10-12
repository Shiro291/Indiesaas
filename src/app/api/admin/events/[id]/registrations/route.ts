import { NextRequest } from "next/server";
import { registrationService } from "@/lib/services/registration.service";

/**
 * GET /api/admin/events/[id]/registrations
 * 
 * Retrieve registrations for a specific event with optional filtering
 * 
 * @param {NextRequest} request - The incoming request object
 * @param {Object} params - URL parameters
 * @param {string} params.id - The event ID as a string
 * @returns {Response} A JSON response containing the list of registrations and metadata
 * 
 * Path Parameters:
 * - id: The numeric ID of the event
 * 
 * Query Parameters:
 * - ageCategory: Optional filter for attendee age category (TK, SD, SMP, SMA)
 * - beltLevel: Optional filter for attendee belt level (DASAR, MC_I, MC_II, MC_III, MC_IV)
 * - status: Optional filter for registration status (PENDING, CONFIRMED, CANCELLED)
 * - paymentStatus: Optional filter for payment status (PENDING, PAID, FAILED)
 * - page: Optional page number for pagination (default: 1)
 * - limit: Optional limit for pagination (default: 10)
 * 
 * Response:
 * - 200: Success - Returns array of registrations with pagination metadata
 * - 400: Bad request - Invalid event ID or query parameters
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

    const { searchParams } = new URL(request.url);
    const ageCategory = searchParams.get("ageCategory") || undefined;
    const beltLevel = searchParams.get("beltLevel") || undefined;
    const status = searchParams.get("status") || undefined;
    const paymentStatus = searchParams.get("paymentStatus") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get registrations with filters
    const result = await registrationService.getEventRegistrations(
      eventId,
      {
        ageCategory,
        beltLevel,
        status,
        paymentStatus,
        page,
        limit
      }
    );

    return Response.json(result);
  } catch (error: any) {
    console.error("Error fetching event registrations:", error);
    return Response.json({ error: error.message || "Failed to fetch event registrations" }, { status: 500 });
  }
}