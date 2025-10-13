import type { ReactNode } from "react"
import { Providers } from "../providers"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import "@/styles/globals.css"

export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body className="flex min-h-svh flex-col antialiased">
                <Providers>
                    <div className="relative flex min-h-svh flex-col">
                        <SiteHeader />
                        <main className="flex-1">{children}</main>
                        <SiteFooter />
                    </div>
                </Providers>
            </body>
        </html>
    )
}
