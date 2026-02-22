"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Search, Filter, Heart, ExternalLink, Loader2, LogOut, User as UserIcon } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  itemUrl: string;
  platform: "ebay" | "etsy";
  demandScore?: number;
  printTime?: string;
  difficulty?: "simple" | "medium" | "complex";
}

function DashboardContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState<"all" | "ebay" | "etsy">("all");
  const [watchList, setWatchList] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"relevance" | "price-asc" | "price-desc" | "demand">("relevance");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const saved = localStorage.getItem(`watchList_${user?.id}`);
    if (saved) {
      setWatchList(JSON.parse(saved));
    }
  }, [user?.id]);

  const saveWatchList = (items: string[]) => {
    setWatchList(items);
    localStorage.setItem(`watchList_${user?.id}`, JSON.stringify(items));
  };

  const toggleWatchList = (id: string) => {
    const newList = watchList.includes(id)
      ? watchList.filter((item) => item !== id)
      : [...watchList, id];
    saveWatchList(newList);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&platform=${platform}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate demand score
  const calculateDemandScore = (result: SearchResult): number => {
    const baseScore = 50;
    const priceFactor = Math.min(result.price / 50, 1) * 30;
    const platformBonus = result.platform === "etsy" ? 10 : 0;
    return Math.min(Math.round(baseScore + priceFactor + platformBonus + Math.random() * 10), 99);
  };

  const sortedResults = [...results].map(r => ({ ...r, demandScore: calculateDemandScore(r) })).sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "demand":
        return (b.demandScore || 0) - (a.demandScore || 0);
      default:
        return 0;
    }
  });

  const filteredResults = platform === "all" 
    ? sortedResults 
    : sortedResults.filter(r => r.platform === platform);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-4 hidden md:block">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Platform</h3>
            <div className="space-y-2">
              {(["all", "ebay", "etsy"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    platform === p 
                      ? "bg-[#22c55e]/20 text-[#22c55e]" 
                      : "text-zinc-400 hover:bg-zinc-800"
                  }`}
                >
                  {p === "all" ? "All Platforms" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#22c55e]"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="demand">Demand Score</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Watch List</h3>
            {watchList.length === 0 ? (
              <p className="text-zinc-500 text-sm">No items saved yet</p>
            ) : (
              <p className="text-[#22c55e] text-sm">{watchList.length} items saved</p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products... (e.g., 'RC car parts', 'model train', 'cosplay')"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 pl-12 pr-32 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[#22c55e] transition"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#22c55e] text-black px-4 py-1.5 rounded-lg font-medium text-sm hover:bg-[#16a34a] transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
          </div>
        ) : filteredResults.length > 0 ? (
          <>
            <p className="text-zinc-400 text-sm mb-4">{filteredResults.length} results found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredResults.map((result) => (
                <div 
                  key={result.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition group"
                >
                  <div className="aspect-square relative bg-zinc-800">
                    {result.imageUrl ? (
                      <img 
                        src={result.imageUrl} 
                        alt={result.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.platform === "ebay" 
                          ? "bg-blue-600 text-white" 
                          : "bg-orange-500 text-white"
                      }`}>
                        {result.platform.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleWatchList(result.id)}
                      className={`absolute top-2 right-2 p-2 rounded-full transition ${
                        watchList.includes(result.id)
                          ? "bg-[#22c55e] text-black"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${watchList.includes(result.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-[#22c55e] transition">
                      {result.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        ${result.price.toFixed(2)}
                      </span>
                      <a
                        href={result.itemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    {result.demandScore && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              result.demandScore >= 70 
                                ? "bg-[#22c55e]" 
                                : result.demandScore >= 40 
                                  ? "bg-yellow-500" 
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${result.demandScore}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          result.demandScore >= 70 
                            ? "text-[#22c55e]" 
                            : result.demandScore >= 40 
                              ? "text-yellow-500" 
                              : "text-red-500"
                        }`}>
                          {result.demandScore}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : query ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 mb-4">No results found for "{query}"</p>
            <p className="text-zinc-500 text-sm">Try different keywords or check your spelling</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">Enter a search term to find products</p>
            <p className="text-zinc-500 text-sm mt-2">Try "RC crawler", "model train", "cosplay props"</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#22c55e] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">3</span>
              </div>
              <span className="font-bold text-xl">3D Print Finder</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <UserIcon className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            )}
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            <button className="bg-[#22c55e] text-black px-4 py-2 rounded-lg font-medium text-sm">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </header>

      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
