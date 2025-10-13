import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, Users } from "lucide-react"

// Fetch events from the API
async function getEvents() {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL}/api/events`,
            {
                cache: "no-store" // Disable caching for fresh data
            }
        )

        if (!response.ok) {
            console.error("Failed to fetch events:", response.statusText)
            return []
        }

        const data = await response.json()
        return data.events || []
    } catch (error) {
        console.error("Error fetching events:", error)
        return []
    }
}

export default async function HomePage() {
    const events = await getEvents()

    return (
        <div className="container py-8">
            <div className="mb-12 text-center">
                <h1 className="font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl">
                    Discover Amazing Events
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Find and register for exciting events happening across
                    Indonesia. From martial arts tournaments to cultural
                    festivals.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.length > 0 ? (
                    events.map((event: any) => (
                        <Card key={event.id} className="overflow-hidden">
                            <div className="aspect-video bg-muted">
                                {event.image ? (
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <span className="text-muted-foreground">
                                            No image
                                        </span>
                                    </div>
                                )}
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{event.title}</CardTitle>
                                    <Badge variant="secondary">
                                        {event.maxCapacity > 0
                                            ? `${Math.round((event.currentRegistrations / event.maxCapacity) * 100)}% Full`
                                            : "Limited"}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {event.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {event.categories.map(
                                        (cat: any, index: number) => (
                                            <Badge
                                                key={index}
                                                variant="outline"
                                            >
                                                {cat.category.name}
                                            </Badge>
                                        )
                                    )}
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
                                    <div className="flex items-center text-muted-foreground text-sm">
                                        <Users className="mr-2 h-4 w-4" />
                                        {event.currentRegistrations} of{" "}
                                        {event.maxCapacity} registered
                                    </div>
                                </div>

                                <Button asChild className="w-full">
                                    <Link href={`/events/${event.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <p className="text-lg text-muted-foreground">
                            No events available at the moment.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
