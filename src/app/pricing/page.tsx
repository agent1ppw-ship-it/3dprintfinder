"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  const handleSubscribe = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  // Check for success/canceled in URL
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true" && !success) {
      setSuccess(true);
    }
    if (params.get("canceled") === "true" && !canceled) {
      setCanceled(true);
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Basic 3D print searches",
        "5 searches per day",
        "Amazon results only",
        "Community support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$12.99",
      period: "per month",
      description: "For serious hobbyists",
      features: [
        "Unlimited searches",
        "All marketplaces (Amazon, eBay, Etsy)",
        "Google Trends data",
        "Price alerts",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Business",
      price: "$49.99",
      period: "per month",
      description: "For resellers and makers",
      features: [
        "Everything in Pro",
        "Sales data estimates",
        "Bulk search exports",
        "API access",
        "White-label reports",
        "Dedicated support",
      ],
      cta: "Start Business Trial",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#22c55e] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">3</span>
            </div>
            <span className="font-bold text-xl">3DPrintFinder</span>
          </a>
          <nav className="flex items-center gap-6">
            <a href="/" className="text-zinc-400 hover:text-white transition">Home</a>
            <a href="/pricing" className="text-[#22c55e] font-medium">Pricing</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Success Message */}
        {success && (
          <div className="bg-green-900/30 border border-green-500 rounded-xl p-6 mb-8 text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Welcome to 3DPrintFinder Pro!</h2>
            <p className="text-zinc-300">Your subscription is now active. Enjoy unlimited searches!</p>
          </div>
        )}

        {/* Canceled Message */}
        {canceled && (
          <div className="bg-yellow-900/30 border border-yellow-500 rounded-xl p-6 mb-8 text-center">
            <p className="text-yellow-400">Checkout was canceled. No charges were made.</p>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-zinc-400 text-lg">Choose the plan that fits your needs</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-zinc-900 border rounded-2xl p-8 ${
                plan.popular
                  ? "border-[#22c55e] shadow-lg shadow-green-900/20"
                  : "border-zinc-800"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#22c55e] text-black text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-zinc-500">/{plan.period}</span>
                </div>
                <p className="text-zinc-400 text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-zinc-300">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.name.toLowerCase())}
                disabled={loading === plan.name.toLowerCase() || plan.price === "$0"}
                className={`w-full py-3 rounded-xl font-medium transition ${
                  plan.popular
                    ? "bg-[#22c55e] text-black hover:bg-[#16a34a]"
                    : "bg-zinc-800 text-white hover:bg-zinc-700"
                } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loading === plan.name.toLowerCase() ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : plan.price === "$0" ? (
                  "Current Plan"
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-zinc-500 mb-4">🔒 Secure payments powered by Stripe</p>
          <p className="text-zinc-600 text-sm">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </main>
    </div>
  );
}
