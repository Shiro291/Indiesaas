"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { authClient } from "@/lib/auth-client";
// Session is obtained via authClient.useSession()
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/uploadthing";

interface Ticket {
  id: number;
  name: string;
  description?: string;
  price: number; // in cents
  availableFrom: string;
  availableUntil: string;
  maxCapacity: number;
  type: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  location: string;
  maxCapacity: number;
  adminFee: number;
  categories: { category: { name: string } }[];
  tickets: Ticket[];
  isRegistrationOpen: boolean;
}

interface FormData {
  gender: string;
  ageCategory: string;
  beltLevel: string;
  phoneNumber: string;
  biodataUrl?: string;
  consentUrl?: string;
}

export default function EventRegistrationPage({ params }: { params: { id: string } }) {
  const eventId = parseInt(params.id);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendeeData, setAttendeeData] = useState<FormData[]>([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [step, setStep] = useState(1); // 1: Ticket selection, 2: Attendee details, 3: Payment
  const [selectedTickets, setSelectedTickets] = useState<{[key: number]: number}>({});
  
  const { data: session } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    // In a real app, this would fetch from API
    const mockEvent: Event = {
      id: eventId,
      title: "Pencak Silat Championship 2025",
      description: "Annual championship for Pencak Silat practitioners of all levels.",
      startDate: "2025-03-15T09:00:00.000Z",
      endDate: "2025-03-17T18:00:00.000Z",
      registrationOpenDate: "2025-01-01T00:00:00.000Z",
      registrationCloseDate: "2025-03-10T23:59:59.000Z",
      location: "Jakarta Convention Center",
      maxCapacity: 500,
      adminFee: 15000,
      categories: [
        { category: { name: "Martial Arts" } },
        { category: { name: "Competition" } }
      ],
      tickets: [
        {
          id: 1,
          name: "General Admission",
          description: "Standard entry ticket",
          price: 100000,
          availableFrom: "2025-01-01T00:00:00.000Z",
          availableUntil: "2025-03-10T23:59:59.000Z",
          maxCapacity: 400,
          type: "ONLINE"
        },
        {
          id: 2,
          name: "VIP",
          description: "Premium entry with reserved seating",
          price: 250000,
          availableFrom: "2025-01-01T00:00:00.000Z",
          availableUntil: "2025-03-10T23:59:59.000Z",
          maxCapacity: 50,
          type: "ONLINE"
        }
      ],
      isRegistrationOpen: true
    };

    setEvent(mockEvent);
    setLoading(false);
    
    // Initialize selected tickets
    const initialSelection: {[key: number]: number} = {};
    mockEvent.tickets.forEach(ticket => {
      initialSelection[ticket.id] = 0;
    });
    setSelectedTickets(initialSelection);
    
    // Initialize attendee data with one empty form
    setAttendeeData([{
      gender: "",
      ageCategory: "",
      beltLevel: "",
      phoneNumber: "",
      biodataUrl: undefined,
      consentUrl: undefined
    }]);
  }, [eventId]);

  useEffect(() => {
    // Calculate total attendees when tickets change
    const total = Object.values(selectedTickets).reduce((sum, count) => sum + count, 0);
    setTotalAttendees(total);
    
    // Update attendee data array when total changes
    if (total > attendeeData.length) {
      const newAttendeeData = [...attendeeData];
      for (let i = attendeeData.length; i < total; i++) {
        newAttendeeData.push({
          gender: "",
          ageCategory: "",
          beltLevel: "",
          phoneNumber: "",
          biodataUrl: undefined,
          consentUrl: undefined
        });
      }
      setAttendeeData(newAttendeeData);
    } else if (total < attendeeData.length) {
      const newAttendeeData = attendeeData.slice(0, total);
      setAttendeeData(newAttendeeData);
    }
  }, [selectedTickets, attendeeData.length]);

  const handleTicketChange = (ticketId: number, value: number) => {
    if (value < 0) return;
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: value
    }));
  };

  const handleAttendeeChange = (index: number, field: keyof FormData, value: string) => {
    const newAttendeeData = [...attendeeData];
    newAttendeeData[index] = {
      ...newAttendeeData[index],
      [field]: value
    };
    setAttendeeData(newAttendeeData);
  };

  const handleFileUpload = (index: number, field: 'biodataUrl' | 'consentUrl', url: string) => {
    const newAttendeeData = [...attendeeData];
    newAttendeeData[index] = {
      ...newAttendeeData[index],
      [field]: url
    };
    setAttendeeData(newAttendeeData);
  };

  const handleRegister = async () => {
    if (!session) {
      router.push('/auth/sign-in');
      return;
    }

    if (totalAttendees === 0) {
      alert("Please select at least one ticket");
      return;
    }

    // Validate attendee data
    for (let i = 0; i < attendeeData.length; i++) {
      if (!attendeeData[i].gender || !attendeeData[i].ageCategory || 
          !attendeeData[i].beltLevel || !attendeeData[i].phoneNumber) {
        alert(`Please fill in all required fields for attendee ${i + 1}`);
        return;
      }
    }

    try {
      // Prepare ticket selections
      const ticketSelections = Object.entries(selectedTickets)
        .filter(([_, count]) => count > 0)
        .map(([ticketId, count]) => ({
          ticketId: parseInt(ticketId),
          quantity: count
        }));

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': document.cookie
        },
        body: JSON.stringify({
          ticketSelections,
          attendeesData: attendeeData.map(attendee => ({
            fullName: session.user.name || session.user.email.split('@')[0],
            ...attendee
          })),
          paymentMethod
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      const result = await response.json();
      
      if (paymentMethod === 'ONLINE' && result.paymentUrl) {
        // Redirect to payment
        window.location.href = result.paymentUrl;
      } else {
        // For offline payment, show confirmation
        router.push(`/registration/${result.registrationId}/status`);
      }
    } catch (error: any) {
      alert(`Registration failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="text-center">Loading registration...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-8">
        <div className="text-center">Event not found</div>
      </div>
    );
  }

  const ticketSelections = Object.entries(selectedTickets)
    .filter(([_, count]) => count > 0)
    .map(([ticketId, count]) => {
      const ticket = event.tickets.find(t => t.id === parseInt(ticketId));
      return ticket ? { ticket, count } : null;
    })
    .filter(Boolean) as { ticket: Ticket; count: number }[];

  const subtotal = ticketSelections.reduce(
    (sum, { ticket, count }) => sum + (ticket.price * count), 
    0
  );
  const total = subtotal + event.adminFee;

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <p className="text-muted-foreground">Complete your registration</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className={`flex flex-col items-center ${step === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 1 ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground'}`}>
              1
            </div>
            <span className="mt-2 text-sm">Select Tickets</span>
          </div>
          <div className="flex-1 h-px bg-muted-foreground/20 mx-4"></div>
          <div className={`flex flex-col items-center ${step === 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground'}`}>
              2
            </div>
            <span className="mt-2 text-sm">Attendee Details</span>
          </div>
          <div className="flex-1 h-px bg-muted-foreground/20 mx-4"></div>
          <div className={`flex flex-col items-center ${step === 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step === 3 ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground'}`}>
              3
            </div>
            <span className="mt-2 text-sm">Payment</span>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Registration Steps</CardTitle>
            <CardDescription>
              Complete the following steps to register for the event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Select Tickets</h3>
                <div className="space-y-4">
                  {event.tickets.map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{ticket.name}</h4>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        <p className="text-sm font-medium">Rp. {(ticket.price / 100).toLocaleString('id-ID')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleTicketChange(ticket.id, selectedTickets[ticket.id] - 1)}
                          disabled={selectedTickets[ticket.id] <= 0}
                        >
                          -
                        </Button>
                        <span className="text-lg w-8 text-center">{selectedTickets[ticket.id]}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleTicketChange(ticket.id, selectedTickets[ticket.id] + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={() => setStep(2)} disabled={totalAttendees === 0}>
                    Continue to Attendee Details
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Attendee Details</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please provide details for each attendee (you selected {totalAttendees} ticket{totalAttendees !== 1 ? 's' : ''}).
                </p>
                
                {attendeeData.map((attendee, index) => (
                  <Card key={index} className="mb-6">
                    <CardHeader>
                      <CardTitle>Attendee {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <RadioGroup 
                            value={attendee.gender} 
                            onValueChange={(value) => handleAttendeeChange(index, 'gender', value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id={`gender-${index}-male`} />
                              <Label htmlFor={`gender-${index}-male`}>Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id={`gender-${index}-female`} />
                              <Label htmlFor={`gender-${index}-female`}>Female</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Age Category</Label>
                          <Select value={attendee.ageCategory} onValueChange={(value) => handleAttendeeChange(index, 'ageCategory', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TK">TK (Kindergarten)</SelectItem>
                              <SelectItem value="SD">SD (Elementary)</SelectItem>
                              <SelectItem value="SMP">SMP (Junior High)</SelectItem>
                              <SelectItem value="SMA">SMA (Senior High)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Belt Level</Label>
                          <Select value={attendee.beltLevel} onValueChange={(value) => handleAttendeeChange(index, 'beltLevel', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select belt level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DASAR">DASAR</SelectItem>
                              <SelectItem value="MC_I">MC I</SelectItem>
                              <SelectItem value="MC_II">MC II</SelectItem>
                              <SelectItem value="MC_III">MC III</SelectItem>
                              <SelectItem value="MC_IV">MC IV</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input
                            value={attendee.phoneNumber}
                            onChange={(e) => handleAttendeeChange(index, 'phoneNumber', e.target.value)}
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Label>Biodata Document</Label>
                        <UploadDropzone
                          endpoint="biodataUploader"
                          onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                              handleFileUpload(index, 'biodataUrl', res[0].url);
                            }
                          }}
                          onUploadError={(error: Error) => {
                            alert(`Upload error: ${error.message}`);
                          }}
                        />
                        {attendee.biodataUrl && (
                          <p className="text-sm text-green-600 mt-1">Uploaded: {attendee.biodataUrl}</p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <Label>Parental Consent (if under 18)</Label>
                        <UploadDropzone
                          endpoint="consentUploader" 
                          onClientUploadComplete={(res) => {
                            if (res && res[0]) {
                              handleFileUpload(index, 'consentUrl', res[0].url);
                            }
                          }}
                          onUploadError={(error: Error) => {
                            alert(`Upload error: ${error.message}`);
                          }}
                        />
                        {attendee.consentUrl && (
                          <p className="text-sm text-green-600 mt-1">Uploaded: {attendee.consentUrl}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Continue to Payment</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-lg font-medium mb-4">Payment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {ticketSelections.map(({ ticket, count }) => (
                            <div key={ticket.id} className="flex justify-between">
                              <span>{ticket.name} x{count}</span>
                              <span>Rp. {((ticket.price * count) / 100).toLocaleString('id-ID')}</span>
                            </div>
                          ))}
                          <div className="flex justify-between">
                            <span>Admin Fee</span>
                            <span>Rp. {(event.adminFee / 100).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>Total</span>
                            <span>Rp. {(total / 100).toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RadioGroup value={paymentMethod} onValueChange={(value: "ONLINE" | "OFFLINE") => setPaymentMethod(value)}>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="ONLINE" id="online-payment" />
                              <Label htmlFor="online-payment">Online Payment (via Ipaymu)</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="OFFLINE" id="offline-payment" />
                              <Label htmlFor="offline-payment">Offline Payment</Label>
                            </div>
                          </div>
                        </RadioGroup>
                        
                        {paymentMethod === "OFFLINE" && (
                          <div className="mt-4 p-3 bg-muted rounded-md">
                            <p className="text-sm">Payment instructions will be sent to your email after registration.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Complete Registration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">By continuing, you agree to:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                              <li>Provide accurate information for all attendees</li>
                              <li>Follow the event's code of conduct</li>
                              <li>Pay the full amount as indicated above</li>
                            </ul>
                          </div>
                          
                          <Button className="w-full" onClick={handleRegister}>
                            {paymentMethod === "ONLINE" 
                              ? `Pay Rp. ${(total / 100).toLocaleString('id-ID')} Now` 
                              : "Complete Registration"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}