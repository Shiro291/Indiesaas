import { db } from "@/database/db"
import {
    events,
    eventCategories,
    tickets,
    eventStatistics,
    categories
} from "@/database/schema"
import { and, eq, gte, ilike, lt, lte, sql } from "drizzle-orm"
import type { PgTransaction } from "drizzle-orm/pg-core"
import type { InferSelectModel } from "drizzle-orm"
import { randomUUID } from "crypto"

type EventWithCategoriesAndTickets = InferSelectModel<typeof events> & {
    categories: (InferSelectModel<typeof eventCategories> & {
        category: InferSelectModel<typeof categories>
    })[]
    tickets: InferSelectModel<typeof tickets>[]
}

interface CreateEventRequest {
    title: string
    description: string
    startDate: Date
    endDate: Date
    registrationOpenDate: Date
    registrationCloseDate: Date
    location: string
    image?: string
    maxCapacity: number
    adminFee: number
    categoryIds: number[]
    tickets: {
        name: string
        description?: string
        price: number // in cents
        availableFrom: Date
        availableUntil: Date
        maxCapacity: number
        type: "ONLINE" | "ONSITE"
    }[]
}

interface UpdateEventRequest extends Partial<CreateEventRequest> {
    id: number
}

export class EventService {
    /**
     * Create a new event with categories and tickets
     */
    async createEvent(request: CreateEventRequest) {
        return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
            // Generate unique event ID
            const eventId = `evt-${Date.now()}-${randomUUID().slice(0, 8)}`

            // Insert event
            const [newEvent] = await tx
                .insert(events)
                .values({
                    title: request.title,
                    description: request.description,
                    startDate: request.startDate,
                    endDate: request.endDate,
                    registrationOpenDate: request.registrationOpenDate,
                    registrationCloseDate: request.registrationCloseDate,
                    location: request.location,
                    image: request.image,
                    eventId,
                    maxCapacity: request.maxCapacity,
                    adminFee: request.adminFee,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })
                .returning()

            // Insert event categories
            if (request.categoryIds && request.categoryIds.length > 0) {
                const eventCategoryValues = request.categoryIds.map(
                    (categoryId) => ({
                        eventId: newEvent.id,
                        categoryId
                    })
                )
                await tx.insert(eventCategories).values(eventCategoryValues)
            }

            // Insert tickets
            if (request.tickets && request.tickets.length > 0) {
                const ticketValues = request.tickets.map((ticket) => ({
                    eventId: newEvent.id,
                    name: ticket.name,
                    description: ticket.description,
                    price: ticket.price,
                    availableFrom: ticket.availableFrom,
                    availableUntil: ticket.availableUntil,
                    maxCapacity: ticket.maxCapacity,
                    type: ticket.type,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }))
                await tx.insert(tickets).values(ticketValues)
            }

            return newEvent
        })
    }

    /**
     * Update an existing event
     */
    async updateEvent(request: UpdateEventRequest) {
        return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
            // Update event details
            const [updatedEvent] = await tx
                .update(events)
                .set({
                    title: request.title,
                    description: request.description,
                    startDate: request.startDate,
                    endDate: request.endDate,
                    registrationOpenDate: request.registrationOpenDate,
                    registrationCloseDate: request.registrationCloseDate,
                    location: request.location,
                    image: request.image,
                    maxCapacity: request.maxCapacity,
                    adminFee: request.adminFee,
                    updatedAt: new Date()
                })
                .where(eq(events.id, request.id))
                .returning()

            // Update categories if provided
            if (request.categoryIds) {
                // First delete existing categories for this event
                await tx
                    .delete(eventCategories)
                    .where(eq(eventCategories.eventId, request.id))

                // Then add new categories
                if (request.categoryIds.length > 0) {
                    const eventCategoryValues = request.categoryIds.map(
                        (categoryId) => ({
                            eventId: request.id,
                            categoryId
                        })
                    )
                    await tx.insert(eventCategories).values(eventCategoryValues)
                }
            }

            // Update tickets if provided
            if (request.tickets) {
                // First delete existing tickets for this event
                await tx.delete(tickets).where(eq(tickets.eventId, request.id))

                // Then add new tickets
                if (request.tickets.length > 0) {
                    const ticketValues = request.tickets.map((ticket) => ({
                        eventId: request.id,
                        name: ticket.name,
                        description: ticket.description,
                        price: ticket.price,
                        availableFrom: ticket.availableFrom,
                        availableUntil: ticket.availableUntil,
                        maxCapacity: ticket.maxCapacity,
                        type: ticket.type,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }))
                    await tx.insert(tickets).values(ticketValues)
                }
            }

            return updatedEvent
        })
    }

    /**
     * Get events with optional search and filtering
     */
    async getEvents(search?: string, categoryIds?: number[], status?: string) {
        const now = new Date()
        const conditions = []

        if (search) {
            conditions.push(ilike(events.title, `%${search}%`))
        }

        if (status) {
            if (status === "OPEN") {
                conditions.push(
                    and(
                        lte(events.registrationOpenDate, now),
                        gte(events.registrationCloseDate, now)
                    )
                )
            } else if (status === "CLOSED") {
                conditions.push(lt(events.registrationCloseDate, now))
            } else {
                conditions.push(eq(events.status, status as "ACTIVE" | "ARCHIVED"))
            }
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        // Get events without statistics to avoid potential issues with missing statistics
        const eventResults = await db.query.events.findMany({
            where: whereClause,
            with: {
                categories: {
                    with: {
                        category: true
                    }
                },
                tickets: true
            },
            orderBy: (fields, { desc }) => [desc(fields.createdAt)]
        }) as EventWithCategoriesAndTickets[]

        // Get the event IDs to fetch their statistics separately
        const eventIds = eventResults.map(event => event.id);

        // Fetch statistics separately to handle cases where statistics might not exist
        let eventStats: { eventId: number; totalRegistrations: number }[] = [];
        if (eventIds.length > 0) {
            eventStats = await db.select({
                eventId: eventStatistics.eventId,
                totalRegistrations: eventStatistics.totalRegistrations
            }).from(eventStatistics).where(
                sql`event_id IN (${sql.join(eventIds.map(id => sql`${id}`), sql`, `)})`
            );
        }

        // Create a map for quick lookup of statistics by event ID
        const statsMap = new Map(eventStats.map(stat => [stat.eventId, stat.totalRegistrations]));

        // Filter by category IDs if specified
        if (categoryIds && categoryIds.length > 0) {
            return eventResults.filter((event: EventWithCategoriesAndTickets) =>
                event.categories.some((ec: InferSelectModel<typeof eventCategories>) =>
                    categoryIds.includes(ec.categoryId)
                )
            )
        }

        // Add currentRegistrations property based on statistics
        return eventResults.map((event: EventWithCategoriesAndTickets) => ({
            ...event,
            currentRegistrations: statsMap.get(event.id) || 0
        }))
    }

    /**
     * Get event by ID
     */
    async getEventById(id: number) {
        return await db.query.events.findFirst({
            where: eq(events.id, id),
            with: {
                categories: {
                    with: {
                        category: true
                    }
                },
                tickets: true
            }
        })
    }

    /**
     * Archive an event
     */
    async archiveEvent(id: number) {
        await db
            .update(events)
            .set({
                status: "ARCHIVED",
                updatedAt: new Date()
            })
            .where(eq(events.id, id))
    }

    /**
     * Delete an event and all related data
     */
    async deleteEvent(id: number) {
        return await db.transaction(async (tx: PgTransaction<any, any, any>) => {
            // Delete all related data first
            await tx
                .delete(eventCategories)
                .where(eq(eventCategories.eventId, id))
            await tx.delete(tickets).where(eq(tickets.eventId, id))
            await tx
                .delete(eventStatistics)
                .where(eq(eventStatistics.eventId, id))

            // Finally delete the event
            await tx.delete(events).where(eq(events.id, id))
        })
    }

    /**
     * Get events for admin dashboard
     */
    async getAdminEvents() {
        return await db.query.events.findMany({
            with: {
                categories: {
                    with: {
                        category: true
                    }
                }
            },
            orderBy: (fields, { desc }) => [desc(fields.createdAt)]
        }) as (InferSelectModel<typeof events> & {
            categories: (InferSelectModel<typeof eventCategories> & {
                category: InferSelectModel<typeof categories>
            })[]
        })[]
    }

    /**
     * Get event statistics
     */
    async getEventStatistics(eventId: number) {
        return await db.query.eventStatistics.findFirst({
            where: eq(eventStatistics.eventId, eventId)
        })
    }
}

export const eventService = new EventService()
