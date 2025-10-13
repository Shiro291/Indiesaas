import type { NextRequest } from "next/server"
import { eventService } from "@/lib/services/event.service"
import { checkAdminAccess } from "@/lib/admin-auth"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: {
                cookie: request.headers.get("cookie") || ""
            }
        })

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        // For simplicity in this implementation, we'll assume any authenticated user
        // can access admin features. In a real application, you'd check for admin roles.
        // For now, we'll just verify the secret key from query params for demo purposes
        const { searchParams } = new URL(request.url)
        const secretKey = searchParams.get("secretKey")

        if (secretKey && !checkAdminAccess(secretKey)) {
            return Response.json(
                { error: "Invalid admin credentials" },
                { status: 403 }
            )
        }

        const events = await eventService.getAdminEvents()

        return Response.json({ events })
    } catch (error) {
        console.error("Error fetching admin events:", error)
        return Response.json(
            { error: "Failed to fetch admin events" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: {
                cookie: request.headers.get("cookie") || ""
            }
        })

        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify admin access
        const { searchParams } = new URL(request.url)
        const secretKey = searchParams.get("secretKey")

        if (!secretKey || !checkAdminAccess(secretKey)) {
            return Response.json(
                { error: "Invalid admin credentials" },
                { status: 403 }
            )
        }

        const body = await request.json()
        const {
            title,
            description,
            startDate,
            endDate,
            registrationOpenDate,
            registrationCloseDate,
            location,
            image,
            maxCapacity,
            adminFee,
            categoryIds,
            tickets
        } = body

        // Validate required fields
        if (
            !title ||
            !description ||
            !startDate ||
            !endDate ||
            !registrationOpenDate ||
            !registrationCloseDate ||
            !location ||
            maxCapacity === undefined ||
            adminFee === undefined
        ) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
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
        })

        return Response.json({ event: newEvent })
    } catch (error: any) {
        console.error("Error creating event:", error)
        return Response.json(
            { error: error.message || "Failed to create event" },
            { status: 500 }
        )
    }
}
