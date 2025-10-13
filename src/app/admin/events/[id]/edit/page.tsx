"use client"

import { useState, useEffect } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Plus, Minus } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Category {
    id: number
    name: string
    description?: string
}

interface Ticket {
    id?: number
    name: string
    description?: string
    price: number // in cents
    availableFrom: Date
    availableUntil: Date
    maxCapacity: number
    type: "ONLINE" | "ONSITE"
}

export default function AdminEventFormPage({
    params
}: {
    params: Promise<{ id?: string }>
}) {
    const resolvedParams = use(params);
    const eventId = resolvedParams.id ? parseInt(resolvedParams.id) : null
    const isEdit = !!eventId

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [registrationOpenDate, setRegistrationOpenDate] = useState<
        Date | undefined
    >(undefined)
    const [registrationCloseDate, setRegistrationCloseDate] = useState<
        Date | undefined
    >(undefined)
    const [location, setLocation] = useState("")
    const [image, setImage] = useState("")
    const [maxCapacity, setMaxCapacity] = useState(0)
    const [adminFee, setAdminFee] = useState(0)
    const [selectedCategories, setSelectedCategories] = useState<number[]>([])
    const [tickets, setTickets] = useState<Ticket[]>([
        {
            name: "",
            description: "",
            price: 0,
            availableFrom: new Date(),
            availableUntil: new Date(),
            maxCapacity: 0,
            type: "ONLINE"
        }
    ])

    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // In a real application, this would fetch categories and event details if editing
        // For this example, using mock data
        setTimeout(() => {
            setCategories([
                { id: 1, name: "Martial Arts" },
                { id: 2, name: "Competition" },
                { id: 3, name: "Youth" },
                { id: 4, name: "Adult" }
            ])

            // If editing, fetch event details
            if (isEdit) {
                // Mock data for editing
                setTitle("Pencak Silat Championship 2025")
                setDescription(
                    "Annual championship for Pencak Silat practitioners of all levels"
                )
                setStartDate(new Date("2025-03-15"))
                setEndDate(new Date("2025-03-17"))
                setRegistrationOpenDate(new Date("2025-01-01"))
                setRegistrationCloseDate(new Date("2025-03-10"))
                setLocation("Jakarta Convention Center")
                setMaxCapacity(500)
                setAdminFee(15000)
                setSelectedCategories([1, 2])
                setTickets([
                    {
                        id: 1,
                        name: "General Admission",
                        description: "Standard entry ticket",
                        price: 100000,
                        availableFrom: new Date("2025-01-01"),
                        availableUntil: new Date("2025-03-10"),
                        maxCapacity: 400,
                        type: "ONLINE"
                    },
                    {
                        id: 2,
                        name: "VIP",
                        description: "Premium entry with reserved seating",
                        price: 250000,
                        availableFrom: new Date("2025-01-01"),
                        availableUntil: new Date("2025-03-10"),
                        maxCapacity: 50,
                        type: "ONLINE"
                    }
                ])
            }

            setLoading(false)
        }, 500)
    }, [isEdit])

    const handleAddTicket = () => {
        setTickets([
            ...tickets,
            {
                name: "",
                description: "",
                price: 0,
                availableFrom: new Date(),
                availableUntil: new Date(),
                maxCapacity: 0,
                type: "ONLINE"
            }
        ])
    }

    const handleRemoveTicket = (index: number) => {
        if (tickets.length <= 1) return
        const newTickets = [...tickets]
        newTickets.splice(index, 1)
        setTickets(newTickets)
    }

    const handleTicketChange = (
        index: number,
        field: keyof Ticket,
        value: any
    ) => {
        const newTickets = [...tickets]
        ;(newTickets[index] as any)[field] = value
        setTickets(newTickets)
    }

    const handleCategoryToggle = (categoryId: number) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(
                selectedCategories.filter((id) => id !== categoryId)
            )
        } else {
            setSelectedCategories([...selectedCategories, categoryId])
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // In a real application, this would submit to the API
        console.log({
            title,
            description,
            startDate,
            endDate,
            registrationOpenDate,
            registrationCloseDate,
            location,
            image,
            maxCapacity,
            adminFee,
            categoryIds: selectedCategories,
            tickets
        })

        alert(
            isEdit
                ? "Event updated successfully!"
                : "Event created successfully!"
        )
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="mx-auto max-w-4xl">
                    <div className="py-8 text-center">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <h1 className="font-bold text-3xl">
                        {isEdit ? "Edit Event" : "Create New Event"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEdit
                            ? "Update the details of your event"
                            : "Create a new event for users to register"}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Event Details</CardTitle>
                            <CardDescription>
                                Basic information about the event
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="title">Event Title *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter event title"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">
                                    Description *
                                </Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Describe your event"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Start Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !startDate &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? (
                                                    format(startDate, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={startDate}
                                                onSelect={setStartDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div>
                                    <Label>End Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !endDate &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? (
                                                    format(endDate, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={endDate}
                                                onSelect={setEndDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Registration Open Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !registrationOpenDate &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {registrationOpenDate ? (
                                                    format(
                                                        registrationOpenDate,
                                                        "PPP"
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={registrationOpenDate}
                                                onSelect={
                                                    setRegistrationOpenDate
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div>
                                    <Label>Registration Close Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !registrationCloseDate &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {registrationCloseDate ? (
                                                    format(
                                                        registrationCloseDate,
                                                        "PPP"
                                                    )
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={registrationCloseDate}
                                                onSelect={
                                                    setRegistrationCloseDate
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    value={location}
                                    onChange={(e) =>
                                        setLocation(e.target.value)
                                    }
                                    placeholder="Event location"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="image">Event Image URL</Label>
                                <Input
                                    id="image"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    placeholder="URL to event banner/image"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label htmlFor="maxCapacity">
                                        Max Capacity *
                                    </Label>
                                    <Input
                                        id="maxCapacity"
                                        type="number"
                                        value={maxCapacity}
                                        onChange={(e) =>
                                            setMaxCapacity(
                                                Number(e.target.value)
                                            )
                                        }
                                        placeholder="Maximum attendees"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="adminFee">
                                        Admin Fee (IDR)
                                    </Label>
                                    <Input
                                        id="adminFee"
                                        type="number"
                                        value={adminFee / 100} // Convert from cents
                                        onChange={(e) =>
                                            setAdminFee(
                                                Number(e.target.value) * 100
                                            )
                                        } // Convert to cents
                                        placeholder="Admin fee in IDR"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Categories</CardTitle>
                            <CardDescription>
                                Assign categories to help users find your event
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`category-${category.id}`}
                                            checked={selectedCategories.includes(
                                                category.id
                                            )}
                                            onCheckedChange={() =>
                                                handleCategoryToggle(
                                                    category.id
                                                )
                                            }
                                        />
                                        <label
                                            htmlFor={`category-${category.id}`}
                                            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {category.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Tickets</CardTitle>
                            <CardDescription>
                                Create different ticket types for your event
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tickets.map((ticket, index) => (
                                <Card key={index} className="mb-4">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">
                                                Ticket {index + 1}
                                            </CardTitle>
                                            {tickets.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleRemoveTicket(
                                                            index
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label
                                                    htmlFor={`ticket-name-${index}`}
                                                >
                                                    Ticket Name *
                                                </Label>
                                                <Input
                                                    id={`ticket-name-${index}`}
                                                    value={ticket.name}
                                                    onChange={(e) =>
                                                        handleTicketChange(
                                                            index,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="e.g. General Admission"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <Label
                                                    htmlFor={`ticket-price-${index}`}
                                                >
                                                    Price (IDR)
                                                </Label>
                                                <Input
                                                    id={`ticket-price-${index}`}
                                                    type="number"
                                                    value={ticket.price / 100} // Convert from cents
                                                    onChange={(e) =>
                                                        handleTicketChange(
                                                            index,
                                                            "price",
                                                            Number(
                                                                e.target.value
                                                            ) * 100
                                                        )
                                                    } // Convert to cents
                                                    placeholder="Price in IDR"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label
                                                htmlFor={`ticket-description-${index}`}
                                            >
                                                Description
                                            </Label>
                                            <Textarea
                                                id={`ticket-description-${index}`}
                                                value={ticket.description}
                                                onChange={(e) =>
                                                    handleTicketChange(
                                                        index,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Describe this ticket type"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label>Available From</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !ticket.availableFrom &&
                                                                    "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {ticket.availableFrom ? (
                                                                format(
                                                                    ticket.availableFrom,
                                                                    "PPP"
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Pick a date
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                ticket.availableFrom
                                                            }
                                                            onSelect={(date) =>
                                                                handleTicketChange(
                                                                    index,
                                                                    "availableFrom",
                                                                    date
                                                                )
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div>
                                                <Label>Available Until</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !ticket.availableUntil &&
                                                                    "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {ticket.availableUntil ? (
                                                                format(
                                                                    ticket.availableUntil,
                                                                    "PPP"
                                                                )
                                                            ) : (
                                                                <span>
                                                                    Pick a date
                                                                </span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                ticket.availableUntil
                                                            }
                                                            onSelect={(date) =>
                                                                handleTicketChange(
                                                                    index,
                                                                    "availableUntil",
                                                                    date
                                                                )
                                                            }
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label
                                                    htmlFor={`ticket-capacity-${index}`}
                                                >
                                                    Max Capacity
                                                </Label>
                                                <Input
                                                    id={`ticket-capacity-${index}`}
                                                    type="number"
                                                    value={ticket.maxCapacity}
                                                    onChange={(e) =>
                                                        handleTicketChange(
                                                            index,
                                                            "maxCapacity",
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    placeholder="Max number of tickets"
                                                />
                                            </div>

                                            <div>
                                                <Label
                                                    htmlFor={`ticket-type-${index}`}
                                                >
                                                    Ticket Type
                                                </Label>
                                                <Select
                                                    value={ticket.type}
                                                    onValueChange={(
                                                        value:
                                                            | "ONLINE"
                                                            | "ONSITE"
                                                    ) =>
                                                        handleTicketChange(
                                                            index,
                                                            "type",
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select ticket type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ONLINE">
                                                            Online
                                                        </SelectItem>
                                                        <SelectItem value="ONSITE">
                                                            On-site
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddTicket}
                                className="w-full"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Another Ticket
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" type="button">
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isEdit ? "Update Event" : "Create Event"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
