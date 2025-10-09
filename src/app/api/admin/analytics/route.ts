import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { eventService } from "@/lib/services/event.service";
import { checkAdminAccess } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/analytics
 * 
 * Retrieve analytics data for admin dashboard
 * 
 * @param {NextRequest} request - The incoming request object
 * @returns {Response} A JSON response containing analytics data
 * 
 * Query Parameters:
 * - secretKey: Admin secret key for authentication
 * 
 * Response:
 * - 200: Success - Returns analytics data including event counts and placeholder revenue
 * - 401: Unauthorized - User not authenticated
 * - 403: Forbidden - Invalid admin credentials
 * - 500: Server error - Returns error message
 */
export async function GET(request: NextRequest) {
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

    // For now, we'll return a simple analytics response
    // In a real application, you'd implement more complex analytics
    const events = await eventService.getAdminEvents();
    let totalRevenue = 0;
    let totalRegistrations = 0;
    
    // This is simplified - in real implementation you'd get from eventStatistics table
    for (const event of events) {
      // In a real app you'd query eventStatistics table for accurate data
      // For now, just return placeholder data
    }

    const analytics = {
      totalEvents: events.length,
      totalRevenue: 0, // Placeholder - would come from eventStatistics
      totalRegistrations: 0, // Placeholder - would come from eventStatistics
      eventsByStatus: {
        active: events.filter(e => e.status === "ACTIVE").length,
        archived: events.filter(e => e.status === "ARCHIVED").length
      }
    };

    return Response.json({ analytics });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}