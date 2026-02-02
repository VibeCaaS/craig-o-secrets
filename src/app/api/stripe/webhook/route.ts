import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = (session as { metadata?: { userId?: string } }).metadata?.userId;
        const customer = (session as { customer?: string }).customer;
        const subscription = (session as { subscription?: string }).subscription;

        if (userId && customer && subscription) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: customer,
              stripeSubscriptionId: subscription,
              stripePriceId: process.env.STRIPE_PRICE_ID,
              stripeCurrentPeriodEnd: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ),
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = (invoice as { subscription?: string }).subscription;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeCurrentPeriodEnd: new Date(
                  (subscription as unknown as { current_period_end: number }).current_period_end * 1000
                ),
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = (subscription as { metadata?: { userId?: string } }).metadata?.userId;

        if (userId) {
          const items = (subscription as unknown as { items: { data: Array<{ price: { id: string } }> } }).items;
          const currentPeriodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;
          
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripePriceId: items?.data[0]?.price.id,
              stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = (subscription as { metadata?: { userId?: string } }).metadata?.userId;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
