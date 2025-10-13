"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

import { use } from "react";

export default function RegistrationStatusPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = use(params);
    const registrationId = resolvedParams.id
    const [registration, setRegistration] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Fetch registration details from API
        const fetchRegistration = async () => {
            try {
                const response = await fetch(
                    `/api/registrations/${registrationId}`
                )
                if (!response.ok) {
                    if (response.status === 404) {
                        setError("Registration not found")
                    } else {
                        setError("Failed to fetch registration details")
                    }
                    return
                }
                const data = await response.json()
                setRegistration(data.registration)
            } catch (err) {
                setError(
                    "An error occurred while fetching registration details"
                )
                console.error("Error fetching registration:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchRegistration()
    }, [registrationId])

    if (loading) {
        return (
            <div className="container flex items-center justify-center py-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-primary border-b-2" />
                    <p className="mt-4">Loading registration status...</p>
                </div>
            </div>
        )
    }

    if (!registration) {
        return (
            <div className="container py-8">
                <Card className="mx-auto max-w-2xl">
                    <CardHeader className="text-center">
                        <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
                        <CardTitle>Registration Not Found</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="mb-4">
                            We couldn't find registration with ID:{" "}
                            {registrationId}
                        </p>
                        <Button asChild>
                            <Link href="/events">Browse Events</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    let statusIcon, statusText, statusColor, statusDescription

    switch (registration.paymentStatus) {
        case "PAID":
        case "CONFIRMED":
            statusIcon = (
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            )
            statusText = "Registration Confirmed!"
            statusColor = "text-green-600"
            statusDescription =
                "Your payment has been processed successfully. Your registration is confirmed!"
            break
        case "FAILED":
            statusIcon = (
                <XCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
            )
            statusText = "Payment Failed"
            statusColor = "text-destructive"
            statusDescription =
                "Your payment could not be processed. Please try again."
            break
        case "PENDING":
        default:
            statusIcon = (
                <Clock className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
            )
            statusText = "Registration Pending"
            statusColor = "text-yellow-600"
            statusDescription =
                "We're waiting for your payment to be processed."
            break
    }

    return (
        <div className="container py-8">
            <Card className="mx-auto max-w-2xl">
                <CardHeader className="text-center">
                    {statusIcon}
                    <CardTitle className={statusColor}>{statusText}</CardTitle>
                    <p className="text-muted-foreground">{statusDescription}</p>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="font-medium">Registration Number</h3>
                            <p className="text-muted-foreground">
                                {registration.registrationNumber}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium">Payment Status</h3>
                            <p className="text-muted-foreground capitalize">
                                {registration.paymentStatus}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium">Event</h3>
                            <p className="text-muted-foreground">
                                {registration.eventName}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium">Event Date</h3>
                            <p className="text-muted-foreground">
                                {new Date(
                                    registration.eventDate
                                ).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="font-medium">Total Amount</h3>
                            <p className="text-muted-foreground">
                                Rp.{" "}
                                {(
                                    registration.totalAmount / 100
                                ).toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="mb-2 font-medium">Attendees</h3>
                        <div className="space-y-2">
                            {registration.attendees.map(
                                (attendee: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex justify-between border-b py-2"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {attendee.fullName}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {attendee.ageCategory} |{" "}
                                                {attendee.beltLevel}
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="flex-1">
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </Button>

                        {registration.paymentStatus === "PENDING" && (
                            <Button
                                asChild
                                variant="outline"
                                className="flex-1"
                            >
                                <Link
                                    href={`/events/${registration.eventId}/register`}
                                >
                                    Complete Payment
                                </Link>
                            </Button>
                        )}

                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/events">Browse More Events</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
