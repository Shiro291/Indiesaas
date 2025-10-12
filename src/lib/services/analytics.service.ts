import { db } from "@/database/db";
import { 
  events, 
  registrations, 
  attendees, 
  eventStatistics,
  tickets
} from "@/database/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { subMonths, subWeeks, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

interface AnalyticsPeriod {
  period: "week" | "month" | "quarter" | "year" | "custom";
  startDate?: Date;
  endDate?: Date;
}

interface DashboardAnalytics {
  kpis: {
    totalEvents: number;
    totalRegistrations: number;
    totalRevenue: number;
    totalAttendees: number;
  };
  trends: {
    registrations: Array<{
      date: string;
      count: number;
    }>;
    revenue: Array<{
      date: string;
      amount: number;
    }>;
  };
  charts: {
    revenueByMonth: Array<{
      month: string;
      revenue: number;
    }>;
    registrationsByEvent: Array<{
      eventName: string;
      registrations: number;
    }>;
  };
}

interface AnalyticsReport {
  type: "revenue" | "registrations" | "events" | "attendees";
  data: any[];
  summary: {
    total: number;
    period: string;
  };
}

export class AnalyticsService {
  /**
   * Get dashboard analytics data
   */
  async getDashboardAnalytics(period: AnalyticsPeriod): Promise<DashboardAnalytics> {
    const { startDate, endDate } = this.getDateRange(period);

    // Get KPIs
    const [totalEvents, totalRegistrations, revenueResult, totalAttendees] = await Promise.all([
      // Total events
      db
        .select({ count: sql<number>`count(*)` })
        .from(events)
        .where(
          and(
            eq(events.status, "ACTIVE"),
            startDate ? gte(events.createdAt, startDate) : undefined,
            endDate ? lte(events.createdAt, endDate) : undefined
          )
        )
        .then(result => result[0]?.count || 0),

      // Total registrations
      db
        .select({ count: sql<number>`count(*)` })
        .from(registrations)
        .where(
          and(
            startDate ? gte(registrations.createdAt, startDate) : undefined,
            endDate ? lte(registrations.createdAt, endDate) : undefined
          )
        )
        .then(result => result[0]?.count || 0),

      // Total revenue
      db
        .select({ sum: sql<number>`sum(${registrations.totalAmount})` })
        .from(registrations)
        .where(
          and(
            eq(registrations.paymentStatus, "PAID"),
            startDate ? gte(registrations.createdAt, startDate) : undefined,
            endDate ? lte(registrations.createdAt, endDate) : undefined
          )
        )
        .then(result => result[0]?.sum || 0),

      // Total attendees
      db
        .select({ count: sql<number>`count(*)` })
        .from(attendees)
        .where(
          and(
            startDate ? gte(attendees.createdAt, startDate) : undefined,
            endDate ? lte(attendees.createdAt, endDate) : undefined
          )
        )
        .then(result => result[0]?.count || 0),
    ]);

    // Get registration trends (last 30 days)
    const registrationTrends = await db
      .select({
        date: sql<string>`DATE(${registrations.createdAt})`,
        count: sql<number>`COUNT(*)`
      })
      .from(registrations)
      .where(
        and(
          gte(registrations.createdAt, subDays(new Date(), 30)),
          eq(registrations.status, "CONFIRMED")
        )
      )
      .groupBy(sql`DATE(${registrations.createdAt})`)
      .orderBy(desc(sql`DATE(${registrations.createdAt})`))
      .limit(30);

    // Get revenue trends (last 30 days)
    const revenueTrends = await db
      .select({
        date: sql<string>`DATE(${registrations.createdAt})`,
        amount: sql<number>`SUM(${registrations.totalAmount})`
      })
      .from(registrations)
      .where(
        and(
          gte(registrations.createdAt, subDays(new Date(), 30)),
          eq(registrations.paymentStatus, "PAID")
        )
      )
      .groupBy(sql`DATE(${registrations.createdAt})`)
      .orderBy(desc(sql`DATE(${registrations.createdAt})`))
      .limit(30);

    // Get revenue by month (for the past year)
    const revenueByMonth = await db
      .select({
        month: sql<string>`DATE_TRUNC('month', ${registrations.createdAt})::text`,
        revenue: sql<number>`SUM(${registrations.totalAmount})`
      })
      .from(registrations)
      .where(
        and(
          gte(registrations.createdAt, subMonths(new Date(), 12)),
          eq(registrations.paymentStatus, "PAID")
        )
      )
      .groupBy(sql`DATE_TRUNC('month', ${registrations.createdAt})`)
      .orderBy(sql`DATE_TRUNC('month', ${registrations.createdAt})`);

    // Get registrations by event
    const registrationsByEvent = await db
      .select({
        eventName: events.title,
        registrations: sql<number>`COUNT(${registrations.id})`
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(
        and(
          startDate ? gte(registrations.createdAt, startDate) : undefined,
          endDate ? lte(registrations.createdAt, endDate) : undefined
        )
      )
      .groupBy(events.title)
      .orderBy(desc(sql`COUNT(${registrations.id})`))
      .limit(10);

    return {
      kpis: {
        totalEvents,
        totalRegistrations,
        totalRevenue: Number(revenueResult || 0),
        totalAttendees
      },
      trends: {
        registrations: registrationTrends.map(r => ({
          date: r.date,
          count: Number(r.count)
        })),
        revenue: revenueTrends.map(r => ({
          date: r.date,
          amount: Number(r.amount)
        }))
      },
      charts: {
        revenueByMonth: revenueByMonth.map(r => ({
          month: r.month,
          revenue: Number(r.revenue)
        })),
        registrationsByEvent: registrationsByEvent.map(r => ({
          eventName: r.eventName,
          registrations: Number(r.registrations)
        }))
      }
    };
  }

  /**
   * Get detailed analytics report
   */
  async getAnalyticsReport(params: {
    type: "revenue" | "registrations" | "events" | "attendees";
    period: "week" | "month" | "quarter" | "year" | "custom";
    startDate?: Date;
    endDate?: Date;
  }): Promise<AnalyticsReport> {
    const { type, period, startDate, endDate } = params;
    const dateRange = { period, startDate, endDate };
    
    switch (type) {
      case "revenue":
        return this.getRevenueReport(dateRange);
      case "registrations":
        return this.getRegistrationsReport(dateRange);
      case "events":
        return this.getEventsReport(dateRange);
      case "attendees":
        return this.getAttendeesReport(dateRange);
      default:
        throw new Error(`Invalid report type: ${type}`);
    }
  }

  private async getRevenueReport(period: AnalyticsPeriod): Promise<AnalyticsReport> {
    const { startDate, endDate } = this.getDateRange(period);

    const revenueData = await db
      .select({
        date: sql<string>`DATE(${registrations.createdAt})`,
        amount: registrations.totalAmount,
        eventName: events.title,
        registrationNumber: registrations.registrationNumber
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(
        and(
          eq(registrations.paymentStatus, "PAID"),
          startDate ? gte(registrations.createdAt, startDate) : undefined,
          endDate ? lte(registrations.createdAt, endDate) : undefined
        )
      )
      .orderBy(desc(registrations.createdAt));

    const totalRevenue = revenueData.reduce((sum, row) => sum + Number(row.amount), 0);

    return {
      type: "revenue",
      data: revenueData,
      summary: {
        total: totalRevenue,
        period: period.period
      }
    };
  }

  private async getRegistrationsReport(period: AnalyticsPeriod): Promise<AnalyticsReport> {
    const { startDate, endDate } = this.getDateRange(period);

    const registrationData = await db
      .select({
        id: registrations.id,
        registrationNumber: registrations.registrationNumber,
        eventName: events.title,
        userName: sql<string>`users.name`,
        userEmail: sql<string>`users.email`,
        status: registrations.status,
        paymentStatus: registrations.paymentStatus,
        totalAmount: registrations.totalAmount,
        createdAt: registrations.createdAt
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .innerJoin(sql`users`, eq(registrations.userId, sql`users.id`))
      .where(
        and(
          startDate ? gte(registrations.createdAt, startDate) : undefined,
          endDate ? lte(registrations.createdAt, endDate) : undefined
        )
      )
      .orderBy(desc(registrations.createdAt));

    return {
      type: "registrations",
      data: registrationData,
      summary: {
        total: registrationData.length,
        period: period.period
      }
    };
  }

  private async getEventsReport(period: AnalyticsPeriod): Promise<AnalyticsReport> {
    const { startDate, endDate } = this.getDateRange(period);

    const eventData = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startDate: events.startDate,
        endDate: events.endDate,
        location: events.location,
        maxCapacity: events.maxCapacity,
        status: events.status,
        createdAt: events.createdAt
      })
      .from(events)
      .where(
        and(
          startDate ? gte(events.createdAt, startDate) : undefined,
          endDate ? lte(events.createdAt, endDate) : undefined
        )
      )
      .orderBy(desc(events.createdAt));

    return {
      type: "events",
      data: eventData,
      summary: {
        total: eventData.length,
        period: period.period
      }
    };
  }

  private async getAttendeesReport(period: AnalyticsPeriod): Promise<AnalyticsReport> {
    const { startDate, endDate } = this.getDateRange(period);

    const attendeeData = await db
      .select({
        id: attendees.id,
        fullName: attendees.fullName,
        gender: attendees.gender,
        ageCategory: attendees.ageCategory,
        beltLevel: attendees.beltLevel,
        phoneNumber: attendees.phoneNumber,
        eventName: events.title,
        registrationNumber: registrations.registrationNumber,
        createdAt: attendees.createdAt
      })
      .from(attendees)
      .innerJoin(registrations, eq(attendees.registrationId, registrations.id))
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(
        and(
          startDate ? gte(attendees.createdAt, startDate) : undefined,
          endDate ? lte(attendees.createdAt, endDate) : undefined
        )
      )
      .orderBy(desc(attendees.createdAt));

    return {
      type: "attendees",
      data: attendeeData,
      summary: {
        total: attendeeData.length,
        period: period.period
      }
    };
  }

  private getDateRange(period: AnalyticsPeriod) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (period.startDate && period.endDate) {
      return { startDate: period.startDate, endDate: period.endDate };
    }

    const now = new Date();
    
    switch (period.period) {
      case "week":
        startDate = subWeeks(now, 1);
        endDate = now;
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = now;
        break;
      case "quarter":
        const quarterStart = startOfMonth(new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3));
        startDate = quarterStart;
        endDate = now;
        break;
      case "year":
        startDate = startOfYear(now);
        endDate = now;
        break;
      case "custom":
        // Already handled above
        break;
    }

    return { startDate, endDate };
  }
}

export const analyticsService = new AnalyticsService();