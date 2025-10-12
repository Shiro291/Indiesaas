"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, CreditCard, Download } from "lucide-react";
import Link from "next/link";
import { useSession } from "@daveyplate/better-auth-ui/react";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location: string;
  image?: string;
  maxCapacity: number;
  currentRegistrations: number;
  categories: {
    category: {
      name: string;
    };
  }[];
}

interface Registration {
  id: number;
  registrationNumber: string;
  event: Event;
  status: string; // PENDING, CONFIRMED, CANCELLED
  paymentStatus: string; // PENDING, PAID, FAILED
  totalAmount: number; // in cents
  createdAt: string;
  attendees: {
    fullName: string;
    ageCategory: string;
    beltLevel: string;
  }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's registrations from API
    const fetchRegistrations = async () => {
      if (!session) return;
      
      try {
        const response = await fetch(`/api/dashboard/registrations`);
        if (!response.ok) {
          throw new Error('Failed to fetch registrations');
        }
        const data = await response.json();
        setRegistrations(data.registrations || []);
      } catch (error) {
        console.error("Error fetching registrations:", error);
        // For now, we'll set an empty array, but in a real app you might want to show an error message
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchRegistrations();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
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
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {session.user.name || session.user.email.split('@')[0]}</h1>
        <p className="text-muted-foreground">Manage your event registrations and account</p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading your registrations...</div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Registrations</h2>
            
            {registrations.length === 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>No Registrations</CardTitle>
                  <CardDescription>
                    You haven't registered for any events yet. Browse events to get started!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link href="/events">Browse Events</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registrations.map(registration => (
                  <Card key={registration.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{registration.event.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Registration: {registration.registrationNumber}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={
                            registration.status === "CONFIRMED" ? "default" : 
                            registration.status === "PENDING" ? "secondary" : 
                            "destructive"
                          }
                        >
                          {registration.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(registration.event.startDate).toLocaleDateString()} - {new Date(registration.event.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          {registration.event.location}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span className={registration.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}>
                            {registration.paymentStatus}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="mr-2 h-4 w-4" />
                          {registration.attendees.length} attendee{registration.attendees.length !== 1 ? 's' : ''}
                        </div>
                        
                        <div className="pt-2 border-t">
                          <h4 className="font-medium mb-2">Attendees</h4>
                          <div className="space-y-1">
                            {registration.attendees.map((attendee, index) => (
                              <div key={index} className="text-sm">
                                <p>{attendee.fullName}</p>
                                <p className="text-muted-foreground">
                                  {attendee.ageCategory} | {attendee.beltLevel}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-3">
                          <Button asChild size="sm">
                            <Link href={`/events/${registration.event.id}`}>
                              View Event
                            </Link>
                          </Button>
                          
                          {registration.paymentStatus !== "PAID" && (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/registration/${registration.id}/status`}>
                                Complete Payment
                              </Link>
                            </Button>
                          )}
                          
                          <Button size="sm" variant="outline">
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
  );
}