"use client"

import { useState, useEffect } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts"

interface AnalyticsData {
    totalEvents: number
    totalRegistrations: number
    totalRevenue: number
    eventsByStatus: {
        active: number
        archived: number
    }
    monthlyRevenue: {
        month: string
        revenue: number
    }[]
    registrationsByCategory: {
        name: string
        value: number
    }[]
}

export default function AdminAnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // In a real application, this would fetch analytics data from the API
        // For this example, using mock data
        setTimeout(() => {
            setAnalytics({
                totalEvents: 12,
                totalRegistrations: 48,
                totalRevenue: 25400000, // 25,400,000 IDR in cents
                eventsByStatus: {
                    active: 8,
                    archived: 4
                },
                monthlyRevenue: [
                    { month: "Jan", revenue: 1800000 },
                    { month: "Feb", revenue: 2200000 },
                    { month: "Mar", revenue: 1900000 },
                    { month: "Apr", revenue: 2500000 },
                    { month: "May", revenue: 2100000 },
                    { month: "Jun", revenue: 2400000 }
                ],
                registrationsByCategory: [
                    { name: "Martial Arts", value: 25 },
                    { name: "Competition", value: 15 },
                    { name: "Youth", value: 8 }
                ]
            })
            setLoading(false)
        }, 500)
    }, [])

    if (loading) {
        return (
            <div className="p-6">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="font-bold text-3xl">Analytics</h1>
                </div>
                <div className="py-8 text-center">Loading analytics...</div>
            </div>
        )
    }

    if (!analytics) {
        return (
            <div className="p-6">
                <div className="py-8 text-center">
                    Failed to load analytics data
                </div>
            </div>
        )
    }

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

    return (
        <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="font-bold text-3xl">Analytics</h1>
                    <p className="text-muted-foreground">
                        View detailed statistics about your events
                    </p>
                </div>
                <Button>Export Report</Button>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">
                            Total Events
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-2xl">
                            {analytics.totalEvents}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            {analytics.eventsByStatus.active} active,{" "}
                            {analytics.eventsByStatus.archived} archived
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">
                            Total Registrations
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-2xl">
                            {analytics.totalRegistrations}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            +12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-2xl">
                            Rp.{" "}
                            {(analytics.totalRevenue / 100).toLocaleString(
                                "id-ID"
                            )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                            +8% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">
                            Growth
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-2xl">+12.5%</div>
                        <p className="text-muted-foreground text-xs">
                            From last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Revenue</CardTitle>
                        <CardDescription>
                            Revenue generated each month
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={analytics.monthlyRevenue}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => [
                                            `Rp. ${(Number(value) / 100).toLocaleString("id-ID")}`,
                                            "Revenue"
                                        ]}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="revenue"
                                        name="Revenue"
                                        fill="#8884d8"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Registrations by Category</CardTitle>
                        <CardDescription>
                            Breakdown of registrations by event category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analytics.registrationsByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) =>
                                            `${name} ${(Number(percent) * 100).toFixed(0)}%`
                                        }
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {analytics.registrationsByCategory.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [
                                            `${value} registrations`,
                                            "Registrations"
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top Events</CardTitle>
                    <CardDescription>
                        Events with the highest number of registrations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between rounded-md p-3 hover:bg-muted"
                            >
                                <div>
                                    <p className="font-medium">
                                        Pencak Silat Championship 2025
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Mar 15-17, 2025
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">
                                        24 registrations
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Rp. 2,400,000
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
