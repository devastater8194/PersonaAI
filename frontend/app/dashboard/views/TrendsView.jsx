"use client";

import { useState, useEffect, useCallback } from "react";

export default function TrendsView({ user }) {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const [topic, setTopic] = useState("");
  const [graphData, setGraphData] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [summaries, setSummaries] = useState({});

  const fetchTrends = async (searchTopic = "") => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = new URL(`${API_URL}/api/trends/${user.id}`);
      if (searchTopic) {
        url.searchParams.append("topic", searchTopic);
      }

      const res = await fetch(url);
      const data = await res.json();
      const fetchedTrends = Array.isArray(data?.trends) ? data.trends : [];
      setTrends(fetchedTrends);
      setLastFetch(new Date().toLocaleTimeString());

      return fetchedTrends;
    } catch (e) {
      console.error("Trend fetch failed:", e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchGraph = async (searchTopic, fetchedTrends) => {
    if (!fetchedTrends || fetchedTrends.length === 0) return;
    setGraphLoading(true);
    setGraphData(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/trends/graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic, trends: fetchedTrends })
      });
      const data = await res.json();
      setGraphData(data.historical || []);
    } catch (e) {
      console.error("Graph fetch failed:", e);
    } finally {
      setGraphLoading(false);
    }
  };

  const getMaxHeat = (data) => {
    if (!data || data.length === 0) return 100;
    const maxVal = Math.max(...data.map(d => d.platforms ? Object.values(d.platforms).reduce((a, b) => a + b, 0) : (d.heat || 0)));
    return Math.max(10, maxVal);
  };

  const handleShowTrends = async () => {
    const fetched = await fetchTrends(topic);
    if (topic.trim()) {
      await fetchGraph(topic, fetched);
    }
  };

  const handleFetchInitial = useCallback(async () => {
    await fetchTrends("");
  }, [user.id]);

  useEffect(() => {
    // Initial fetch
    handleFetchInitial();
  }, [handleFetchInitial]);

  const useTrend = (title, e) => {
    e.stopPropagation();
    window.location.hash = "generate";
    sessionStorage.setItem("prefill_topic", title);
  };

  const handleGenerateSummary = async (url, title, e) => {
    e.stopPropagation();
    setSummaries(prev => ({ ...prev, [url]: { loading: true, text: null } }));

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/trends/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url, title: title })
      });
      const data = await res.json();
      setSummaries(prev => ({ ...prev, [url]: { loading: false, text: data.summary } }));
    } catch (e) {
      setSummaries(prev => ({ ...prev, [url]: { loading: false, text: "Error fetching summary. Try again." } }));
    }
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
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleShowTrends()}
          />
          <button
            onClick={handleShowTrends}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-t-transparent border-white/50 rounded-full animate-spin"></span> Fetching...</>
            ) : (
              <>Show Trends</>
            )}
          </button>
        </div>
      </div>

      {(graphData || graphLoading) && (
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex justify-between">
            <span>Live Relevancy Graph: {topic}</span>
            {graphLoading && <span className="text-xs text-indigo-400 animate-pulse">Running Gemini Analysis...</span>}
          </h3>

          {!graphLoading && graphData && (
            <div className="h-48 flex items-end justify-between gap-2 mt-8 px-2 relative">
              {graphData.map((d, i) => {
                const totalHeat = d.platforms ? Object.values(d.platforms).reduce((a, b) => a + b, 0) : (d.heat || 0);

                return (
                  <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group cursor-crosshair">
                    <div className="text-[10px] text-gray-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-[#1a1a1a] p-1.5 rounded border border-white/10 z-10">
                      <div className="font-bold text-gray-300 text-center border-b border-white/10 pb-1 mb-1">{d.date}: {totalHeat} vol</div>
                      {d.platforms && Object.entries(d.platforms).map(([plat, val]) => (
                        <div key={plat} className="flex justify-between gap-4">
                          <span>{plat}</span>
                          <span className="text-gray-400">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div
                      className="w-full flex justify-end flex-col hover:opacity-80 transition-all rounded-t-sm overflow-hidden border-x border-t border-indigo-500/10"
                      style={{ height: `${Math.max(10, (totalHeat / getMaxHeat(graphData)) * 160)}px` }}
                    >
                      {d.platforms ? Object.entries(d.platforms).map(([plat, val]) => {
                        const colors = {
                          "X": "bg-blue-400",
                          "Google News": "bg-blue-500",
                          "HackerNews": "bg-amber-500",
                          "Dev.to": "bg-emerald-400"
                        };
                        const color = colors[plat] || "bg-indigo-400";
                        return <div key={plat} style={{ flexGrow: val }} className={`${color} w-full`} title={`${plat}: ${val}`} />
                      }) : (
                        <div className="bg-indigo-500 w-full h-full"></div>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-2 rotate-[-45deg] origin-top-left md:rotate-0 md:origin-center break-words select-none text-center">
                      {d.date}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
          <h3 className="text-sm font-semibold text-gray-300">Live Matches</h3>
          {lastFetch && <span className="text-[10px] text-gray-500">Last updated: {lastFetch}</span>}
        </div>

        {trends.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-500 text-sm">
            No trends found. Try searching a topic or check your API keys.
          </div>
        )}

        <div className="divide-y divide-white/5">
          {trends.map((t, i) => {
            const relevance = Math.round((t.relevance_score || 0.8) * 100);
            const sumData = summaries[t.url];

            return (
              <div
                key={i}
                className="p-5 hover:bg-white/[0.02] transition-colors flex flex-col gap-3 group relative"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center text-sm font-bold ${getSourceColor(t.source)} shrink-0`}>
                    {getSourceIcon(t.source)}
                  </div>

                  <div className="flex-1">
                    <div className="flex gap-2 items-center mb-1">
                      <span className={`text-[10px] uppercase tracking-wider font-semibold ${getSourceColor(t.source)}`}>{t.source}</span>
                      <span className="text-[10px] text-gray-600">&bull;</span>
                      <span className="text-[10px] text-gray-500">{t.tag || "general"}</span>
                    </div>
                    <a
                      href={t.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-gray-200 font-medium mb-2 leading-relaxed hover:text-indigo-400 transition-colors block"
                    >
                      {t.title} <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                    </a>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-32">
                        <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${relevance}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400">{relevance}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 relative z-10">
                    <button
                      onClick={(e) => useTrend(t.title, e)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white shadow shadow-indigo-500/20 text-xs font-medium px-4 py-2 rounded-lg transition-all"
                    >
                      Use Topic
                    </button>
                    {!sumData && (
                      <button
                        onClick={(e) => handleGenerateSummary(t.url, t.title, e)}
                        className="bg-[#1a1a1a] hover:bg-[#222] text-gray-300 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors border border-white/5 flex items-center justify-center gap-1"
                      >
                        ✨ Summary
                      </button>
                    )}
                  </div>
                </div>

                {sumData && (
                  <div className="mt-2 ml-14 bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-4 text-xs text-indigo-200/80 prose prose-invert max-w-none">
                    {sumData.loading ? (
                      <div className="flex items-center gap-2 animate-pulse text-indigo-400">
                        <span className="w-3 h-3 border-2 border-t-transparent border-indigo-400 rounded-full animate-spin"></span>
                        Generating AI summary...
                      </div>
                    ) : (
                      <div className="space-y-1.5 relative z-10">
                        <div className="font-semibold text-indigo-300 uppercase tracking-widest text-[9px] mb-2">Gemini Analysis</div>
                        <div dangerouslySetInnerHTML={{ __html: sumData.text.replace(/\n- /g, '<br/>• ').replace(/^- /g, '• ') }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
