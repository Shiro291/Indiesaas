import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { headers } from "next/headers"
import { Resend } from "resend"
import { EmailTemplate } from "@daveyplate/better-auth-ui/server"
import React from "react"
import { db } from "@/database/db"
import * as schema from "@/database/schema"
import { site } from "@/config/site"

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Better Auth instance with database integration and email/social authentication
 * 
 * This configuration sets up authentication with:
 * - PostgreSQL database using Drizzle ORM adapter
 * - Email and password authentication
 * - Social authentication (GitHub, Google, Twitter)
 * - Password reset email functionality
 * 
 * @type {any} auth - The Better Auth instance
 */
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            const name = user.name || user.email.split("@")[0]

            await resend.emails.send({
                from: site.mailFrom,
                to: user.email,
                subject: "Reset your password",
                react: EmailTemplate({
                    heading: "Reset your password",
                    content: React.createElement(
                        React.Fragment,
                        null,
                        React.createElement("p", null, `Hi ${name},`),
                        React.createElement(
                            "p",
                            null,
                            "Someone requested a password reset for your account. If this was you, ",
                            "click the button below to reset your password."
                        ),
                        React.createElement(
                            "p",
                            null,
                            "If you didn't request this, you can safely ignore this email."
                        )
                    ),
                    action: "Reset Password",
                    url,
                    siteName: site.name,
                    baseUrl: site.url,
                    imageUrl: `${site.url}/logo.png` // svg are not supported by resend
                })
            })
        }
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        },
        twitter: {
            clientId: process.env.TWITTER_CLIENT_ID as string,
            clientSecret: process.env.TWITTER_CLIENT_SECRET as string
        }
    }
})

/**
 * Get the currently active subscription for the authenticated user
 * 
 * This function retrieves the active subscription for the currently logged-in user
 * from the Better Auth API.
 * 
 * @returns {Promise<any>} The active subscription object or undefined if none exists
 * 
 * @throws No direct throws, but may have errors in the Better Auth API call
 */
export async function getActiveSubscription() {
    const nextHeaders = await headers()
    const subscriptions = await auth.api.listActiveSubscriptions({
        headers: nextHeaders
    })
    return subscriptions.find((s) => s.status === "active")
}
