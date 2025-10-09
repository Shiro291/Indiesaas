import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { registrationService } from "@/lib/services/registration.service";
import { checkAdminAccess } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/events/[id]/registrations/export
 * 
 * Export event registrations to CSV format for admin download
 * 
 * @param {NextRequest} request - The incoming request object
 * @param {Object} params - URL parameters
 * @param {string} params.id - The event ID as a string
 * @returns {Response} A CSV response containing the registrations data for download
 * 
 * Path Parameters:
 * - id: The numeric ID of the event to export registrations for
 * 
 * Query Parameters:
 * - secretKey: Admin secret key for authentication
 * 
 * Response:
 * - 200: Success - Returns CSV content with appropriate headers for download
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

    const csvContent = await registrationService.exportRegistrationsToCSV(eventId);

    // Return CSV content with appropriate headers
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="event-${eventId}-registrations.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting registrations:", error);
    return Response.json({ error: "Failed to export registrations" }, { status: 500 });
  }
}