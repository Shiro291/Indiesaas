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
import { Input } from "@/components/ui/input"
import { Calendar, MapPin } from "lucide-react"
import Link from "next/link"

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

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")

    useEffect(() => {
        // In a real app, this would be an API call
        // For now, using mock data
        const mockEvents: Event[] = [
            {
                id: 1,
                title: "Pencak Silat Championship 2025",
                description:
                    "Annual championship for Pencak Silat practitioners of all levels",
                startDate: "2025-03-15T00:00:00.000Z",
                endDate: "2025-03-17T00:00:00.000Z",
                location: "Jakarta Convention Center",
                maxCapacity: 500,
                currentRegistrations: 120,
                categories: [
                    { category: { name: "Martial Arts" } },
                    { category: { name: "Competition" } }
                ]
            },
            {
                id: 2,
                title: "Indonesian Karate Tournament",
                description:
                    "National karate tournament for junior and senior categories",
                startDate: "2025-04-20T00:00:00.000Z",
                endDate: "2025-04-22T00:00:00.000Z",
                location: "Gelora Bung Karno",
                maxCapacity: 300,
                currentRegistrations: 80,
                categories: [
                    { category: { name: "Karate" } },
                    { category: { name: "Competition" } }
                ]
            },
            {
                id: 3,
                title: "Taekwondo Youth Cup",
                description: "International youth taekwondo competition",
                startDate: "2025-05-10T00:00:00.000Z",
                endDate: "2025-05-12T00:00:00.000Z",
                location: "Indonesia Arena",
                maxCapacity: 200,
                currentRegistrations: 150,
                categories: [
                    { category: { name: "Taekwondo" } },
                    { category: { name: "Youth" } }
                ]
            }
        ]

        setEvents(mockEvents)
        setLoading(false)
    }, [])

    // Filter events based on search and category
    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory =
            selectedCategory === "" ||
            event.categories.some(
                (cat) => cat.category.name === selectedCategory
            )

        return matchesSearch && matchesCategory
    })

    // Get unique categories for filter
    const allCategories = Array.from(
        new Set(
            events.flatMap((event) =>
                event.categories.map((cat) => cat.category.name)
            )
        )
    )

    return (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="font-bold text-3xl tracking-tight">
                    All Events
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Browse all upcoming events and find the perfect one for you.
                </p>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                    <Input
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="rounded-md border bg-background px-3 py-2"
                    >
                        <option value="">All Categories</option>
                        {allCategories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="py-8 text-center">Loading events...</div>
            ) : filteredEvents.length === 0 ? (
                <div className="py-8 text-center">
                    <h3 className="font-medium text-lg">No events found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your search or filters
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                        <Card key={event.id} className="overflow-hidden">
                            <div className="aspect-video bg-muted">
                                <div className="flex h-full w-full items-center justify-center">
                                    <span className="text-muted-foreground">
                                        Event Image
                                    </span>
                                </div>
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{event.title}</CardTitle>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {event.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {event.categories.map((cat, index) => (
                                        <Badge key={index} variant="outline">
                                            {cat.category.name}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="mb-4 space-y-2">
                                    <div className="flex items-center text-muted-foreground text-sm">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {new Date(
                                            event.startDate
                                        ).toLocaleDateString()}{" "}
                                        -{" "}
                                        {new Date(
                                            event.endDate
                                        ).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center text-muted-foreground text-sm">
                                        <MapPin className="mr-2 h-4 w-4" />
                                        {event.location}
                                    </div>
                                </div>

                                <Button asChild className="w-full">
                                    <Link href={`/events/${event.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
