import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { registrationService } from "@/lib/services/registration.service"
import { auth } from "@/lib/auth"

/**
 * POST /api/events/[id]/register
 *
 * Register a user for a specific event with ticket selections and attendee information
 *
 * @param {NextRequest} request - The incoming request object containing registration data
 * @param {Object} params - URL parameters
 * @param {string} params.id - The event ID as a string
 * @returns {Response} A JSON response containing the registration result and payment URL if applicable
 *
 * Path Parameters:
 * - id: The numeric ID of the event to register for
 *
 * Request Body:
 * - ticketSelections: Array of ticket selections with ticketId and quantity
 * - attendeesData: Array of attendee information (name, gender, age category, etc.)
 * - paymentMethod: Payment method ("ONLINE" or "OFFLINE")
 *
 * Response:
 * - 200: Success - Returns registration ID and payment URL if applicable
 * - 400: Bad request - Missing required fields or invalid data
 * - 401: Unauthorized - User not authenticated
 * - 500: Server error - Returns error message
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check authentication - use cookies() helper for reliable cookie handling
        const cookieStore = cookies()
        const headersInstance = new Headers()
        headersInstance.append("cookie", cookieStore.toString())

        const session = await auth.api.getSession({
            headers: headersInstance
        })

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const eventId = parseInt(id)
        if (isNaN(eventId)) {
            return Response.json({ error: "Invalid event ID" }, { status: 400 })
        }

        const body = await request.json()
        const { ticketSelections, attendeesData, paymentMethod } = body

        // Validate required fields
        if (
            !ticketSelections ||
            !Array.isArray(ticketSelections) ||
            ticketSelections.length === 0
        ) {
            return Response.json(
                { error: "Ticket selections are required" },
                { status: 400 }
            )
        }

        if (
            !attendeesData ||
            !Array.isArray(attendeesData) ||
            attendeesData.length === 0
        ) {
            return Response.json(
                { error: "Attendee data is required" },
                { status: 400 }
            )
        }

        if (!paymentMethod || !["ONLINE", "OFFLINE"].includes(paymentMethod)) {
            return Response.json(
                { error: "Valid payment method is required" },
                { status: 400 }
            )
        }

        const result = await registrationService.createRegistration({
            eventId,
            userId: session.user.id,
            ticketSelections,
            attendeesData,
            paymentMethod
        })

        return Response.json(result)
    } catch (error: any) {
        console.error("Error creating registration:", error)
        return Response.json(
            { error: error.message || "Failed to create registration" },
            { status: 500 }
        )
    }
}
