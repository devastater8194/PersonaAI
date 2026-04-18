"use client";

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import BlurText from './components/BlurText';
import LightRays from './components/LightRays';
import CardSwap, { Card } from './components/CardSwap';

/* ─────────────── Section Wrapper ─────────────── */
function Section({ children, className = "", id = "" }) {
  return (
    <section
      id={id}
      className={`relative w-full px-6 md:px-16 lg:px-24 ${className}`}
    >
      {children}
    </section>
  );
}

/* ─────────────── Fade-in on scroll ─────────────── */
function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────── Counter animation ─────────────── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let curr = 0;
        const step = Math.max(1, Math.floor(target / 40));
        const interval = setInterval(() => {
          curr += step;
          if (curr >= target) { curr = target; clearInterval(interval); }
          setCount(curr);
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════ */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative bg-black text-white font-[family-name:var(--font-inter)] overflow-x-hidden">

      {/* ═══════════════ STICKY NAV ═══════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-xl" : "bg-transparent"
      }`}>
        <div className="font-[family-name:var(--font-plus-jakarta)] font-bold text-xl tracking-tight">
          Persona<span className="text-indigo-500">AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#stats" className="hover:text-white transition-colors">Results</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/register" className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ═══════════════ SECTION 1 — HERO ═══════════════ */}
      <Section className="min-h-screen flex items-center justify-center pt-20 pb-10" id="hero">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <LightRays
            raysOrigin="top-center"
            raysColor="#4f46e5"
            raysSpeed={1.5}
            lightSpread={1.2}
            rayLength={2}
            fadeDistance={1}
            saturation={1}
            pulsating={true}
            mouseInfluence={0.15}
            noiseAmount={0.05}
          />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-12">
          {/* Left — Text */}
          <div className="flex-1 max-w-2xl">
            <div className="font-[family-name:var(--font-plus-jakarta)] font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6">
              <BlurText text="Your Identity." delay={100} className="text-white" />
              <BlurText text="Your Voice." delay={100} className="text-gray-300" />
              <BlurText text="Your Content." delay={100} className="text-indigo-400" />
            </div>

            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl leading-relaxed animate-[fadeUp_1s_ease_0.5s_both]">
              Stop sounding like an AI. Connect your identity, configure your voice, and instantly generate    highly personalized content that actually sounds like <span className="text-white font-medium">you</span>.
            </p>

            <div className="flex flex-wrap gap-4 animate-[fadeUp_1s_ease_0.7s_both]">
              <Link href="/register" className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">
                Start Building Free
              </Link>
              <Link href="/login" className="px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors">
                Go to Dashboard →
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 animate-[fadeUp_1s_ease_0.9s_both]">
              <div className="flex -space-x-2">
                {["bg-indigo-500","bg-emerald-500","bg-amber-500","bg-rose-500"].map((c,i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-black flex items-center justify-center text-[10px] font-bold text-white`}>
                    {String.fromCharCode(65+i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">Trusted by <span className="text-white font-semibold">2,400+</span> creators</p>
            </div>
          </div>

          {/* Right — CardSwap */}
          <div className="flex-1 w-full h-[500px] relative hidden md:block animate-[fadeUp_1s_ease_1s_both]">
            <CardSwap width={350} height={450} cardDistance={40} verticalDistance={40} delay={4000} skewAmount={8}>
              <Card className="p-8 border border-white/10 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                    <span className="text-indigo-400 text-xl">◉</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-bold mb-3 text-white">Identity Engine</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    We vectorize your profile, skills, and journey into pgvector. The AI reads your identity before writing a single word.
                  </p>
                </div>
                <div className="w-full h-2 bg-indigo-500/10 rounded-full overflow-hidden mt-6">
                  <div className="h-full bg-indigo-500 w-[80%] rounded-full"></div>
                </div>
              </Card>

              <Card className="p-8 border border-white/10 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                    <span className="text-emerald-400 text-xl">⬡</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-bold mb-3 text-white">Smart Generation</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Powered by GPT-4o or local Ollama, pulling exact context from your identity vectors. Your tone, perfectly replicated.
                  </p>
                </div>
                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  </div>
                  <div className="text-xs font-mono text-emerald-400">✓ Context loaded</div>
                  <div className="text-xs font-mono text-gray-500">Generating LinkedIn Post...</div>
                </div>
              </Card>

              <Card className="p-8 border border-white/10 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
                    <span className="text-amber-400 text-xl">◎</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-plus-jakarta)] text-2xl font-bold mb-3 text-white">Trend Matching</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Live trends from HackerNews, X, and Dev.to, scored against your identity via cosine similarity.
                  </p>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-8 bg-white/5 rounded px-3 flex items-center justify-between border border-white/5">
                    <span className="text-xs text-gray-300">OpenAI o3 Released</span>
                    <span className="text-xs text-emerald-400">97%</span>
                  </div>
                  <div className="h-8 bg-white/5 rounded px-3 flex items-center justify-between border border-white/5">
                    <span className="text-xs text-gray-300">pgvector 0.7 updates</span>
                    <span className="text-xs text-emerald-400">82%</span>
                  </div>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce z-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Scroll</span>
          <div className="w-px h-6 bg-gradient-to-b from-gray-500 to-transparent"></div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 2 — FEATURES ═══════════════ */}
      <Section className="py-28" id="features">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-semibold mb-4 inline-block">Features</span>
              <h2 className="font-[family-name:var(--font-plus-jakarta)] text-4xl md:text-5xl font-bold mb-4">
                Everything you need to go from<br/><span className="text-indigo-400">idea to published</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                A complete pipeline: define identity → detect trends → generate content → review → auto-schedule. All in one platform.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "◉", color: "indigo", title: "Identity Vectorization", desc: "Your background, skills, tone, and journey are embedded with OpenAI text-embedding-3-small and stored in Supabase pgvector for instant recall." },
              { icon: "◎", color: "amber", title: "Real-Time Trend Detection", desc: "Multi-source scraping from Google News RSS, HackerNews, Dev.to, and Reddit. Each trend is cosine-scored against your identity." },
              { icon: "⬡", color: "emerald", title: "AI Content Generation", desc: "One-click generation across LinkedIn, X, and Instagram using GPT-4o or local Ollama. Full identity context injected into every prompt." },
              { icon: "◇", color: "rose", title: "Multi-Platform Support", desc: "LinkedIn posts, X threads, Instagram carousels — each format is natively understood and optimized for maximum platform engagement." },
              { icon: "⬢", color: "violet", title: "Review & Approval", desc: "Human-in-the-loop review system. Edit, approve, or reject every draft before it touches your social accounts." },
              { icon: "△", color: "cyan", title: "Auto-Schedule & Post", desc: "APScheduler-powered posting queue with platform-specific OAuth. Set it and forget it — your content ships on time." },
            ].map((feat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-[#0d0d11] border border-white/5 rounded-2xl p-7 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 group h-full">
                  <div className={`w-12 h-12 bg-${feat.color}-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <span className={`text-${feat.color}-400 text-lg`}>{feat.icon}</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-plus-jakarta)] text-lg font-bold mb-2 text-white">{feat.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 3 — HOW IT WORKS ═══════════════ */}
      <Section className="py-28 bg-[#060609]" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-semibold mb-4 inline-block">How it works</span>
              <h2 className="font-[family-name:var(--font-plus-jakarta)] text-4xl md:text-5xl font-bold mb-4">
                Four phases.<br/>One <span className="text-emerald-400">content machine</span>.
              </h2>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-emerald-500 to-amber-500 opacity-20 hidden md:block"></div>

            {[
              { phase: "01", title: "Define Your Identity", desc: "Fill in your profile — domain, journey, tone, achievements. We embed it into a 1536-dimension vector and store it in pgvector.", color: "indigo", side: "left" },
              { phase: "02", title: "Discover Trending Topics", desc: "Our scrapers pull live data from HackerNews, Reddit, Dev.to, and Google News. Each article is cosine-scored against your identity to find the best matches.", color: "emerald", side: "right" },
              { phase: "03", title: "Generate & Review", desc: "Pick a topic, select platforms, and hit Generate. Your identity context is injected into the prompt for perfect voice replication. Review and edit before approving.", color: "amber", side: "left" },
              { phase: "04", title: "Auto-Schedule & Post", desc: "Approved content drops into the scheduling queue. APScheduler fires posts at optimal times via each platform's API.", color: "rose", side: "right" },
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className={`flex items-start gap-8 mb-16 last:mb-0 ${step.side === 'right' ? 'md:flex-row-reverse md:text-right' : ''}`}>
                  <div className={`shrink-0 w-12 h-12 rounded-full bg-${step.color}-500/20 border border-${step.color}-500/30 flex items-center justify-center z-10`}>
                    <span className={`text-${step.color}-400 text-sm font-bold font-mono`}>{step.phase}</span>
                  </div>
                  <div className="max-w-lg">
                    <h3 className="font-[family-name:var(--font-plus-jakarta)] text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 4 — STATS ═══════════════ */}
      <Section className="py-28" id="stats">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.3em] text-rose-400 font-semibold mb-4 inline-block">Results</span>
              <h2 className="font-[family-name:var(--font-plus-jakarta)] text-4xl md:text-5xl font-bold mb-4">
                Built for <span className="text-rose-400">serious creators</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 2400, suffix: "+", label: "Active Creators" },
              { value: 50, suffix: "K+", label: "Posts Generated" },
              { value: 97, suffix: "%", label: "Identity Match" },
              { value: 12, suffix: "x", label: "Faster than Manual" },
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-[#0d0d11] border border-white/5 rounded-2xl p-8 text-center hover:border-white/10 transition-colors">
                  <div className="font-[family-name:var(--font-plus-jakarta)] text-4xl md:text-5xl font-bold text-white mb-2">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 5 — TECH STACK ═══════════════ */}
      <Section className="py-28 bg-[#060609]" id="tech">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold mb-4 inline-block">Under the hood</span>
              <h2 className="font-[family-name:var(--font-plus-jakarta)] text-4xl md:text-5xl font-bold mb-4">
                Production-grade <span className="text-amber-400">tech stack</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Next.js 16", desc: "React Frontend", bg: "from-gray-800 to-gray-900" },
              { name: "FastAPI", desc: "Python Backend", bg: "from-emerald-900/30 to-gray-900" },
              { name: "Supabase", desc: "Auth + pgvector", bg: "from-emerald-900/20 to-gray-900" },
              { name: "OpenAI", desc: "GPT-4o + Embeddings", bg: "from-indigo-900/20 to-gray-900" },
              { name: "Ollama", desc: "Local LLM Option", bg: "from-violet-900/20 to-gray-900" },
              { name: "GSAP", desc: "Animations", bg: "from-amber-900/20 to-gray-900" },
              { name: "APScheduler", desc: "Job Scheduling", bg: "from-rose-900/20 to-gray-900" },
              { name: "pgvector", desc: "Vector Similarity", bg: "from-cyan-900/20 to-gray-900" },
            ].map((tech, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className={`bg-gradient-to-br ${tech.bg} border border-white/5 rounded-xl p-5 hover:border-white/15 transition-all group`}>
                  <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{tech.name}</div>
                  <div className="text-[11px] text-gray-500">{tech.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 6 — PRICING ═══════════════ */}
      <Section className="py-28" id="pricing">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-[0.3em] text-violet-400 font-semibold mb-4 inline-block">Pricing</span>
              <h2 className="font-[family-name:var(--font-plus-jakarta)] text-4xl md:text-5xl font-bold mb-4">
                Simple, <span className="text-violet-400">transparent</span> pricing
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                desc: "For exploring the platform",
                features: ["3 posts/month", "1 platform", "Manual scheduling", "Community support"],
                cta: "Get Started",
                highlighted: false
              },
              {
                name: "Pro",
                price: "$29",
                period: "/month",
                desc: "For serious content creators",
                features: ["Unlimited posts", "All platforms", "Auto-scheduling", "Priority support", "Custom tones", "Trend alerts"],
                cta: "Start Pro Trial",
                highlighted: true
              },
              {
                name: "Team",
                price: "$79",
                period: "/month",
                desc: "For agencies and teams",
                features: ["Everything in Pro", "5 team members", "Brand guidelines", "API access", "Dedicated support"],
                cta: "Contact Sales",
                highlighted: false
              },
            ].map((plan, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className={`rounded-2xl p-8 flex flex-col h-full transition-all ${
                  plan.highlighted
                    ? "bg-indigo-600/10 border-2 border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.15)] scale-[1.02]"
                    : "bg-[#0d0d11] border border-white/5 hover:border-white/10"
                }`}>
                  {plan.highlighted && (
                    <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-4 text-center">Most Popular</div>
                  )}
                  <h3 className="font-[family-name:var(--font-plus-jakarta)] text-lg font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-gray-500 text-xs mb-5">{plan.desc}</p>
                  <div className="mb-6">
                    <span className="font-[family-name:var(--font-plus-jakarta)] text-4xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-gray-500 text-sm">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="text-emerald-500 text-xs">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`text-center py-3 rounded-xl font-medium text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}>
                    {plan.cta}
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════ SECTION 7 — CTA ═══════════════ */}
      <Section className="py-28 bg-[#060609]" id="cta">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-plus-jakarta)] text-4xl md:text-5xl font-bold mb-6">
              Ready to sound like <span className="text-indigo-400">yourself</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of creators who stopped sounding generic and started building their authentic voice online.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-[0_0_30px_rgba(79,70,229,0.3)] text-lg">
                Create Your Engine — Free
              </Link>
            </div>
          </FadeIn>
        </div>
      </Section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-white/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-[family-name:var(--font-plus-jakarta)] font-bold text-lg">
            Persona<span className="text-indigo-500">AI</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
          <div className="text-xs text-gray-600">© 2026 PersonaAI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}