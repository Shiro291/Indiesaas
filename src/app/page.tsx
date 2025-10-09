import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

// Mock data for events
const mockEvents = [
  {
    id: 1,
    title: "Pencak Silat Championship 2025",
    description: "Annual championship for Pencak Silat practitioners of all levels",
    startDate: new Date("2025-03-15"),
    endDate: new Date("2025-03-17"),
    location: "Jakarta Convention Center",
    image: "/placeholder-event.jpg",
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
    description: "National karate tournament for junior and senior categories",
    startDate: new Date("2025-04-20"),
    endDate: new Date("2025-04-22"),
    location: "Gelora Bung Karno",
    image: "/placeholder-event.jpg",
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
    startDate: new Date("2025-05-10"),
    endDate: new Date("2025-05-12"),
    location: "Indonesia Arena",
    image: "/placeholder-event.jpg",
    maxCapacity: 200,
    currentRegistrations: 150,
    categories: [
      { category: { name: "Taekwondo" } },
      { category: { name: "Youth" } }
    ]
  }
];

export default function HomePage() {
  return (
    <div className="container py-8">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Discover Amazing Events
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Find and register for exciting events happening across Indonesia. From martial arts tournaments to cultural festivals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="aspect-video bg-muted">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">No image</span>
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{event.title}</CardTitle>
                <Badge variant="secondary">
                  {Math.round((event.currentRegistrations / event.maxCapacity) * 100)}% Full
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {event.categories.map((cat, index) => (
                  <Badge key={index} variant="outline">
                    {cat.category.name}
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  {event.currentRegistrations} of {event.maxCapacity} registered
                </div>
              </div>
              
              <Button asChild className="w-full">
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}