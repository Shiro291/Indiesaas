"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

interface AnalyticsData {
  totalEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  eventsByStatus: {
    active: number;
    archived: number;
  };
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, this would fetch analytics data
    // For this example, using mock data
    setTimeout(() => {
      setAnalytics({
        totalEvents: 12,
        totalRegistrations: 48,
        totalRevenue: 25400000, // 25,400,000 IDR in cents
        eventsByStatus: {
          active: 8,
          archived: 4
        }
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="text-center py-8">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Failed to load analytics data</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your events and view analytics</p>
        </div>
        <Button asChild>
          <Link href="/admin/events/new">Create Event</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.eventsByStatus.active} active, {analytics.eventsByStatus.archived} archived
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp. {(analytics.totalRevenue / 100).toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">From last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest events created in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex items-center justify-between p-3 hover:bg-muted rounded-md">
                  <div>
                    <p className="font-medium">Pencak Silat Championship 2025</p>
                    <p className="text-sm text-muted-foreground">Mar 15-17, 2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">24 registrations</p>
                    <p className="text-sm text-muted-foreground">Rp. 2,400,000</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Admin shortcuts for common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline">
                <Link href="/admin/events">Manage Events</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/registrations">View Registrations</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/analytics">View Analytics</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/settings/categories">Manage Categories</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}