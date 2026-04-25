"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AppShell from "@/components/AppShell";
import { generateContent, approveDraft } from "@/lib/api";

const PLAT_LABEL: Record<string, string> = { linkedin: "LinkedIn", instagram: "Instagram", twitter: "X (Twitter)" };
const PLAT_BADGE: Record<string, string> = { linkedin: "badge-blue", instagram: "badge-pink", twitter: "badge-purple" };
const PLAT_COLOR: Record<string, string> = { linkedin: "var(--blue)", instagram: "var(--pink)", twitter: "var(--accent2)" };

type Draft = {
  platform: string;
  content: string;
  carousel_slides: any[] | null;
  draft_id: string;
  editing: string;
  approved: boolean;
};

export default function GeneratePage() {
  const [topic,    setTopic]    = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const [type,     setType]     = useState("post");
  const [loading,  setLoading]  = useState(false);
  const [drafts,   setDrafts]   = useState<Draft[]>([]);

  // Pre-fill topic from trends page
  useEffect(() => {
    const prefill = sessionStorage.getItem("prefill_topic");
    if (prefill) { setTopic(prefill); sessionStorage.removeItem("prefill_topic"); }
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) { toast.error("Enter a topic or paste a trend"); return; }
    setLoading(true);
    setDrafts([]);
    try {
      const results = await generateContent({ topic, platform, content_type: type });
      const mapped: Draft[] = results.map((r: any) => ({
        ...r,
        editing:  r.content,
        approved: false,
      }));
      setDrafts(mapped);
      toast.success(`${mapped.length} post${mapped.length > 1 ? "s" : ""} generated`);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e.message;
      if (msg?.includes("Identity not found")) toast.error("Save your identity profile first → Identity page");
      else if (msg?.includes("OPENAI_API_KEY")) toast.error("Set OPENAI_API_KEY in backend/.env");
      else toast.error("Generation failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (idx: number) => {
    const draft = drafts[idx];
    try {
      await approveDraft(draft.draft_id);
      setDrafts(prev => prev.map((d, i) => i === idx ? { ...d, approved: true } : d));
      toast.success("Approved → queued for scheduling");
    } catch {
      toast.error("Approve failed");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const updateEditing = (idx: number, val: string) => {
    setDrafts(prev => prev.map((d, i) => i === idx ? { ...d, editing: val } : d));
  };

  return (
    <AppShell>
      <div style={{ padding: 32, maxWidth: 860, animation: "fadeUp .3s ease" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-1px" }}>
            Content <span style={{ color: "var(--accent2)" }}>Generation</span>
          </h1>
          <p style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
            // identity_context + topic → platform_native_content
          </p>
        </div>

        {/* Phase strip */}
        <div style={{
          display: "flex", gap: 0, marginBottom: 28,
          border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden",
        }}>
          {[
            { n:"01", label:"IDENTITY",    done: true,  active: false },
            { n:"02", label:"TREND TOPIC", done: false, active: true  },
            { n:"03", label:"GENERATE",    done: false, active: true  },
            { n:"04", label:"REVIEW",      done: false, active: false },
            { n:"05", label:"SCHEDULE",    done: false, active: false },
          ].map(s => (
            <div key={s.n} style={{
              flex: 1, padding: "10px 14px",
              borderRight: "1px solid var(--border)",
              background: s.done ? "rgba(34,197,94,.04)" : s.active ? "rgba(124,108,255,.06)" : "transparent",
            }}>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: s.done ? "var(--green)" : s.active ? "var(--accent)" : "var(--muted2)", marginBottom: 2 }}>
                {s.n}
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: s.done ? "var(--green)" : s.active ? "var(--accent2)" : "var(--muted2)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Generation form */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-label">Topic / Prompt</div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>What to write about</label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Paste a trending topic or write your own idea. e.g. 'AI agents are replacing SaaS in 2025'"
              style={{ minHeight: 75 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div className="field">
              <label>Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)}>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram Carousel</option>
                <option value="twitter">X (Twitter)</option>
                <option value="all">All Platforms</option>
              </select>
            </div>
            <div className="field">
              <label>Content Type</label>
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="post">Standard Post</option>
                <option value="story">Personal Story</option>
                <option value="thread">Thread / Carousel</option>
                <option value="opinion">Hot Take / Opinion</option>
                <option value="educational">Educational</option>
              </select>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading
              ? <><span className="spinner" /> Generating with your identity context...</>
              : "⬡ Generate Content"}
          </button>
        </div>

        {/* Generated output */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <span className="spinner spinner-lg" />
            <p style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)", marginTop: 16 }}>
              Building identity-aware content...
            </p>
          </div>
        )}

        {drafts.map((draft, idx) => (
          <div
            key={idx}
            style={{
              background: "var(--surface2)", border: `1px solid ${draft.approved ? "rgba(34,197,94,.3)" : "var(--border2)"}`,
              borderRadius: 14, marginBottom: 14, overflow: "hidden",
              animation: `fadeUp .3s ease ${idx * 0.1}s both`,
              opacity: draft.approved ? 0.6 : 1,
            }}
          >
            {/* Card header */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderBottom: "1px solid var(--border)",
            }}>
              <span className={`badge ${PLAT_BADGE[draft.platform] || "badge-purple"}`}>
                {PLAT_LABEL[draft.platform] || draft.platform}
              </span>
              <span className="badge badge-amber">{type}</span>
              {draft.approved
                ? <span className="badge badge-green">APPROVED ✓</span>
                : <span className="badge" style={{ background:"rgba(124,108,255,.1)", color:"var(--accent2)", border:"1px solid rgba(124,108,255,.2)" }}>GENERATED</span>
              }
            </div>

            {/* Carousel preview */}
            {draft.carousel_slides && draft.carousel_slides.length > 0 && (
              <div style={{ padding: "16px 16px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--accent)", marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>
                  Carousel preview — {draft.carousel_slides.length} slides
                </div>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 14 }}>
                  {draft.carousel_slides.map((s: any, si: number) => (
                    <div key={si} style={{
                      minWidth: 150, maxWidth: 150, height: 190,
                      background: "linear-gradient(135deg, #1a1030, #0d1a30)",
                      border: "1px solid var(--border2)", borderRadius: 10,
                      display: "flex", flexDirection: "column", padding: 12, flexShrink: 0,
                    }}>
                      <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 6 }}>
                        SLIDE {si + 1}/{draft.carousel_slides!.length}
                      </div>
                      {s.emoji && <div style={{ fontSize: 20, marginBottom: 6 }}>{s.emoji}</div>}
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text)", lineHeight: 1.3, marginBottom: 6 }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.5, flex: 1, overflow: "hidden" }}>
                        {s.body}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editable content */}
            <div style={{ padding: 16 }}>
              <textarea
                className="content-edit"
                value={draft.editing}
                onChange={e => updateEditing(idx, e.target.value)}
                disabled={draft.approved}
              />
            </div>

            {/* Footer */}
            <div style={{
              padding: "10px 16px", borderTop: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(draft.editing)}>⎘ Copy</button>
                <button className="btn btn-ghost btn-sm" onClick={handleGenerate} disabled={loading}>↻ Retry</button>
              </div>
              {!draft.approved && (
                <button className="btn btn-primary btn-sm" onClick={() => handleApprove(idx)}>
                  ✓ Approve & Queue
                </button>
              )}
            </div>
          </div>
        ))}

      </div>
    </AppShell>
  );
}
