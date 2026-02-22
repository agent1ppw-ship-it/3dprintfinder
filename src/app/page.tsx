import Link from "next/link";
import { Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#22c55e] rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">3</span>
            </div>
            <span className="font-bold text-xl">3D Print Finder</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-zinc-400 hover:text-white transition">Features</Link>
            <Link href="#pricing" className="text-zinc-400 hover:text-white transition">Pricing</Link>
            <Link 
              href="/dashboard" 
              className="bg-[#22c55e] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#16a34a] transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Find Profitable 3D Printed Products to{" "}
            <span className="text-[#22c55e]">Print & Sell</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10">
            Discover what's selling on eBay and Etsy. Analyze demand, 
            competition, and pricing to find your next bestseller.
          </p>
          
          {/* Search Bar */}
          <form action="/dashboard" className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                name="q"
                placeholder="Try 'RC car parts train accessories' or 'model'..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-4 pl-12 pr-4 text-lg placeholder:text-zinc-500 focus:outline-none focus:border-[#22c55e] transition"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#22c55e] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#16a34a] transition"
              >
                Search
              </button>
            </div>
          </form>

          <p className="text-zinc-500 mt-4 text-sm">
            Free to start • No credit card required
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Find Winning Products
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-[#22c55e]/20 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-[#22c55e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real Market Data</h3>
              <p className="text-zinc-400">
                Crawls eBay and Etsy to show you what's actually selling. 
                Not guesses — real data from real marketplaces.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-[#22c55e]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Demand Score</h3>
              <p className="text-zinc-400">
                Our algorithm calculates demand score based on competition, 
                pricing, and sales velocity. Find golden opportunities.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-[#22c55e]/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Watch Lists & Alerts</h3>
              <p className="text-zinc-400">
                Track niches over time. Get notified when new items appear 
                or when demand spikes in categories you follow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-zinc-400 text-center mb-12">
            Start free, upgrade when you're ready to scale.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-zinc-400 mb-2">Free</h3>
              <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
              <ul className="space-y-3 text-zinc-400 mb-6">
                <li>✓ 5 searches per day</li>
                <li>✓ Basic demand data</li>
                <li>✓ eBay results</li>
                <li>✓ Community support</li>
              </ul>
              <button className="w-full border border-zinc-700 py-3 rounded-lg font-medium hover:bg-zinc-800 transition">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="bg-zinc-900 border-2 border-[#22c55e] p-6 rounded-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#22c55e] text-black px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-lg font-semibold text-[#22c55e] mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-4">$29<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
              <ul className="space-y-3 text-zinc-400 mb-6">
                <li>✓ Unlimited searches</li>
                <li>✓ Full demand analysis</li>
                <li>✓ eBay + Etsy results</li>
                <li>✓ Watch lists</li>
                <li>✓ Email alerts</li>
                <li>✓ Priority support</li>
              </ul>
              <button className="w-full bg-[#22c55e] text-black py-3 rounded-lg font-medium hover:bg-[#16a34a] transition">
                Start Free Trial
              </button>
            </div>

            {/* Business */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-zinc-400 mb-2">Business</h3>
              <div className="text-4xl font-bold mb-4">$99<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
              <ul className="space-y-3 text-zinc-400 mb-6">
                <li>✓ Everything in Pro</li>
                <li>✓ API access</li>
                <li>✓ Bulk exports</li>
                <li>✓ Team seats (5)</li>
                <li>✓ Custom integrations</li>
                <li>✓ Dedicated support</li>
              </ul>
              <button className="w-full border border-zinc-700 py-3 rounded-lg font-medium hover:bg-zinc-800 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#22c55e] rounded flex items-center justify-center">
              <span className="text-black font-bold text-sm">3</span>
            </div>
            <span className="font-medium">3D Print Finder</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © 2026 3D Print Finder. Built for makers.
          </p>
        </div>
      </footer>
    </div>
  );
}
