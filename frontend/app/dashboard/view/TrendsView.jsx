"use client";

import { useState, useEffect, useCallback } from "react";

export default function TrendsView({ user }) {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const handleFetch = useCallback(async () => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/trends/${user.id}`);
      const data = await res.json();
      setTrends(Array.isArray(data?.trends) ? data.trends : []);
      setLastFetch(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("Trend fetch failed:", e);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    // Initial fetch
    handleFetch();
  }, [handleFetch]);

  const useTrend = (title) => {
    window.location.hash = "generate";
    // In a real app, we'd use global state or a context to pass this prefill
    // For now, we can use sessionStorage
    sessionStorage.setItem("prefill_topic", title);
  };

  const getSourceIcon = (source) => {
    if (source?.includes("Twitter") || source?.includes("X")) return "𝕏";
    if (source?.includes("Hacker")) return "▲";
    if (source?.includes("Dev.to")) return "DEV";
    if (source?.includes("Google")) return "G";
    return "◎";
  };

  const getSourceColor = (source) => {
    if (source?.includes("Twitter") || source?.includes("X")) return "text-blue-400";
    if (source?.includes("Hacker")) return "text-amber-500";
    if (source?.includes("Dev.to")) return "text-emerald-400";
    if (source?.includes("Google")) return "text-blue-500";
    return "text-indigo-400";
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white mb-2">
            Phase 2A — Trend Engine
          </h2>
          <p className="text-gray-400">Live topics matched to your identity via pgvector cosine similarity.</p>
        </div>
        <button 
          onClick={handleFetch}
          disabled={loading}
          className="bg-[#1a1a1a] hover:bg-[#222] border border-white/10 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin"></span> Fetching...</>
          ) : (
            <>↻ Refresh Trends</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <div className="text-sm font-semibold text-gray-200 mb-2">Reddit API (PRAW)</div>
          <div className="text-xs text-gray-500">r/MachineLearning, r/startups</div>
          <div className="text-[10px] mt-2 text-emerald-400 bg-emerald-400/10 inline-block px-2 py-0.5 rounded">Active</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <div className="text-sm font-semibold text-gray-200 mb-2">Google News RSS</div>
          <div className="text-xs text-gray-500">feedparser + BeautifulSoup</div>
          <div className="text-[10px] mt-2 text-emerald-400 bg-emerald-400/10 inline-block px-2 py-0.5 rounded">Active</div>
        </div>
        <div className="bg-[#111] border border-white/5 rounded-xl p-5">
          <div className="text-sm font-semibold text-gray-200 mb-2">snscrape (X)</div>
          <div className="text-xs text-gray-500">#buildinpublic #AI</div>
          <div className="text-[10px] mt-2 text-amber-400 bg-amber-400/10 inline-block px-2 py-0.5 rounded">Rate Limited</div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
          <h3 className="text-sm font-semibold text-gray-300">Live Matches</h3>
          {lastFetch && <span className="text-[10px] text-gray-500">Last updated: {lastFetch}</span>}
        </div>

        {trends.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No trends found. Try refreshing or check your API keys.
          </div>
        )}

        <div className="divide-y divide-white/5">
          {trends.map((t, i) => {
            const relevance = Math.round((t.relevance_score || 0.8) * 100);
            return (
              <div key={i} className="p-5 hover:bg-white/[0.02] transition-colors flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center text-sm font-bold ${getSourceColor(t.source)} shrink-0`}>
                  {getSourceIcon(t.source)}
                </div>
                
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold ${getSourceColor(t.source)}`}>{t.source}</span>
                    <span className="text-[10px] text-gray-600">&bull;</span>
                    <span className="text-[10px] text-gray-500">{t.tag || "general"}</span>
                  </div>
                  <div className="text-sm text-gray-200 font-medium mb-2 leading-relaxed">
                    {t.title}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-32">
                      <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${relevance}%` }}></div>
                      </div>
                      <span className="text-[10px] text-gray-400">{relevance}%</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => useTrend(t.title)}
                  className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-indigo-500/20 whitespace-nowrap shrink-0"
                >
                  Generate Content
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
