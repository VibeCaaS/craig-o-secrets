import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession, PLANS } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const priceId = PLANS.pro.priceId;
    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const url = await createCheckoutSession(
      session.user.id,
      session.user.email,
      priceId
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
