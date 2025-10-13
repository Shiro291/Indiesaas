import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { registrationService } from "@/lib/services/registration.service"
import { auth } from "@/lib/auth"

/**
 * GET /api/dashboard/registrations
 *
 * Retrieve registrations for the authenticated user
 *
 * @param {NextRequest} request - The incoming request object
 * @returns {Response} A JSON response containing the user's registrations
 *
 * Response:
 * - 200: Success - Returns array of user's registrations
 * - 401: Unauthorized - User not authenticated
 * - 500: Server error - Returns error message
 */
export async function GET(request: NextRequest) {
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

        // Get user's registrations
        const userRegistrations =
            await registrationService.getRegistrationsByUserId(session.user.id)

        return Response.json({ registrations: userRegistrations })
    } catch (error: any) {
        console.error("Error fetching user registrations:", error)
        return Response.json(
            { error: error.message || "Failed to fetch user registrations" },
            { status: 500 }
        )
    }
}
