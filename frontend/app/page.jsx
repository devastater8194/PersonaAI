"use client";

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import BlurText from './components/BlurText';
import LightRays from './components/LightRays';
import CardSwap, { Card } from './components/CardSwap';
import MagicBento from './components/MagicBento';


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


export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menuItems = [
    {
      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=900&auto=format&fit=crop&grayscale=true',
      link: '#',
      title: 'Identity Vectorization',
      description: 'Your background, skills, tone, and journey are embedded into pgvector.'
    },
    {
      image: 'https://images.unsplash.com/photo-1542382257-80ddfcbefd47?q=80&w=900&auto=format&fit=crop&grayscale=true',
      link: '#',
      title: 'Real-Time Trends',
      description: 'Live data scoring from global platforms against your identity vector.'
    },
    {
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=900&auto=format&fit=crop&grayscale=true',
      link: '#',
      title: 'AI Content Generation',
      description: 'One-click generation across platforms, powered by your voice.'
    },
    {
      image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=900&auto=format&fit=crop&grayscale=true',
      link: '#',
      title: 'Multi-Platform',
      description: 'Natively optimized for LinkedIn, X threads, and Instagram carousels.'
    },
    {
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=900&auto=format&fit=crop&grayscale=true',
      link: '#',
      title: 'APScheduler Queues',
      description: 'Set it and let it run. Your approved drafts go live automatically.'
    }
  ];

  return (
    <div className="relative bg-black text-white font-[family-name:var(--font-manrope)] overflow-x-hidden">


      <nav className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-sm" : "bg-transparent"
      }`}>
        <div className="font-[family-name:var(--font-outfit)] font-semibold flex items-center gap-2 text-xl tracking-tight">
          <div className="w-6 h-6 rounded-sm bg-white text-black flex items-center justify-center font-bold text-sm">P</div>
          Persona
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Platform</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">Process</a>
          <a href="#stats" className="hover:text-white transition-colors">Metrics</a>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Log In
          </Link>
          <Link href="/register" className="px-6 py-2.5 text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors">
            Get Access
          </Link>
        </div>
      </nav>


      <Section className="min-h-screen flex items-center justify-center pt-28 pb-10" id="hero">
        <div className="absolute inset-0 z-0 opacity-40">
          <LightRays
            raysOrigin="top-center"
            raysColor="#ffffff"
            raysSpeed={0.5}
            lightSpread={1.5}
            rayLength={3}
            fadeDistance={1}
            saturation={0}
            pulsating={true}
            mouseInfluence={0.05}
            noiseAmount={0.02}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl mx-auto text-center">
          <div className="font-[family-name:var(--font-outfit)] font-medium text-6xl md:text-8xl leading-[1.05] tracking-tight mb-8">
            <BlurText text="Digital Presence." delay={80} className="text-white block" />
            <BlurText text="Engineered." delay={80} className="text-gray-500 block" />
          </div>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl font-light leading-relaxed animate-[fadeUp_1s_ease_0.5s_both]">
            A programmatic approach to personal branding. Upload your identity vector, align with live trends, and generate natively structured formats with absolute precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 animate-[fadeUp_1s_ease_0.7s_both]">
            <Link href="/register" className="px-10 py-4 bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors uppercase tracking-widest w-full sm:w-auto">
              Initialize Engine
            </Link>
          </div>

          <div className="mt-20 border-t border-white/10 pt-10 w-full animate-[fadeUp_1s_ease_1s_both]">
             <p className="text-xs uppercase tracking-widest text-gray-500 mb-6 font-semibold">Adopted by industry leaders</p>
             <div className="flex flex-wrap items-center justify-center gap-12 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
                <span className="font-[family-name:var(--font-outfit)] text-xl font-bold">META</span>
                <span className="font-[family-name:var(--font-outfit)] text-xl font-bold">NETFLIX</span>
                <span className="font-[family-name:var(--font-outfit)] text-xl font-bold">STRIPE</span>
                <span className="font-[family-name:var(--font-outfit)] text-xl font-bold">VERCEL</span>
             </div>
          </div>
        </div>
      </Section>


      <Section className="py-32 bg-[#050505]" id="features">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <div className="mb-16 text-center">
             <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-4 inline-block">01 / Platform Capabilities</span>
             <h2 className="font-[family-name:var(--font-outfit)] text-4xl md:text-5xl font-light tracking-tight">
               Explore the Engine
             </h2>
          </div>
          <div className="w-full flex justify-center">
            <MagicBento />
          </div>
        </div>
      </Section>


      <Section className="py-32 bg-black" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="mb-20">
              <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-4 inline-block">02 / Execution Flow</span>
              <h2 className="font-[family-name:var(--font-outfit)] text-4xl md:text-5xl font-light tracking-tight">
                Systematic processing.
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
            {[
              { phase: "01", title: "Identity Modeling", desc: "We translate your semantic profile, historical achievements, and vocal cadence into a mathematical space within pgvector, establishing your ground truth." },
              { phase: "02", title: "Signal Detection", desc: "Our daemon continuously scrapes unstructured tech news (HN, Dev.to). It runs high-dimensional similarity matches against your identity vector to surface hyper-relevant topics." },
              { phase: "03", title: "Content Synthesis", desc: "Leveraging structured prompts via GPT-4o, we fuse your identity context with trending signals to synthesize deterministic, platform-native outputs." },
              { phase: "04", title: "Automated Deployment", desc: "Utilizing APScheduler chron jobs, final outputs are pushed precisely when your audience is most active via direct secure API integrations." },
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="border-t border-white/20 pt-8 group">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-[family-name:var(--font-outfit)] text-2xl font-light text-white">{step.title}</h3>
                    <span className="text-white/20 text-sm font-mono group-hover:text-white transition-colors">{step.phase}</span>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed max-w-sm">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>


      <Section className="py-32 bg-[#050505]" id="stats">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <FadeIn>
              <h2 className="font-[family-name:var(--font-outfit)] text-4xl md:text-5xl font-light tracking-tight leading-[1.1] mb-8">
                Empowering high-leverage outputs.
              </h2>
              <p className="text-white/50 text-lg leading-relaxed max-w-md">
                Skip the manual drafting. Let computation handle context aggregation and synthesis, leaving you strictly with strategic review and deployment.
              </p>
            </FadeIn>

            <div className="grid grid-cols-2 gap-8">
              {[
                { value: 2400, suffix: "+", label: "Active Nodes" },
                { value: 50, suffix: "K", label: "Syntheses" },
                { value: 99, suffix: "%", label: "Coherence" },
                { value: 12, suffix: "x", label: "Velocity" },
              ].map((stat, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="border-l border-white/20 pl-6 py-2">
                    <div className="font-[family-name:var(--font-outfit)] text-5xl font-light text-white mb-2">
                      <Counter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">{stat.label}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </Section>


      <Section className="py-32 bg-black" id="tech">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
             <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold mb-4 inline-block">03 / Architecture</span>
             <h2 className="font-[family-name:var(--font-outfit)] text-4xl md:text-5xl font-light tracking-tight mb-16">
               Industrial-grade stack.
             </h2>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {[
              { name: "Next.js", desc: "App Router Runtime" },
              { name: "FastAPI", desc: "Async Python Core" },
              { name: "Supabase", desc: "Auth & Persistence" },
              { name: "OpenAI", desc: "O1 Cognitive Engine" },
              { name: "Ollama", desc: "Local Inferencing" },
              { name: "WebGL", desc: "Hardware Rendering" },
              { name: "APScheduler", desc: "Chron Management" },
              { name: "pgvector", desc: "Vector Database" },
            ].map((tech, i) => (
              <FadeIn key={i} delay={i * 0.05} className="group">
                <div className="border-b border-white/10 pb-4">
                  <div className="text-base font-medium text-white mb-1 group-hover:pl-2 transition-all">{tech.name}</div>
                  <div className="text-[11px] text-white/40 tracking-wide uppercase">{tech.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </Section>


      <Section className="py-32 bg-[#050505] text-center" id="cta">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-outfit)] text-5xl md:text-7xl font-light tracking-tight mb-8">
              Start building.
            </h2>
            <Link href="/register" className="inline-block px-12 py-5 bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-colors uppercase tracking-widest">
              Create Environment
            </Link>
          </FadeIn>
        </div>
      </Section>


      <footer className="border-t border-white/10 py-12 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-[family-name:var(--font-outfit)] font-semibold flex items-center gap-2 tracking-tight">
             <div className="w-5 h-5 rounded-sm bg-white text-black flex items-center justify-center font-bold text-xs">P</div>
             PersonaAI
          </div>
          <div className="flex gap-8 text-[11px] uppercase tracking-widest font-semibold text-white/40">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Architecture</a>
            <Link href="/login" className="hover:text-white transition-colors">Access</Link>
          </div>
          <div className="text-[11px] text-white/20 uppercase tracking-widest font-semibold">© 2026 Systems</div>
        </div>
      </footer>
    </div>
  );
}