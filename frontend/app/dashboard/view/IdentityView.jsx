"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase";

export default function IdentityView({ user }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || "",
    age: "",
    domain: "",
    role: "",
    qualification: "",
    journey: "",
    interests: "",
    hobbies: "",
    achievements: "",
    tones: []
  });

  const availableTones = ["Analytical", "Bold", "Witty", "Formal", "Conversational", "Inspirational", "Technical", "Storytelling"];

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from('identities')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setProfile({
          name: data.name || profile.name,
          age: data.age || "",
          domain: data.domain || "",
          role: data.role || "",
          qualification: data.qualification || "",
          journey: data.journey || "",
          interests: data.interests || "",
          hobbies: data.hobbies || "",
          achievements: data.achievements || "",
          tones: data.tones || []
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user.id, supabase, profile.name]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleTone = (tone) => {
    if (profile.tones.includes(tone)) {
      setProfile({ ...profile, tones: profile.tones.filter(t => t !== tone) });
    } else {
      setProfile({ ...profile, tones: [...profile.tones, tone] });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "Saving and vectorizing profile...", type: "info" });
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/api/identity/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...profile
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ text: "✓ Identity successfully vectorized and saved!", type: "success" });
      } else {
        setMessage({ text: data.detail || "Failed to save identity", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Network error: Make sure FastAPI backend is running on :8000", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white mb-2">
          Phase 1 — Identity Setup
        </h2>
        <p className="text-gray-400">Your profile is vectorized into Supabase pgvector. Every post is generated from this core knowledge.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
          message.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' :
          'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Personal Info</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Age</label>
                <input type="number" name="age" value={profile.age} onChange={handleChange} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Location / Timezone</label>
                <input type="text" className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Primary Domain (Important)</label>
              <input type="text" name="domain" value={profile.domain} onChange={handleChange} placeholder="e.g. AI / Machine Learning / Startups" className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Professional Journey</h3>
          
          <div className="space-y-4">
             <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Current Role</label>
              <input type="text" name="role" value={profile.role} onChange={handleChange} placeholder="Founder / Engineer / Creator" className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Life Journey / Milestones (Affects storytelling)</label>
              <textarea name="journey" value={profile.journey} onChange={handleChange} rows={4} placeholder="Summarize key milestones in your life..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"></textarea>
            </div>
          </div>
        </div>
        
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Voice & Tone Calibration</h3>
          
          <div className="mb-5">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-3">Select your posting tones</label>
            <div className="flex flex-wrap gap-2">
              {availableTones.map(tone => (
                <button
                  key={tone}
                  onClick={() => toggleTone(tone)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${
                    profile.tones.includes(tone)
                      ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400"
                      : "bg-[#1a1a1a] border-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/5 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(79,70,229,0.2)]"
            >
              {saving ? "Vectorizing..." : "Save Identity to pgvector"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
