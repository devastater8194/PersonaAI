"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MagicRings from "../components/MagicRings";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          router.push("/login");
        } else if (session) {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#0a0a0b] text-gray-100 font-[family-name:var(--font-inter)] overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <MagicRings 
          color="#fc42ff"
          colorTwo="#42fcff"
          speed={0.5}
          ringCount={5}
          attenuation={15}
        />
      </div>

      {/* Sidebar */}
      <div className="z-10 h-full flex flex-col md:flex">
         <Sidebar user={user} />
      </div>

      {/* Main Content Pane */}
      <div className="flex flex-col flex-1 overflow-hidden z-10 w-full">
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-transparent">
           <div className="relative z-10">
               {children}
           </div>
        </main>
      </div>
    </div>
  );
}
