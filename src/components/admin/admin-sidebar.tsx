"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, BarChart3, Settings, Users } from "lucide-react"

export function AdminSidebar() {
    const pathname = usePathname()

    const menuItems = [
        {
            title: "Dashboard",
            href: "/admin",
            icon: BarChart3
        },
        {
            title: "Events",
            href: "/admin/events",
            icon: Calendar
        },
        {
            title: "Registrations",
            href: "/admin/registrations",
            icon: Users
        },
        {
            title: "Analytics",
            href: "/admin/analytics",
            icon: BarChart3
        },
        {
            title: "Settings",
            href: "/admin/settings",
            icon: Settings
        }
    ]

    return (
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
            <div className="p-4">
                <h2 className="mb-6 font-bold text-xl">Admin Panel</h2>
                <nav>
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <li key={item.href}>
                                    <Button
                                        asChild
                                        variant={
                                            isActive ? "secondary" : "ghost"
                                        }
                                        className={`w-full justify-start ${isActive ? "font-semibold" : ""}`}
                                    >
                                        <Link href={item.href}>
                                            <Icon className="mr-2 h-4 w-4" />
                                            {item.title}
                                        </Link>
                                    </Button>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </div>
        </aside>
    )
}
