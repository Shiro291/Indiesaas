"use client"

import { useState, useEffect } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, CreditCard, Download } from "lucide-react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
// Session is obtained via authClient.useSession()

interface Event {
    id: number
    title: string
    description: string
    startDate: string // ISO string
    endDate: string // ISO string
    location: string
    image?: string
    maxCapacity: number
    currentRegistrations: number
    categories: {
        category: {
            name: string
        }
    }[]
}

interface Registration {
    id: number
    registrationNumber: string
    event: Event
    status: string // PENDING, CONFIRMED, CANCELLED
    paymentStatus: string // PENDING, PAID, FAILED
    totalAmount: number // in cents
    createdAt: string
    attendees: {
        fullName: string
        ageCategory: string
        beltLevel: string
    }[]
}

export default function DashboardPage() {
    const { data: session } = authClient.useSession()
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch user's registrations from API
        const fetchRegistrations = async () => {
            if (!session) return

            try {
                const response = await fetch(`/api/dashboard/registrations`)
                if (!response.ok) {
                    throw new Error("Failed to fetch registrations")
                }
                const data = await response.json()
                setRegistrations(data.registrations || [])
            } catch (error) {
                console.error("Error fetching registrations:", error)
                // For now, we'll set an empty array, but in a real app you might want to show an error message
                setRegistrations([])
            } finally {
                setLoading(false)
            }
        }

        if (session) {
            fetchRegistrations()
        }
    }, [session])

    if (!session) {
        return (
            <div className="container py-8">
                <Card className="mx-auto max-w-md">
                    <CardHeader>
                        <CardTitle>Please Sign In</CardTitle>
                        <CardDescription>
                            You need to be signed in to access your dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/auth/sign-in">Sign In</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="font-bold text-3xl">
                    Welcome,{" "}
                    {session.user.name || session.user.email.split("@")[0]}
                </h1>
                <p className="text-muted-foreground">
                    Manage your event registrations and account
                </p>
            </div>

            {loading ? (
                <div className="py-8 text-center">
                    Loading your registrations...
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h2 className="mb-4 font-bold text-2xl">
                            Your Registrations
                        </h2>

                        {registrations.length === 0 ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>No Registrations</CardTitle>
                                    <CardDescription>
                                        You haven't registered for any events
                                        yet. Browse events to get started!
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild>
                                        <Link href="/events">
                                            Browse Events
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {registrations.map((registration) => (
                                    <Card key={registration.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-xl">
                                                        {
                                                            registration.event
                                                                .title
                                                        }
                                                    </CardTitle>
                                                    <CardDescription className="mt-1">
                                                        Registration:{" "}
                                                        {
                                                            registration.registrationNumber
                                                        }
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    variant={
                                                        registration.status ===
                                                        "CONFIRMED"
                                                            ? "default"
                                                            : registration.status ===
                                                                "PENDING"
                                                              ? "secondary"
                                                              : "destructive"
                                                    }
                                                >
                                                    {registration.status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {new Date(
                                                        registration.event
                                                            .startDate
                                                    ).toLocaleDateString()}{" "}
                                                    -{" "}
                                                    {new Date(
                                                        registration.event
                                                            .endDate
                                                    ).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <MapPin className="mr-2 h-4 w-4" />
                                                    {
                                                        registration.event
                                                            .location
                                                    }
                                                </div>
                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    <span
                                                        className={
                                                            registration.paymentStatus ===
                                                            "PAID"
                                                                ? "text-green-600"
                                                                : "text-yellow-600"
                                                        }
                                                    >
                                                        {
                                                            registration.paymentStatus
                                                        }
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-muted-foreground text-sm">
                                                    <Users className="mr-2 h-4 w-4" />
                                                    {
                                                        registration.attendees
                                                            .length
                                                    }{" "}
                                                    attendee
                                                    {registration.attendees
                                                        .length !== 1
                                                        ? "s"
                                                        : ""}
                                                </div>

                                                <div className="border-t pt-2">
                                                    <h4 className="mb-2 font-medium">
                                                        Attendees
                                                    </h4>
                                                    <div className="space-y-1">
                                                        {registration.attendees.map(
                                                            (
                                                                attendee,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className="text-sm"
                                                                >
                                                                    <p>
                                                                        {
                                                                            attendee.fullName
                                                                        }
                                                                    </p>
                                                                    <p className="text-muted-foreground">
                                                                        {
                                                                            attendee.ageCategory
                                                                        }{" "}
                                                                        |{" "}
                                                                        {
                                                                            attendee.beltLevel
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 pt-3">
                                                    <Button asChild size="sm">
                                                        <Link
                                                            href={`/events/${registration.event.id}`}
                                                        >
                                                            View Event
                                                        </Link>
                                                    </Button>

                                                    {registration.paymentStatus !==
                                                        "PAID" && (
                                                        <Button
                                                            asChild
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Link
                                                                href={`/registration/${registration.id}/status`}
                                                            >
                                                                Complete Payment
                                                            </Link>
                                                        </Button>
                                                    )}

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Invoice
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
