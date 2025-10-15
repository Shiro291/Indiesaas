import type { NextRequest } from "next/server"
import { analyticsService } from "@/lib/services/analytics.service"

/**
 * GET /api/admin/analytics/reports
 *
 * Retrieve detailed analytics reports
 *
 * @param {NextRequest} request - The incoming request object
 * @returns {Response} A JSON response containing detailed analytics reports
 *
 * Query Parameters:
 * - type: Type of report ("revenue", "registrations", "events", "attendees") - default: "revenue"
 * - period: Time period for report ("week", "month", "quarter", "year") - default: "month"
 * - startDate: Optional start date for custom period (ISO string)
 * - endDate: Optional end date for custom period (ISO string)
 * - format: Response format ("json", "csv") - default: "json"
 *
 * Response:
 * - 200: Success - Returns analytics report data
 * - 400: Bad request - Invalid query parameters
 * - 500: Server error - Returns error message
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const type = searchParams.get("type") || "revenue"
        const period = searchParams.get("period") || "month"
        const startDate = searchParams.get("startDate") || undefined
        const endDate = searchParams.get("endDate") || undefined
        const format = searchParams.get("format") || "json"

        // Validate parameters
        const validTypes = ["revenue", "registrations", "events", "attendees"]
        const validPeriods = ["week", "month", "quarter", "year", "custom"]
        const validFormats = ["json", "csv"]

        if (!validTypes.includes(type)) {
            return Response.json(
                { error: "Invalid report type" },
                { status: 400 }
            )
        }

        if (!validPeriods.includes(period) && !(startDate && endDate)) {
            return Response.json(
                { error: "Invalid period or missing custom date range" },
                { status: 400 }
            )
        }

        if (!validFormats.includes(format)) {
            return Response.json({ error: "Invalid format" }, { status: 400 })
        }

        // Get analytics report
        const report = await analyticsService.getAnalyticsReport({
            type: type as "revenue" | "registrations" | "events" | "attendees",
            period: (startDate && endDate ? "custom" : period) as "week" | "month" | "quarter" | "year" | "custom",
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        })

        if (format === "csv") {
            // If CSV format is requested, we would return CSV data
            // For now, we'll return JSON but the service could be extended to support CSV
            return Response.json(report)
        }

        return Response.json(report)
    } catch (error: any) {
        console.error("Error fetching analytics report:", error)
        return Response.json(
            { error: error.message || "Failed to fetch analytics report" },
            { status: 500 }
        )
    }
}
