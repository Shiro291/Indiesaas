"use client"

import { toast } from "sonner"
import { useEffect, useRef } from "react"

export function WelcomeToast() {
    const hasShownToast = useRef(false)

    useEffect(() => {
        // Only show toast once per page load to avoid interference
        if (!hasShownToast.current) {
            hasShownToast.current = true
            // Optional: Show toast only if user is not already authenticated
            toast.info("Welcome to EventTS! Sign in to access all features.")
        }
    }, [])

    return null
}
