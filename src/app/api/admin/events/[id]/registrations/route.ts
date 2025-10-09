import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { registrationService } from "@/lib/services/registration.service";
import { checkAdminAccess } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/events/[id]/registrations
 * 
 * Retrieve all registrations for a specific event with optional filters
 * 
 * @param {NextRequest} request - The incoming request object
 * @param {Object} params - URL parameters
 * @param {string} params.id - The event ID as a string
 * @returns {Response} A JSON response containing the list of registrations for the event
 * 
 * Path Parameters:
 * - id: The numeric ID of the event
 * 
 * Query Parameters:
 * - secretKey: Admin secret key for authentication
 * - ageCategory: Optional filter for age category
 * - beltLevel: Optional filter for belt level
 * 
 * Response:
 * - 200: Success - Returns array of registrations for the event
 * - 400: Bad request - Invalid event ID
 * - 401: Unauthorized - User not authenticated
 * - 403: Forbidden - Invalid admin credentials
 * - 500: Server error - Returns error message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication - use cookies() helper for reliable cookie handling
    const cookieStore = cookies();
    const headersInstance = new Headers();
    headersInstance.append('cookie', cookieStore.toString());
    
    const session = await auth.api.getSession({
      headers: headersInstance
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin access
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("secretKey");
    
    if (!secretKey || !checkAdminAccess(secretKey)) {
      return Response.json({ error: "Invalid admin credentials" }, { status: 403 });
    }

    const eventId = parseInt(params.id);
    if (isNaN(eventId)) {
      return Response.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const { searchParams: urlParams } = new URL(request.url);
    const ageCategory = urlParams.get("ageCategory") || undefined;
    const beltLevel = urlParams.get("beltLevel") || undefined;

    const registrations = await registrationService.getEventRegistrations(
      eventId,
      ageCategory,
      beltLevel
    );

    return Response.json({ registrations });
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return Response.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}