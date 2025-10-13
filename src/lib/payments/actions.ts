"use server"

//Docs: https://www.better-auth.com/docs/plugins/stripe
import { auth } from "@/lib/auth"
import type { Subscription } from "@better-auth/stripe"
import { headers } from "next/headers"
import Stripe from "stripe"

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Get the currently active subscription for the authenticated user
 *
 * This function retrieves the active subscription for the currently logged-in user
 * using Better Auth's session and subscription management.
 *
 * @returns {Promise<{status: boolean, message?: string, subscription: Subscription | null}>}
 * An object containing the subscription status and details
 *
 * @throws No direct throws, but returns error status in the response object
 */
export async function getActiveSubscription(): Promise<{
    status: boolean
    message?: string
    subscription: Subscription | null
}> {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
        return {
            status: false,
            message: "You need to be logged in.",
            subscription: null
        }
    }

    try {
        const activeSubs = await auth.api.listActiveSubscriptions({
            headers: await headers()
        })
        const activeSub =
            activeSubs.length > 1
                ? activeSubs.find(
                      (sub) =>
                          sub.status === "active" || sub.status === "trialing"
                  )
                : activeSubs[0]
        return {
            subscription: activeSub ?? null,
            status: true
        }
    } catch (error) {
        console.log(error)
        return {
            status: false,
            message: "Something went wrong.",
            subscription: null
        }
    }
}

/**
 * Update an existing subscription to a different price plan
 *
 * This function allows users to switch their subscription from one price tier to another
 * using the Stripe API.
 *
 * @param {string} subId - The ID of the existing subscription to update
 * @param {string} switchToPriceId - The ID of the new price plan to switch to
 * @returns {Promise<{status: boolean, message: string}>}
 * An object containing the update status and a message
 *
 * @throws No direct throws, but returns error status in the response object
 */
export async function updateExistingSubscription(
    subId: string,
    switchToPriceId: string
): Promise<{ status: boolean; message: string }> {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
        return {
            status: false,
            message: "You need to be logged in."
        }
    }

    if (!subId || !switchToPriceId) {
        return {
            status: false,
            message: "Invalid parameters."
        }
    }

    try {
        const subscription = await stripeClient.subscriptions.retrieve(subId)
        if (!subscription.items.data.length) {
            return {
                status: false,
                message: "Invalid subscription. No subscription items found!"
            }
        }

        await stripeClient.subscriptions.update(subId, {
            items: [
                {
                    id: subscription.items.data[0].id,
                    price: switchToPriceId
                }
            ],
            cancel_at_period_end: false,
            proration_behavior: "create_prorations"
        })

        return {
            status: true,
            message: "Subscription updated successfully!"
        }
    } catch (error) {
        console.log(error)
        return {
            status: false,
            message: "Something went wrong while updating the subcription."
        }
    }
}
