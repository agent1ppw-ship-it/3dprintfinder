"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, Check } from "lucide-react";

export default function PricingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!priceId) {
      router.push("/dashboard");
      return;
    }

    setProcessing(priceId);

    try {
      // Call API to create checkout session
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, userId: user.id }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert("Stripe is not configured. Please contact support or try again later.");
      } else {
        alert("Unable to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const plans = [
    {
      name: "Free",
      price: 0,
      priceId: "",
      features: [
        "Search 3D printed products",
        "View Amazon listings",
        "Save favorites",
        "Basic market research",
      ],
    },
    {
      name: "Pro",
      price: 12.99,
      priceId: "price_pro_monthly",
      features: [
        "Everything in Free",
        "Unlimited searches",
        "Export to CSV",
        "Priority support",
        "Advanced analytics",
        "Competitor tracking",
      ],
    },
    {
      name: "Business",
      price: 99,
      priceId: "price_business_monthly",
      features: [
        "Everything in Pro",
        "API access",
        "White label reports",
        "Team collaboration",
        "Custom integrations",
        "Dedicated support",
      ],
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push("/dashboard")} className="font-bold text-xl">
            PrintCrawler
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-zinc-400 text-lg">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-zinc-900 border rounded-2xl p-8 ${
                plan.name === "Pro" ? "border-[#22c55e] ring-1 ring-[#22c55e]" : "border-zinc-800"
              }`}
            >
              {plan.name === "Pro" && (
                <span className="bg-[#22c55e] text-black text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <h2 className="text-2xl font-bold mt-4">{plan.name}</h2>
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                {plan.price > 0 && <span className="text-zinc-400">/month</span>}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-zinc-300">
                    <Check className="w-5 h-5 text-[#22c55e]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.priceId)}
                disabled={processing === plan.priceId || plan.price === 0}
                className={`w-full py-3 px-6 rounded-lg font-medium transition ${
                  plan.price === 0
                    ? "bg-zinc-800 text-white hover:bg-zinc-700"
                    : plan.name === "Pro"
                    ? "bg-[#22c55e] text-black hover:bg-[#16a34a]"
                    : "bg-zinc-100 text-black hover:bg-white"
                } disabled:opacity50`}
              >
                {processing === plan.priceId ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : plan.price === 0 ? (
                  "Get Started Free"
                ) : (
                  `Subscribe for $${plan.price}/mo`
                )}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
