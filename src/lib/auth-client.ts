import { createAuthClient } from "better-auth/react"
import { stripeClient } from "@better-auth/stripe/client"

/**
 * Better Auth client instance with Stripe plugin
 *
 * This client is used for handling authentication on the client side
 * with Stripe subscription management capabilities.
 *
 * @type {any} authClient - The Better Auth client instance
 */
export const authClient = createAuthClient({
    plugins: [
        stripeClient({
            subscription: true // Enable subscription management
        })
    ]
})
