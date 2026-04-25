"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AppShell from "@/components/AppShell";
import { getDrafts, approveDraft, deleteDraft } from "@/lib/api";

const PLAT_BADGE: Record<string, string> = { linkedin: "badge-blue", instagram: "badge-pink", twitter: "badge-purple" };
const PLAT_LABEL: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", twitter: "X (Twitter)" };
const STATUS_BADGE: Record<string, string> = {
  draft: "badge-amber", approved: "badge-green", scheduled: "badge-purple", posted: "badge-blue"
};

export default function ReviewPage() {
  const [filter,  setFilter]  = useState("all");
  const [drafts,  setDrafts]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDrafts();
      setDrafts(data);
    } catch (e: any) {
      toast.error("Could not load drafts: " + (e?.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveDraft(id);
      setDrafts(prev => prev.map(d => d.id === id ? { ...d, status: "approved" } : d));
      toast.success("Approved ✓");
    } catch { toast.error("Approve failed"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDraft(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  };

  const visible = filter === "all" ? drafts : drafts.filter(d => d.platform === filter || d.status === filter);

  const TabBtn = ({ val, label }: { val: string; label: string }) => (
    <button
      className={`btn btn-ghost btn-sm`}
      style={filter === val ? { borderColor: "var(--accent)", color: "var(--accent2)", background: "rgba(124,108,255,.08)" } : {}}
      onClick={() => setFilter(val)}
    >{label}</button>
  );

  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 860, animation: "fadeUp .3s ease" }}>

        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px" }}>
            Review & <span style={{ color: "var(--accent2)" }}>Approve</span>
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
            // edit → approve → auto-queue to calendar
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          <TabBtn val="all"       label="All" />
          <TabBtn val="draft"     label="Drafts" />
          <TabBtn val="approved"  label="Approved" />
          <TabBtn val="linkedin"  label="LinkedIn" />
          <TabBtn val="instagram" label="Instagram" />
          <TabBtn val="twitter"   label="X (Twitter)" />
          <button className="btn btn-ghost btn-sm" onClick={load} style={{ marginLeft: "auto" }}>
            ↺ Refresh
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <span className="spinner spinner-lg" />
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 0",
            color: "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 13,
          }}>
            No content here.<br />
            <span style={{ fontSize: 12, color: "var(--muted2)" }}>Go to Generate to create posts first.</span>
          </div>
        )}

        {visible.map((d, i) => (
          <div
            key={d.id}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: 14, marginBottom: 12, overflow: "hidden",
              animation: `fadeUp .3s ease ${i * 0.04}s both`,
            }}
          >
            <div style={{
              display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
              padding: "12px 16px", borderBottom: "1px solid var(--border)",
            }}>
              <span className={`badge ${PLAT_BADGE[d.platform] || "badge-purple"}`}>
                {PLAT_LABEL[d.platform] || d.platform}
              </span>
              <span className={`badge ${STATUS_BADGE[d.status] || "badge-amber"}`}>
                {d.status.toUpperCase()}
              </span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginLeft: "auto" }}>
                {d.content_type} · {new Date(d.created_at).toLocaleDateString()}
              </span>
            </div>

            <div style={{ padding: "14px 16px" }}>
              {/* Topic */}
              {d.topic && (
                <div style={{
                  fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent2)",
                  marginBottom: 10, padding: "6px 10px",
                  background: "rgba(124,108,255,.07)", borderRadius: 6,
                }}>
                  Topic: {d.topic}
                </div>
              )}

              {/* Carousel slides preview */}
              {d.carousel_slides && Array.isArray(d.carousel_slides) && d.carousel_slides.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--pink)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                    Carousel — {d.carousel_slides.length} slides
                  </div>
                  <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
                    {d.carousel_slides.map((s: any, si: number) => (
                      <div key={si} style={{
                        minWidth: 130, maxWidth: 130, height: 160,
                        background: "linear-gradient(135deg, #1a1030, #0d1a30)",
                        border: "1px solid var(--border)", borderRadius: 8,
                        padding: 10, flexShrink: 0,
                      }}>
                        <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 4 }}>
                          {si + 1}/{d.carousel_slides.length}
                        </div>
                        {s.emoji && <div style={{ fontSize: 16, marginBottom: 4 }}>{s.emoji}</div>}
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text)", lineHeight: 1.3, marginBottom: 4 }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: 9, color: "var(--muted)", lineHeight: 1.4, overflow: "hidden", maxHeight: 70 }}>
                          {s.body}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content preview */}
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--text)", whiteSpace: "pre-wrap" }}>
                {d.content.length > 400 ? d.content.slice(0, 400) + "..." : d.content}
              </p>
            </div>

            <div style={{
              padding: "10px 16px", borderTop: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>
                ✕ Delete
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                {d.status === "draft" && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleApprove(d.id)}>
                    ✓ Approve
                  </button>
                )}
                {d.status === "approved" && (
                  <span className="badge badge-green">Ready to schedule →</span>
                )}
                {d.status === "scheduled" && (
                  <span className="badge badge-purple">Scheduled ✓</span>
                )}
              </div>
            </div>
          </div>
        ))}

      </div>
    </AppShell>
  );
}
