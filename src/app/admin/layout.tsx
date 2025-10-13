import type { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default function AdminLayout({
    children
}: Readonly<{
    children: ReactNode
}>) {
    return (
        <div className="flex h-screen">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
    )
}
