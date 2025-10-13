"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
// Session is obtained via authClient.useSession()
import { useRouter } from "next/navigation"

interface Event {
    id: number
    title: string
    description: string
    startDate: string // ISO string
    endDate: string // ISO string
    registrationOpenDate: string // ISO string
    registrationCloseDate: string // ISO string
    location: string
    image?: string
    maxCapacity: number
    adminFee: number
    categories: {
        category: {
            name: string
        }
    }[]
    tickets: {
        id: number
        name: string
        description?: string
        price: number // in cents
        availableFrom: string
        availableUntil: string
        maxCapacity: number
        type: string
    }[]
    isRegistrationOpen: boolean
}

export default function EventDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = use(params);
    const eventId = parseInt(resolvedParams.id)
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [countdown, setCountdown] = useState("")
    const [selectedTickets, setSelectedTickets] = useState<{
        [key: number]: number
    }>({})

    const { data: session } = authClient.useSession()
    const router = useRouter()

    useEffect(() => {
        // Fetch event data from API
        const fetchEvent = async () => {
            try {
                const response = await fetch(`/api/events/${eventId}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch event")
                }
                const data = await response.json()
                const fetchedEvent = data.event

                setEvent(fetchedEvent)
                setLoading(false)

                // Initialize selected tickets
                const initialSelection: { [key: number]: number } = {}
                fetchedEvent.tickets.forEach((ticket: any) => {
                    initialSelection[ticket.id] = 0
                })
                setSelectedTickets(initialSelection)

                // Set up countdown timer
                updateCountdown(fetchedEvent)
                const interval = setInterval(
                    () => updateCountdown(fetchedEvent),
                    1000
                )

                return () => clearInterval(interval)
            } catch (error) {
                console.error("Error fetching event:", error)
                setLoading(false)
            }
        }

        fetchEvent()
    }, [eventId])

    const updateCountdown = (event: Event) => {
        const now = new Date()
        const openDate = new Date(event.registrationOpenDate)
        const closeDate = new Date(event.registrationCloseDate)

        let countdownText = ""

        if (now < openDate) {
            // Registration not opened yet
            const diff = openDate.getTime() - now.getTime()
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            )
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            countdownText = `Registration opens in ${days}d ${hours}h ${minutes}m ${seconds}s`
        } else if (now >= openDate && now <= closeDate) {
            // Registration is open
            const diff = closeDate.getTime() - now.getTime()
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor(
                (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            )
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            countdownText = `Registration ends in ${days}d ${hours}h ${minutes}m ${seconds}s`
        } else {
            // Registration closed
            countdownText = "Registration closed"
        }

        setCountdown(countdownText)
    }

    const handleTicketChange = (ticketId: number, value: number) => {
        if (value < 0) return
        setSelectedTickets((prev) => ({
            ...prev,
            [ticketId]: value
        }))
    }

    const handleRegister = () => {
        if (!session) {
            router.push("/auth/sign-in")
            return
        }

        // Calculate total attendees
        const totalAttendees = Object.values(selectedTickets).reduce(
            (sum, count) => sum + count,
            0
        )

        if (totalAttendees === 0) {
            alert("Please select at least one ticket")
            return
        }

        // Navigate to registration page with selected tickets
        router.push(`/events/${eventId}/register`)
    }

    if (loading) {
        return (
            <div className="container py-8">
                <div className="text-center">Loading event details...</div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="container py-8">
                <div className="text-center">Event not found</div>
            </div>
        )
    }

    return (
        <div className="container py-8">
            <div className="mb-6">
                <Link
                    href="/events"
                    className="text-muted-foreground text-sm hover:underline"
                >
                    ← Back to Events
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="mb-6 aspect-video rounded-lg bg-muted">
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-200">
                            <span className="text-2xl text-muted-foreground">
                                Event Banner
                            </span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h1 className="font-bold text-3xl">{event.title}</h1>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {event.categories.map((cat, index) => (
                                <Badge key={index} variant="secondary">
                                    {cat.category.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="prose mb-8 max-w-none">
                        <p className="text-lg text-muted-foreground">
                            {event.description}
                        </p>
                    </div>

                    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground text-sm">
                                    Event Date
                                </p>
                                <p className="font-medium">
                                    {new Date(
                                        event.startDate
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(
                                        event.endDate
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground text-sm">
                                    Location
                                </p>
                                <p className="font-medium">{event.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground text-sm">
                                    Registration
                                </p>
                                <p className="font-medium">{countdown}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="mb-4 font-bold text-2xl">Tickets</h2>
                        <div className="space-y-4">
                            {event.tickets.map((ticket) => (
                                <Card key={ticket.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl">
                                                    {ticket.name}
                                                </CardTitle>
                                                {ticket.description && (
                                                    <CardDescription className="mt-1">
                                                        {ticket.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-2xl">
                                                    Rp.{" "}
                                                    {(
                                                        ticket.price / 100
                                                    ).toLocaleString("id-ID")}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleTicketChange(
                                                            ticket.id,
                                                            selectedTickets[
                                                                ticket.id
                                                            ] - 1
                                                        )
                                                    }
                                                    disabled={
                                                        selectedTickets[
                                                            ticket.id
                                                        ] <= 0
                                                    }
                                                >
                                                    -
                                                </Button>
                                                <span className="w-8 text-center text-lg">
                                                    {selectedTickets[ticket.id]}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleTicketChange(
                                                            ticket.id,
                                                            selectedTickets[
                                                                ticket.id
                                                            ] + 1
                                                        )
                                                    }
                                                >
                                                    +
                                                </Button>
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {ticket.maxCapacity} available
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Registration</CardTitle>
                            <CardDescription>
                                Select tickets and register for this event
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(selectedTickets).map(
                                    ([ticketId, count]) => {
                                        const ticket = event.tickets.find(
                                            (t) => t.id === parseInt(ticketId)
                                        )
                                        if (!ticket || count <= 0) return null

                                        return (
                                            <div
                                                key={ticketId}
                                                className="flex justify-between text-sm"
                                            >
                                                <span>
                                                    {ticket.name} x{count}
                                                </span>
                                                <span>
                                                    Rp.{" "}
                                                    {(
                                                        (ticket.price * count) /
                                                        100
                                                    ).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                        )
                                    }
                                )}

                                {event.adminFee > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Admin Fee</span>
                                        <span>
                                            Rp.{" "}
                                            {(
                                                event.adminFee / 100
                                            ).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                )}

                                <div className="border-t pt-2">
                                    <div className="flex justify-between font-bold">
                                        <span>Total</span>
                                        <span>
                                            Rp.{" "}
                                            {(
                                                Object.entries(
                                                    selectedTickets
                                                ).reduce(
                                                    (
                                                        sum,
                                                        [ticketId, count]
                                                    ) => {
                                                        const ticket =
                                                            event.tickets.find(
                                                                (t) =>
                                                                    t.id ===
                                                                    parseInt(
                                                                        ticketId
                                                                    )
                                                            )
                                                        return (
                                                            sum +
                                                            (ticket
                                                                ? ticket.price *
                                                                  count
                                                                : 0)
                                                        )
                                                    },
                                                    0
                                                ) + event.adminFee
                                            ).toLocaleString("id-ID", {
                                                maximumFractionDigits: 0
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    className="mt-4 w-full"
                                    onClick={handleRegister}
                                    disabled={!event.isRegistrationOpen}
                                >
                                    {event.isRegistrationOpen
                                        ? "Register Now"
                                        : "Registration Closed"}
                                </Button>

                                {!event.isRegistrationOpen && (
                                    <p className="text-center text-muted-foreground text-sm">
                                        Registration is currently closed
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
