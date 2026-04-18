"use client";

import { useState, useEffect } from "react";

export default function GenerateView({ user }) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  
  const platforms = [
    { id: "linkedin", label: "LinkedIn Post", selected: true },
    { id: "twitter", label: "X Thread", selected: true },
    { id: "instagram", label: "IG Carousel", selected: true }
  ];

  useEffect(() => {
    // Check if passed from Trends
    const prefill = sessionStorage.getItem("prefill_topic");
    if (prefill) {
      setTopic(prefill);
      sessionStorage.removeItem("prefill_topic");
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/generate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          topic: topic,
          platform: "all",
          content_type: "post"
        })
      });
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white mb-2">
          Phase 2B — Generation Core
        </h2>
        <p className="text-gray-400">Ollama (local) / GPT-4o generation with identity context injection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111] border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Generator Settings</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Topic or Idea</label>
                <textarea 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  placeholder="What do you want to talk about?"
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Platforms</label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map(p => (
                    <div key={p.id} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {p.label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Model</label>
                <select className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors">
                  <option>OpenAI — gpt-4o-mini</option>
                  <option>Ollama — llama3.2 (local)</option>
                </select>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading || !topic}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(79,70,229,0.2)]"
              >
                {loading ? "Generating..." : "Generate AI Content"}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <div className="bg-[#111] border border-white/5 rounded-xl p-6 text-center text-sm text-gray-400 h-full flex flex-col justify-center min-h-[300px]">
               <div className="w-8 h-8 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
               Retrieving identity context from pgvector...<br/>
               Generating perfect drafts across platforms...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="bg-[#111] border border-white/5 border-dashed rounded-xl p-6 text-center text-sm text-gray-500 h-full flex flex-col justify-center min-h-[300px]">
              Ready to generate.<br/>Your drafts will appear here.
            </div>
          )}

          {!loading && results.map((res, i) => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-xl p-6 relative group animate-[fadeUp_0.4s_ease_both]" style={{animationDelay: `${i * 0.1}s`}}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    res.platform === 'linkedin' ? 'bg-blue-500/20 text-blue-400' :
                    res.platform === 'twitter' ? 'bg-gray-500/20 text-gray-300' :
                    'bg-pink-500/20 text-pink-400'
                  }`}>
                    {res.platform}
                  </span>
                  <span className="text-xs text-gray-500">&bull; Draft Auto-Saved</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-xs text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded">Edit</button>
                  <button className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">Approve</button>
                </div>
              </div>
              
              <div className="bg-[#1a1a1a] rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed border border-white/5">
                {res.content}
              </div>

              {res.platform === 'instagram' && res.carousel_slides && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {res.carousel_slides.map((slide, j) => (
                    <div key={j} className="w-32 h-40 shrink-0 bg-[#1a1a1a] border border-white/5 rounded-lg flex flex-col items-center justify-center p-3 text-center relative">
                      <span className="absolute top-2 right-2 text-[10px] text-gray-600">{slide.slide || j+1}</span>
                      <div className="text-[10px] font-bold text-white mb-2 leading-tight">{slide.title}</div>
                      <div className="text-[9px] text-gray-500 leading-tight line-clamp-4">{slide.body}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
