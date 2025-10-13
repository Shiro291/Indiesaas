import type { NextRequest } from "next/server"
import { analyticsService } from "@/lib/services/analytics.service"

/**
 * GET /api/admin/analytics
 *
 * Retrieve dashboard analytics data for admin panel
 *
 * @param {NextRequest} request - The incoming request object
 * @returns {Response} A JSON response containing analytics data
 *
 * Query Parameters:
 * - period: Time period for analytics ("week", "month", "quarter", "year") - default: "month"
 * - startDate: Optional start date for custom period (ISO string)
 * - endDate: Optional end date for custom period (ISO string)
 *
 * Response:
 * - 200: Success - Returns analytics data with KPIs, trends, and charts
 * - 400: Bad request - Invalid query parameters
 * - 500: Server error - Returns error message
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get("period") || "month"
        const startDate = searchParams.get("startDate") || undefined
        const endDate = searchParams.get("endDate") || undefined

        // Validate period parameter
        const validPeriods = ["week", "month", "quarter", "year", "custom"]
        if (!validPeriods.includes(period) && !(startDate && endDate)) {
            return Response.json(
                { error: "Invalid period or missing custom date range" },
                { status: 400 }
            )
        }

        // Get analytics data
        const analytics = await analyticsService.getDashboardAnalytics({
            period: startDate && endDate ? "custom" : period,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        })

        return Response.json(analytics)
    } catch (error: any) {
        console.error("Error fetching analytics:", error)
        return Response.json(
            { error: error.message || "Failed to fetch analytics" },
            { status: 500 }
        )
    }
}
