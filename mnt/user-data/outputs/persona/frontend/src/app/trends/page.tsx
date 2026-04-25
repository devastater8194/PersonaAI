"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AppShell from "@/components/AppShell";
import { fetchTrends } from "@/lib/api";

const SOURCE_COLORS: Record<string, string> = {
  "Reddit":       "var(--red)",
  "Google News":  "var(--blue)",
  "Twitter":      "var(--accent2)",
};

const TAG_ICONS: Record<string, string> = {
  ai: "🤖", saas: "⬡", startup: "🚀", tech: "💻",
  finance: "📈", marketing: "📣", content: "📱", design: "🎨",
  news: "📰", default: "◎",
};

export default function TrendsPage() {
  const router  = useRouter();
  const [trends,   setTrends]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [lastFetch,setLastFetch]= useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const data = await fetchTrends();
      setTrends(data.trends || []);
      setLastFetch(new Date().toLocaleTimeString());
      toast.success(`${data.count} trends fetched for your domain`);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e.message;
      if (msg?.includes("Identity not found")) {
        toast.error("Save your identity profile first");
        router.push("/");
      } else if (msg?.includes("Reddit")) {
        toast.error("Reddit API not configured — check backend .env");
      } else {
        toast.error("Trend fetch failed: " + msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const useTrend = (title: string) => {
    // Store in sessionStorage, generate page will read it
    sessionStorage.setItem("prefill_topic", title);
    router.push("/generate");
    toast.success("Trend loaded → Generate");
  };

  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 860, animation: "fadeUp .3s ease" }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px" }}>
            Trend <span style={{ color: "var(--accent2)" }}>Engine</span>
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
            // reddit_api + google_news_rss → filtered by your domain
          </p>
        </div>

        {/* API config note */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Reddit API — backend/.env
            </div>
            <code style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", lineHeight: 1.8, display: "block" }}>
              REDDIT_CLIENT_ID=...<br/>
              REDDIT_CLIENT_SECRET=...<br/>
              <span style={{ color: "var(--muted2)" }}># reddit.com/prefs/apps</span>
            </code>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--green)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Google News — no key needed ✓
            </div>
            <code style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", lineHeight: 1.8, display: "block" }}>
              Uses public RSS feed<br/>
              Auto-filtered by your domain
            </code>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
          <button className="btn btn-primary" onClick={handleFetch} disabled={loading}>
            {loading ? <><span className="spinner" /> Fetching trends...</> : "◎ Fetch Trends"}
          </button>
          {lastFetch && (
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
              last fetched: {lastFetch}
            </span>
          )}
        </div>

        {/* Trends list */}
        {trends.length === 0 && !loading && (
          <div style={{
            textAlign: "center", padding: "60px 0",
            color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 13,
          }}>
            No trends yet.<br />
            <span style={{ fontSize: 12, color: "var(--muted2)" }}>
              Configure Reddit API in backend/.env then click Fetch Trends.
            </span>
          </div>
        )}

        {trends.map((t, i) => {
          const tagKey = (t.tag || "").toLowerCase();
          const icon   = TAG_ICONS[tagKey] || TAG_ICONS.default;
          const srcKey = Object.keys(SOURCE_COLORS).find(k => t.source?.includes(k)) || "default";
          const srcColor = SOURCE_COLORS[srcKey] || "var(--accent2)";
          const relevance = Math.round((t.relevance_score || 0.8) * 100);

          return (
            <div
              key={i}
              onClick={() => useTrend(t.title)}
              style={{
                background: "var(--surface2)", border: "1px solid var(--border2)",
                borderRadius: 12, padding: "16px", marginBottom: 10,
                display: "flex", alignItems: "flex-start", gap: 14,
                cursor: "pointer", transition: "border-color .15s",
                animation: `fadeUp .3s ease ${i * 0.04}s both`,
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border2)")}
            >
              <div style={{
                width: 42, height: 42, borderRadius: 10, fontSize: 20,
                background: "var(--surface)", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>{icon}</div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: srcColor, marginBottom: 4 }}>
                  {t.source}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8, lineHeight: 1.4 }}>
                  {t.title}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="badge badge-purple">{t.tag || "general"}</span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                    {relevance}% relevance
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted2)" }}>
                    · click to generate →
                  </span>
                </div>
              </div>

              {/* Relevance bar */}
              <div style={{ width: 60, flexShrink: 0 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4, textAlign: "right" }}>
                  {relevance}%
                </div>
                <div className="progress">
                  <div className="progress-fill" style={{ width: `${relevance}%` }} />
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </AppShell>
  );
}
