"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Download } from "lucide-react"

interface Registration {
    id: number
    registrationNumber: string
    user: {
        name: string
        email: string
    }
    attendees: {
        fullName: string
        gender: string
        ageCategory: string
        beltLevel: string
        phoneNumber: string
        ticket: {
            name: string
        }
    }[]
    status: string // PENDING, CONFIRMED, CANCELLED
    paymentStatus: string // PENDING, PAID, FAILED
    totalAmount: number // in cents
    createdAt: string
}

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterAgeCategory, setFilterAgeCategory] = useState("")
    const [filterBeltLevel, setFilterBeltLevel] = useState("")

    useEffect(() => {
        // In a real application, this would fetch registrations from the API
        // For this example, using mock data
        setTimeout(() => {
            setRegistrations([
                {
                    id: 1,
                    registrationNumber: "REG-12345-ABC",
                    user: {
                        name: "John Doe",
                        email: "john@example.com"
                    },
                    attendees: [
                        {
                            fullName: "Alice Johnson",
                            gender: "female",
                            ageCategory: "SMA",
                            beltLevel: "MC_I",
                            phoneNumber: "081234567890",
                            ticket: {
                                name: "General Admission"
                            }
                        },
                        {
                            fullName: "Bob Smith",
                            gender: "male",
                            ageCategory: "SMP",
                            beltLevel: "DASAR",
                            phoneNumber: "081234567891",
                            ticket: {
                                name: "General Admission"
                            }
                        }
                    ],
                    status: "CONFIRMED",
                    paymentStatus: "PAID",
                    totalAmount: 115000, // 115,000 IDR in cents
                    createdAt: "2024-12-10T10:30:00.000Z"
                },
                {
                    id: 2,
                    registrationNumber: "REG-67890-DEF",
                    user: {
                        name: "Jane Smith",
                        email: "jane@example.com"
                    },
                    attendees: [
                        {
                            fullName: "Charlie Brown",
                            gender: "male",
                            ageCategory: "SD",
                            beltLevel: "DASAR",
                            phoneNumber: "081234567892",
                            ticket: {
                                name: "VIP"
                            }
                        }
                    ],
                    status: "PENDING",
                    paymentStatus: "PENDING",
                    totalAmount: 250000, // 250,000 IDR in cents
                    createdAt: "2024-12-15T14:20:00.000Z"
                }
            ])
            setLoading(false)
        }, 500)
    }, [])

    // Filter registrations based on search and filters
    const filteredRegistrations = registrations.filter((reg) => {
        const matchesSearch =
            reg.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            reg.registrationNumber
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            reg.attendees.some((attendee) =>
                attendee.fullName
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            )

        const matchesAgeCategory =
            filterAgeCategory === "" ||
            reg.attendees.some(
                (attendee) => attendee.ageCategory === filterAgeCategory
            )

        const matchesBeltLevel =
            filterBeltLevel === "" ||
            reg.attendees.some(
                (attendee) => attendee.beltLevel === filterBeltLevel
            )

        return matchesSearch && matchesAgeCategory && matchesBeltLevel
    })

    const ageCategories = ["TK", "SD", "SMP", "SMA"]
    const beltLevels = ["DASAR", "MC_I", "MC_II", "MC_III", "MC_IV"]

    if (loading) {
        return (
            <div className="p-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-3xl">Registrations</h1>
                        <p className="text-muted-foreground">
                            Manage event registrations
                        </p>
                    </div>
                </div>
                <div className="py-8 text-center">Loading registrations...</div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="font-bold text-3xl">Registrations</h1>
                    <p className="text-muted-foreground">
                        Manage event registrations
                    </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <div>
                        <h3 className="font-medium">Filters</h3>
                    </div>
                    <div>
                        <Input
                            placeholder="Search registrations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div>
                        <Select
                            value={filterAgeCategory}
                            onValueChange={setFilterAgeCategory}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by age category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Categories</SelectItem>
                                {ageCategories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Select
                            value={filterBeltLevel}
                            onValueChange={setFilterBeltLevel}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by belt level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Belts</SelectItem>
                                {beltLevels.map((belt) => (
                                    <SelectItem key={belt} value={belt}>
                                        {belt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            <div className="mt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Registration #</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Attendees</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRegistrations.map((registration) => (
                            <TableRow key={registration.id}>
                                <TableCell className="font-medium">
                                    {registration.registrationNumber}
                                </TableCell>
                                <TableCell>
                                    <div>{registration.user.name}</div>
                                    <div className="text-muted-foreground text-sm">
                                        {registration.user.email}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {registration.attendees.map(
                                        (attendee, index) => (
                                            <div
                                                key={index}
                                                className="mb-2 last:mb-0"
                                            >
                                                <div>{attendee.fullName}</div>
                                                <div className="text-muted-foreground text-sm">
                                                    {attendee.ageCategory} |{" "}
                                                    {attendee.beltLevel}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            registration.status === "CONFIRMED"
                                                ? "default"
                                                : registration.status ===
                                                    "PENDING"
                                                  ? "secondary"
                                                  : "destructive"
                                        }
                                    >
                                        {registration.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    Rp.{" "}
                                    {(
                                        registration.totalAmount / 100
                                    ).toLocaleString("id-ID")}
                                </TableCell>
                                <TableCell>
                                    {new Date(
                                        registration.createdAt
                                    ).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredRegistrations.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">
                        No registrations match your filters
                    </div>
                )}
            </div>
        </div>
    )
}
