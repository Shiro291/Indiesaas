"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { User, Menu, X } from "lucide-react"
import { authClient } from "@/lib/auth-client"
// Session is obtained via authClient.useSession()

export function SiteHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()
    const { data: session } = authClient.useSession()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
            <div className="container flex h-16 items-center">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-xl">EventTS</span>
                    </Link>
                </div>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                                href="/"
                            >
                                Home
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                                href="/events"
                            >
                                Events
                            </NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="flex flex-1 items-center justify-end space-x-4">
                    {session ? (
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="hidden md:block">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <User className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings">
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    {session?.user?.email ===
                                        process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin">
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={() => authClient.signOut()}
                                        className="cursor-pointer"
                                    >
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Link href="/auth/sign-in">
                                <Button variant="ghost">Sign In</Button>
                            </Link>
                            <Link href="/auth/sign-up">
                                <Button>Sign Up</Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="border-t bg-background md:hidden">
                    <div className="container flex flex-col space-y-3 py-4">
                        <Link
                            href="/"
                            className="font-medium text-sm hover:underline"
                        >
                            Home
                        </Link>
                        <Link
                            href="/events"
                            className="font-medium text-sm hover:underline"
                        >
                            Events
                        </Link>
                        {session ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="font-medium text-sm hover:underline"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => authClient.signOut()}
                                    className="text-left font-medium text-sm hover:underline"
                                >
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/auth/sign-in"
                                    className="font-medium text-sm hover:underline"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/auth/sign-up"
                                    className="font-medium text-sm hover:underline"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
