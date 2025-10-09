import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { eventService } from "@/lib/services/event.service";
import { categoryService } from "@/lib/services/category.service";
import { checkAdminAccess } from "@/lib/admin-auth";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/events
 * 
 * Retrieve all events for admin dashboard with categories
 * 
 * @param {NextRequest} request - The incoming request object
 * @returns {Response} A JSON response containing the list of admin events
 * 
 * Query Parameters:
 * - secretKey: Admin secret key for authentication (optional for this implementation)
 * 
 * Response:
 * - 200: Success - Returns array of events for admin dashboard
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

    // For simplicity in this implementation, we'll assume any authenticated user 
    // can access admin features. In a real application, you'd check for admin roles.
    // For now, we'll just verify the secret key from query params for demo purposes
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get("secretKey");
    
    if (secretKey && !checkAdminAccess(secretKey)) {
      return Response.json({ error: "Invalid admin credentials" }, { status: 403 });
    }

    const events = await eventService.getAdminEvents();

    return Response.json({ events });
  } catch (error) {
    console.error("Error fetching admin events:", error);
    return Response.json({ error: "Failed to fetch admin events" }, { status: 500 });
  }
}

/**
 * POST /api/admin/events
 * 
 * Create a new event with categories and tickets
 * 
 * @param {NextRequest} request - The incoming request object containing event data
 * @returns {Response} A JSON response containing the created event
 * 
 * Query Parameters:
 * - secretKey: Admin secret key for authentication
 * 
 * Request Body:
 * - title: Event title
 * - description: Event description
 * - startDate: Event start date
 * - endDate: Event end date
 * - registrationOpenDate: Registration open date
 * - registrationCloseDate: Registration close date
 * - location: Event location
 * - image: Event image URL
 * - maxCapacity: Maximum capacity for the event
 * - adminFee: Administrative fee
 * - categoryIds: Array of category IDs
 * - tickets: Array of ticket information
 * 
 * Response:
 * - 200: Success - Returns the created event
 * - 400: Bad request - Missing required fields
 * - 401: Unauthorized - User not authenticated
 * - 403: Forbidden - Invalid admin credentials
 * - 500: Server error - Returns error message
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, description, startDate, endDate, registrationOpenDate, 
            registrationCloseDate, location, image, maxCapacity, adminFee, 
            categoryIds, tickets } = body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || 
        !registrationOpenDate || !registrationCloseDate || !location || 
        maxCapacity === undefined || adminFee === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newEvent = await eventService.createEvent({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      registrationOpenDate: new Date(registrationOpenDate),
      registrationCloseDate: new Date(registrationCloseDate),
      location,
      image,
      maxCapacity,
      adminFee,
      categoryIds: categoryIds || [],
      tickets: tickets || []
    });

    return Response.json({ event: newEvent });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return Response.json({ error: error.message || "Failed to create event" }, { status: 500 });
  }
}