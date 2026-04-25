"use client";
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import toast from "react-hot-toast";
import AppShell from "@/components/AppShell";
import { getDrafts, createWeekPlan, getUpcoming, publishInstagram } from "@/lib/api";

const PLAT_COLOR: Record<string, string> = {
  linkedin:  "var(--blue)",
  instagram: "var(--pink)",
  twitter:   "var(--accent2)",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [planning,  setPlanning]  = useState(false);
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getUpcoming();
      setScheduled(data);
    } catch (e: any) {
      toast.error("Could not load calendar: " + (e?.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAutoPlan = async () => {
    setPlanning(true);
    try {
      // Get all approved drafts
      const drafts = await getDrafts("approved");
      if (!drafts.length) {
        toast.error("No approved drafts yet. Approve some posts in Review first.");
        return;
      }
      const ids = drafts.map((d: any) => d.id);
      const result = await createWeekPlan(ids);
      toast.success(`${result.schedule.length} posts scheduled across the week ✓`);
      await load();
    } catch (e: any) {
      toast.error("Auto-plan failed: " + (e?.response?.data?.detail || e.message));
    } finally {
      setPlanning(false);
    }
  };

  const handlePublishNow = async (draftId: string, platform: string) => {
    if (platform !== "instagram") {
      toast("Copy the content and paste manually for LinkedIn/X (API approval required)");
      return;
    }
    try {
      await publishInstagram(draftId);
      toast.success("Published to Instagram ✓");
      await load();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e.message;
      if (msg?.includes("INSTAGRAM_ACCESS_TOKEN")) {
        toast.error("Set INSTAGRAM_ACCESS_TOKEN in backend/.env");
      } else {
        toast.error("Publish failed: " + msg);
      }
    }
  };

  // Group scheduled posts by day
  const getPostsForDay = (dayIdx: number) => {
    const dayDate = addDays(weekStart, dayIdx);
    const dayStr  = format(dayDate, "yyyy-MM-dd");
    return scheduled.filter(s => {
      if (!s.scheduled_for) return false;
      return s.scheduled_for.startsWith(dayStr);
    });
  };

  return (
    <AppShell>
      <div style={{ padding: 32, animation: "fadeUp .3s ease" }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px" }}>
            Content <span style={{ color: "var(--accent2)" }}>Calendar</span>
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
            // 7-day schedule → approve → auto-post via Instagram Graph API
          </p>
        </div>

        {/* Instagram API note */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--pink)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Instagram Auto-Post — backend/.env
            </div>
            <code style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", lineHeight: 1.8, display: "block" }}>
              INSTAGRAM_ACCESS_TOKEN=...<br/>
              INSTAGRAM_ACCOUNT_ID=...<br/>
              <span style={{ color: "var(--muted2)" }}># developers.facebook.com</span>
            </code>
          </div>
          <div>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
              Carousel Render Service
            </div>
            <code style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", lineHeight: 1.8, display: "block" }}>
              cd carousel-service<br/>
              npm install && node server.js<br/>
              <span style={{ color: "var(--muted2)" }}># runs on :3001</span>
            </code>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24 }}>
          <button className="btn btn-primary" onClick={handleAutoPlan} disabled={planning}>
            {planning ? <><span className="spinner" /> Planning...</> : "⬡ Auto-Plan Week"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={load}>↺ Refresh</button>
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
            Distributes approved drafts across 7 days at optimal times
          </span>
        </div>

        {/* 7-day grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {DAYS.map((day, i) => {
            const dayDate = addDays(weekStart, i);
            const posts   = getPostsForDay(i);
            const isToday = format(dayDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

            return (
              <div
                key={day}
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${isToday ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 12, padding: 12, minHeight: 140,
                }}
              >
                <div style={{
                  fontSize: 10, fontFamily: "var(--font-mono)",
                  color: isToday ? "var(--accent)" : "var(--muted)",
                  marginBottom: 10,
                }}>
                  {day} {format(dayDate, "d")}
                  {isToday && <span style={{ marginLeft: 4, color: "var(--accent)" }}>●</span>}
                </div>

                {posts.length === 0 && (
                  <div style={{ fontSize: 10, color: "var(--muted2)", fontFamily: "var(--font-mono)" }}>
                    free slot
                  </div>
                )}

                {posts.map((p, pi) => {
                  const draft   = p.content_drafts;
                  const platCol = PLAT_COLOR[p.platform] || "var(--accent2)";
                  const time    = p.scheduled_for
                    ? new Date(p.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "";

                  return (
                    <div
                      key={pi}
                      style={{
                        background: "var(--surface2)", border: "1px solid var(--border2)",
                        borderRadius: 8, padding: "6px 8px", marginBottom: 6,
                      }}
                    >
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: platCol, marginBottom: 2 }}>
                        {p.platform?.toUpperCase()} · {time}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.4 }}>
                        {draft?.content?.slice(0, 45) || "scheduled post"}...
                      </div>
                      {p.status === "pending" && (
                        <button
                          className="btn btn-xs btn-ghost"
                          style={{ marginTop: 6, width: "100%", justifyContent: "center" }}
                          onClick={() => handlePublishNow(p.draft_id, p.platform)}
                        >
                          ↑ Post now
                        </button>
                      )}
                      {p.status === "posted" && (
                        <div style={{ fontSize: 9, color: "var(--green)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                          ✓ posted
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          {Object.entries(PLAT_COLOR).map(([plat, col]) => (
            <div key={plat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                {plat}
              </span>
            </div>
          ))}
        </div>

      </div>
    </AppShell>
  );
}
