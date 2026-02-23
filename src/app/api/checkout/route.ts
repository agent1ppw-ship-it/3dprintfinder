import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const PRICES = {
  free: { name: "Free", price: 0, priceId: null },
  pro: { name: "Pro", price: 12.99, priceId: process.env.STRIPE_PRO_PRICE_ID },
  business: { name: "Business", price: 49.99, priceId: process.env.STRIPE_BUSINESS_PRICE_ID },
};

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    const planData = PRICES[plan as keyof typeof PRICES];
    
    if (!planData || !planData.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: planData.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/pricing?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/pricing?canceled=true`,
      allow_promotion_codes: true,
      metadata: {
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
