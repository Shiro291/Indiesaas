import type { NextRequest } from "next/server"
import { eventService } from "@/lib/services/event.service"

/**
 * GET /api/events
 *
 * Retrieve a list of events with optional search and filtering
 *
 * @param {NextRequest} request - The incoming request object
 * @returns {Response} A JSON response containing the list of events and metadata
 *
 * Query Parameters:
 * - search: Optional string to search events by title
 * - category: Optional comma-separated list of category IDs to filter events
 * - status: Optional status filter ("ACTIVE", "ARCHIVED", "OPEN", "CLOSED")
 *
 * Response:
 * - 200: Success - Returns array of events
 * - 500: Server error - Returns error message
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const search = searchParams.get("search") || undefined
        const category = searchParams.get("category") || undefined
        const status = searchParams.get("status") || undefined

        // Convert category to array if it exists
        const categoryIds = category
            ? category.split(",").map(Number)
            : undefined

        const events = await eventService.getEvents(search, categoryIds, status)

        return Response.json({ events })
    } catch (error) {
        console.error("Error fetching events:", error)
        return Response.json(
            { error: "Failed to fetch events" },
            { status: 500 }
        )
    }
}
