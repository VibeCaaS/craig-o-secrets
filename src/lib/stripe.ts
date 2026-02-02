import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
  typescript: true,
});

export const PLANS = {
  pro: {
    name: "Craig-O-Secrets Pro",
    description: "Full secrets management for teams",
    price: 14,
    priceId: process.env.STRIPE_PRICE_ID,
    features: [
      "Unlimited secrets",
      "Unlimited projects",
      "Team collaboration",
      "Audit logs",
      "API access",
      "CLI tool",
      "Version history",
      "Environment management",
    ],
  },
} as const;

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session.url!;
}

export async function createBillingPortalSession(
  customerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
  });

  return session.url;
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}
