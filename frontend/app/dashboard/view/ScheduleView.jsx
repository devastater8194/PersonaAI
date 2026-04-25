"use client";

export default function ScheduleView({ user }) {
  // Mock data for the calendar to visualize the schedule
  const calendarDays = [
    { date: 7, label: "Mon", status: "today", posts: [{ platform: "LinkedIn", type: "li" }] },
    { date: 8, label: "Tue", status: "", posts: [{ platform: "X thread", type: "x" }] },
    { date: 9, label: "Wed", status: "", posts: [{ platform: "IG carousel", type: "ig" }, { platform: "LinkedIn", type: "li" }] },
    { date: 10, label: "Thu", status: "", posts: [{ platform: "X thread", type: "x" }] },
    { date: 11, label: "Fri", status: "", posts: [{ platform: "IG carousel", type: "ig" }] },
    { date: 12, label: "Sat", status: "", posts: [{ platform: "X post", type: "x" }] },
    { date: 13, label: "Sun", status: "", posts: [{ platform: "LinkedIn", type: "li" }] },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-[family-name:var(--font-plus-jakarta)] font-bold text-white mb-2">
          Phase 4 — Auto-Schedule + Post
        </h2>
        <p className="text-gray-400">7-day content calendar with APScheduler and Social Graph APIs.</p>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-xl p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-[family-name:var(--font-plus-jakarta)] font-semibold text-white">This Week's Queue</h3>
          <button className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border border-white/10">
            + Manual Post
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-3 mb-2">
          {calendarDays.map(day => (
            <div key={day.label} className="text-center text-[10px] text-gray-500 uppercase tracking-widest">{day.label}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-3 min-h-[120px]">
          {calendarDays.map(day => (
            <div key={day.date} className={`bg-[#1a1a1a] rounded-xl p-3 flex flex-col gap-1.5 ${day.status === 'today' ? 'border border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.15)] ring-1 ring-indigo-500/50' : 'border border-white/5'}`}>
              <div className={`text-sm font-bold text-center mb-1 ${day.status === 'today' ? 'text-indigo-400' : 'text-gray-400'}`}>{day.date}</div>
              
              {day.posts.map((post, i) => (
                <div key={i} className={`text-[10px] font-medium py-1.5 px-2 rounded-lg text-center truncate cursor-pointer transition-transform hover:scale-105 ${
                  post.type === 'li' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  post.type === 'x' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                  'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                }`}>
                  {post.platform}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">System Connections</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div className="text-sm text-gray-400">LinkedIn API</div>
              <div className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Connected</div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div className="text-sm text-gray-400">X (Twitter) v2</div>
              <div className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Connected</div>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div className="text-sm text-gray-400">Instagram Graph API</div>
              <div className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Auth Needed</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">Puppeteer Renderer (IG)</div>
              <div className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active</div>
            </div>
          </div>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-5">Next Auto-Post Scheduled</h3>
          
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 mb-4">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">LinkedIn</span>
              <span className="text-xs font-semibold text-gray-300">Mon, Apr 7 • 9:00 AM</span>
            </div>
            <div className="text-sm text-gray-400 line-clamp-3">
              Most founders I talk to are asking the wrong question. They ask: "Should I fine-tune?" The right question is: "Do I have 10k labelled examples?" Here's why RAG wins...
            </div>
          </div>
          
          <button className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2.5 rounded-xl transition-colors border border-white/10">
            Pause Queue
          </button>
        </div>
      </div>
    </>
  );
}
