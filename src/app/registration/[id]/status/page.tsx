"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RegistrationStatusPage({ params }: { params: { id: string } }) {
  const registrationId = params.id;
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch registration details from the API
    // For this example, we'll simulate with mock data
    setTimeout(() => {
      setRegistration({
        id: registrationId,
        registrationNumber: "REG-12345-ABC",
        eventName: "Pencak Silat Championship 2025",
        eventDate: "2025-03-15",
        totalAmount: 115000, // 115,000 IDR in cents
        paymentStatus: "PENDING", // Options: PENDING, PAID, FAILED
        status: "PENDING", // Options: PENDING, CONFIRMED, CANCELLED
        attendees: [
          { fullName: "John Doe", ageCategory: "SMA", beltLevel: "MC_I" },
          { fullName: "Jane Smith", ageCategory: "SMP", beltLevel: "DASAR" }
        ]
      });
      setLoading(false);
    }, 500);
  }, [registrationId]);

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading registration status...</p>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <CardTitle>Registration Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">We couldn't find registration with ID: {registrationId}</p>
            <Button asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  let statusIcon, statusText, statusColor, statusDescription;
  
  switch (registration.paymentStatus) {
    case "PAID":
    case "CONFIRMED":
      statusIcon = <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />;
      statusText = "Registration Confirmed!";
      statusColor = "text-green-600";
      statusDescription = "Your payment has been processed successfully. Your registration is confirmed!";
      break;
    case "FAILED":
      statusIcon = <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />;
      statusText = "Payment Failed";
      statusColor = "text-destructive";
      statusDescription = "Your payment could not be processed. Please try again.";
      break;
    case "PENDING":
    default:
      statusIcon = <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />;
      statusText = "Registration Pending";
      statusColor = "text-yellow-600";
      statusDescription = "We're waiting for your payment to be processed.";
      break;
  }

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          {statusIcon}
          <CardTitle className={statusColor}>{statusText}</CardTitle>
          <p className="text-muted-foreground">{statusDescription}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium">Registration Number</h3>
              <p className="text-muted-foreground">{registration.registrationNumber}</p>
            </div>
            <div>
              <h3 className="font-medium">Payment Status</h3>
              <p className="text-muted-foreground capitalize">{registration.paymentStatus}</p>
            </div>
            <div>
              <h3 className="font-medium">Event</h3>
              <p className="text-muted-foreground">{registration.eventName}</p>
            </div>
            <div>
              <h3 className="font-medium">Event Date</h3>
              <p className="text-muted-foreground">{new Date(registration.eventDate).toLocaleDateString()}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-medium">Total Amount</h3>
              <p className="text-muted-foreground">Rp. {(registration.totalAmount / 100).toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-2">Attendees</h3>
            <div className="space-y-2">
              {registration.attendees.map((attendee: any, index: number) => (
                <div key={index} className="flex justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{attendee.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {attendee.ageCategory} | {attendee.beltLevel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            
            {registration.paymentStatus === "PENDING" && (
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/events/${registrationId}/payment`}>Complete Payment</Link>
              </Button>
            )}
            
            <Button asChild variant="outline" className="flex-1">
              <Link href="/events">Browse More Events</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}