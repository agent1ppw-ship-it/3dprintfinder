import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables in Vercel." },
        { status: 503 }
      );
    }

    if (!priceId) {
      return NextResponse.json({ error: "No price selected" }, { status: 400 });
    }

    const prices: Record<string, { name: string; price: number }> = {
      "price_pro_monthly": { name: "Pro Monthly", price: 29 },
      "price_business_monthly": { name: "Business Monthly", price: 99 },
    };

    const selectedPrice = prices[priceId];
    if (!selectedPrice) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    // Use require instead of import to avoid static analysis
    const Stripe = require("stripe");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `PrintCrawler - ${selectedPrice.name}`,
            },
            unit_amount: selectedPrice.price * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Checkout failed. Please try again later." },
      { status: 500 }
    );
  }
}
