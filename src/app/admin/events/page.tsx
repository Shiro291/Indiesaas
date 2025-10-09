"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, MapPin, Users, Plus, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location: string;
  maxCapacity: number;
  currentRegistrations: number;
  status: string; // ACTIVE, ARCHIVED
  categories: {
    category: {
      name: string;
    };
  }[];
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // In a real application, this would fetch events from the API
    // For this example, using mock data
    setTimeout(() => {
      setEvents([
        {
          id: 1,
          title: "Pencak Silat Championship 2025",
          description: "Annual championship for Pencak Silat practitioners",
          startDate: "2025-03-15T09:00:00.000Z",
          endDate: "2025-03-17T18:00:00.000Z",
          location: "Jakarta Convention Center",
          maxCapacity: 500,
          currentRegistrations: 120,
          status: "ACTIVE",
          categories: [
            { category: { name: "Martial Arts" } },
            { category: { name: "Competition" } }
          ]
        },
        {
          id: 2,
          title: "Indonesian Karate Tournament",
          description: "National karate tournament",
          startDate: "2025-04-20T09:00:00.000Z",
          endDate: "2025-04-22T18:00:00.000Z",
          location: "Gelora Bung Karno",
          maxCapacity: 300,
          currentRegistrations: 80,
          status: "ACTIVE",
          categories: [
            { category: { name: "Karate" } },
            { category: { name: "Competition" } }
          ]
        },
        {
          id: 3,
          title: "Taekwondo Youth Cup",
          description: "International youth taekwondo competition",
          startDate: "2025-05-10T09:00:00.000Z",
          endDate: "2025-05-12T18:00:00.000Z",
          location: "Indonesia Arena",
          maxCapacity: 200,
          currentRegistrations: 180,
          status: "ARCHIVED",
          categories: [
            { category: { name: "Taekwondo" } },
            { category: { name: "Youth" } }
          ]
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Filter events based on search
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manage Events</h1>
            <p className="text-muted-foreground">Create, edit, and manage events</p>
          </div>
          <Button asChild>
            <Link href="/admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
        <div className="text-center py-8">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <p className="text-muted-foreground">Create, edit, and manage events</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Button asChild>
            <Link href="/admin/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Events Found</CardTitle>
            <CardDescription>
              {searchQuery ? "No events match your search query." : "You haven't created any events yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/events/new">Create Your First Event</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <Card key={event.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge 
                      variant={event.status === "ACTIVE" ? "default" : "secondary"}
                      className="mt-2"
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="line-clamp-2 mt-2">
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
                    {format(new Date(event.startDate), 'MMM d, yyyy')} - {format(new Date(event.endDate), 'MMM d, yyyy')}
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
                
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/events/${event.id}`}>View</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/events/${event.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}