import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { registrationService } from "@/lib/services/registration.service"
import { auth } from "@/lib/auth"

/**
 * GET /api/registrations/[id]
 *
 * Retrieve details for a specific registration by ID
 *
 * @param {NextRequest} request - The incoming request object
 * @param {Object} params - URL parameters
 * @param {string} params.id - The registration ID as a string
 * @returns {Response} A JSON response containing the registration details
 *
 * Path Parameters:
 * - id: The numeric ID of the registration
 *
 * Response:
 * - 200: Success - Returns registration object with details
 * - 400: Bad request - Invalid registration ID
 * - 401: Unauthorized - User not authenticated
 * - 403: Forbidden - User not authorized to access this registration
 * - 404: Not found - Registration does not exist
 * - 500: Server error - Returns error message
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication
        const cookieStore = cookies()
        const headersInstance = new Headers()
        headersInstance.append("cookie", cookieStore.toString())

        const session = await auth.api.getSession({
            headers: headersInstance
        })

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        const registrationId = parseInt(params.id)
        if (isNaN(registrationId)) {
            return Response.json(
                { error: "Invalid registration ID" },
                { status: 400 }
            )
        }

        // Get registration details
        const registration =
            await registrationService.getRegistrationDetails(registrationId)

        if (!registration) {
            return Response.json(
                { error: "Registration not found" },
                { status: 404 }
            )
        }

        // Check if user is authorized to access this registration
        if (registration.userId !== session.user.id) {
            return Response.json(
                { error: "Unauthorized to access this registration" },
                { status: 403 }
            )
        }

        return Response.json({ registration })
    } catch (error: any) {
        console.error("Error fetching registration details:", error)
        return Response.json(
            { error: error.message || "Failed to fetch registration details" },
            { status: 500 }
        )
    }
}
