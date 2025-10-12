import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { registrationService } from "@/lib/services/registration.service";
import { auth } from "@/lib/auth";

/**
 * POST /api/registrations/[id]/attendees
 * 
 * Add attendees to an existing registration
 * 
 * @param {NextRequest} request - The incoming request object containing attendee data
 * @param {Object} params - URL parameters
 * @param {string} params.id - The registration ID as a string
 * @returns {Response} A JSON response containing the updated registration
 * 
 * Path Parameters:
 * - id: The numeric ID of the registration
 * 
 * Request Body:
 * - attendeesData: Array of attendee information (name, gender, age category, etc.)
 * 
 * Response:
 * - 200: Success - Returns updated registration with attendees
 * - 400: Bad request - Missing required fields
 * - 401: Unauthorized - User not authenticated or not authorized
 * - 404: Not found - Registration does not exist
 * - 500: Server error - Returns error message
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const cookieStore = cookies();
    const headersInstance = new Headers();
    headersInstance.append('cookie', cookieStore.toString());
    
    const session = await auth.api.getSession({
      headers: headersInstance
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const registrationId = parseInt(params.id);
    if (isNaN(registrationId)) {
      return Response.json({ error: "Invalid registration ID" }, { status: 400 });
    }

    const body = await request.json();
    const { attendeesData } = body;

    // Validate required fields
    if (!attendeesData || !Array.isArray(attendeesData) || attendeesData.length === 0) {
      return Response.json({ error: "Attendee data is required" }, { status: 400 });
    }

    // Check if user owns this registration
    const registration = await registrationService.getRegistrationDetails(registrationId);
    if (!registration || registration.userId !== session.user.id) {
      return Response.json({ error: "Registration not found or unauthorized" }, { status: 404 });
    }

    const result = await registrationService.addAttendeesToRegistration({
      registrationId,
      attendeesData
    });

    return Response.json(result);
  } catch (error: any) {
    console.error("Error adding attendees to registration:", error);
    return Response.json({ error: error.message || "Failed to add attendees to registration" }, { status: 500 });
  }
}