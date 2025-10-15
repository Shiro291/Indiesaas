import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { registrationService } from "@/lib/services/registration.service"
import { auth } from "@/lib/auth"

/**
 * POST /api/registrations/[id]/payment
 *
 * Process payment for an existing registration
 *
 * @param {NextRequest} request - The incoming request object containing payment method
 * @param {Object} params - URL parameters
 * @param {string} params.id - The registration ID as a string
 * @returns {Response} A JSON response containing the payment result and payment URL if applicable
 *
 * Path Parameters:
 * - id: The numeric ID of the registration
 *
 * Request Body:
 * - paymentMethod: Payment method ("ONLINE" or "OFFLINE")
 *
 * Response:
 * - 200: Success - Returns registration ID and payment URL if applicable
 * - 400: Bad request - Missing payment method or invalid data
 * - 401: Unauthorized - User not authenticated or not authorized
 * - 404: Not found - Registration does not exist
 * - 500: Server error - Returns error message
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
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

        const { id } = await params
        const registrationId = parseInt(id)
        if (isNaN(registrationId)) {
            return Response.json(
                { error: "Invalid registration ID" },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { paymentMethod } = body

        // Validate required fields
        if (!paymentMethod || !["ONLINE", "OFFLINE"].includes(paymentMethod)) {
            return Response.json(
                { error: "Valid payment method is required" },
                { status: 400 }
            )
        }

        // Check if user owns this registration
        const registration =
            await registrationService.getRegistrationDetails(registrationId)
        if (!registration || registration.userId !== session.user.id) {
            return Response.json(
                { error: "Registration not found or unauthorized" },
                { status: 404 }
            )
        }

        const result = await registrationService.processRegistrationPayment({
            registrationId,
            paymentMethod
        })

        return Response.json(result)
    } catch (error: any) {
        console.error("Error processing registration payment:", error)
        return Response.json(
            {
                error: error.message || "Failed to process registration payment"
            },
            { status: 500 }
        )
    }
}
