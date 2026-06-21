import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity, Settings, LayoutGrid, Calendar, MessageCircle, User,
  Heart, Moon, Dumbbell, TrendingUp, ChevronRight, Link as LinkIcon,
  Shield, Mail, Bell, HelpCircle, FileText, LogOut, X, Pencil,
  MessageSquare, ArrowLeft, Play, Search, Users, UserPlus, Check,
  Sparkles, Zap, MapPin, Camera, Star, Lock, Eye, ArrowRight,
} from "lucide-react";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RUNIQ — AI-Powered Telefitness for Runners" },
      { name: "description", content: "Indonesia's first Telefitness marketplace: AI training plans validated by certified coaches." },
      { property: "og:title", content: "RUNIQ — AI-Powered Telefitness for Runners" },
      { property: "og:description", content: "AI plans. Human-approved. Built for Indonesian runners." },
    ],
  }),
  component: Index,
});

type Screen = "dashboard" | "plan" | "activity" | "messages" | "profile";

export type Detail =
  | { kind: "chat"; name: string; initials?: string; color: string; icon?: boolean }
  | { kind: "coach"; name: string; specialty: string; initials: string; price: string }
  | { kind: "workout"; day: string; date: string; type: string; miles: string; pace: string }
  | { kind: "run"; title: string; date: string; stats: string[] }
  | { kind: "profile-item"; title: string; sub: string }
  | { kind: "settings-item"; label: string }
  | { kind: "find-friend" }
  | { kind: "find-community" }
  | { kind: "ai-notes" }
  | { kind: "upgrade" };

function Index() {
  const [authed, setAuthed] = useState(false);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coachTab, setCoachTab] = useState<"plan" | "find">("plan");
  const [bookOpen, setBookOpen] = useState(false);
  const [activityTab, setActivityTab] = useState<"week" | "record">("week");
  const [detail, setDetail] = useState<Detail | null>(null);
  const openDetail = (d: Detail) => setDetail(d);

  return (
    <div className="min-h-screen w-full bg-[#050816] text-foreground">
      <div className="mx-auto flex max-w-[420px] flex-col">
        <div className="relative min-h-screen overflow-hidden bg-[#0a0f24]">
          {!authed ? (
            <LoginScreen onLogin={() => setAuthed(true)} />
          ) : (
            <>
              <TopBar onSettings={() => setSettingsOpen(true)} />
              <main className="pb-28">
                {screen === "dashboard" && <DashboardScreen openDetail={openDetail} />}
                {screen === "plan" && (
                  <PlanScreen tab={coachTab} setTab={setCoachTab} onBook={() => setBookOpen(true)} openDetail={openDetail} />
                )}
                {screen === "activity" && <ActivityScreen tab={activityTab} setTab={setActivityTab} openDetail={openDetail} />}
                {screen === "messages" && <MessagesScreen openDetail={openDetail} />}
                {screen === "profile" && <ProfileScreen onSettings={() => setSettingsOpen(true)} openDetail={openDetail} />}
              </main>
              <TabBar screen={screen} setScreen={setScreen} />
              {settingsOpen && (
                <SettingsSheet onClose={() => setSettingsOpen(false)} onLogout={() => { setSettingsOpen(false); setAuthed(false); }} openDetail={openDetail} />
              )}
              {bookOpen && <BookSheet onClose={() => setBookOpen(false)} />}
              {detail && <DetailOverlay detail={detail} onBack={() => setDetail(null)} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-2xl shadow-brand"
      style={{ width: size, height: size, background: "var(--gradient-brand)" }}>
      <Activity className="text-white" size={size * 0.55} strokeWidth={2.5} />
    </div>
  );
}

function TopBar({ onSettings }: { onSettings: () => void }) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 px-5 py-4">
      <div className="flex items-center gap-3">
        <Logo size={42} />
        <h1 className="text-2xl font-black tracking-wider text-gradient-brand">RUNIQ</h1>
      </div>
      <button onClick={onSettings} className="rounded-full p-2 text-muted-foreground hover:text-foreground">
        <Settings size={22} />
      </button>
    </header>
  );
}

function TabBar({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const items: { id: Screen; icon: any }[] = [
    { id: "dashboard", icon: LayoutGrid },
    { id: "plan", icon: Calendar },
    { id: "activity", icon: Activity },
    { id: "messages", icon: MessageCircle },
    { id: "profile", icon: User },
  ];
  return (
    <nav className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-[#0a0f24]/95 backdrop-blur">
      <div className="flex items-center justify-around px-2 py-3">
        {items.map((it) => {
          const active = screen === it.id;
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setScreen(it.id)} className="relative flex flex-col items-center gap-1 px-4 py-1">
              <Icon size={22} className={active ? "text-[#3b82f6]" : "text-muted-foreground"} />
              {active && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#3b82f6]" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/5 bg-card/80 ${className}`}>{children}</div>;
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen flex-col px-6 pt-20">
      <div className="flex flex-col items-center">
        <Logo size={88} />
        <h1 className="mt-6 text-4xl font-black tracking-wider text-gradient-brand">RUNIQ</h1>
        <p className="mt-2 text-muted-foreground">AI-Powered Training Platform</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="mt-12 space-y-5">
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Mail size={18} className="text-muted-foreground" />
            <input type="email" placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <button type="button" className="text-sm text-[#3b82f6]">Forgot password?</button>
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Lock size={18} className="text-muted-foreground" />
            <input type="password" placeholder="••••••••" className="w-full bg-transparent text-sm outline-none" />
            <Eye size={18} className="text-muted-foreground" />
          </div>
        </div>
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-4 font-semibold text-white shadow-brand">
          Log In <ArrowRight size={18} />
        </button>
      </form>
      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-muted-foreground">or continue with</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold">
          <Activity size={16} className="text-orange-500" /> Strava
        </button>
        <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold">
          <Activity size={16} className="text-[#3b82f6]" /> Garmin
        </button>
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account? <span className="font-semibold text-[#3b82f6]">Sign up</span>
      </p>
    </div>
  );
}

function DashboardScreen({ openDetail }: { openDetail: (d: Detail) => void }) {
  return (
    <div className="space-y-6 px-5 pt-6">
      <section>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">Your Readiness</h2>
            <p className="text-muted-foreground">Ready to train</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-black text-[#3b82f6]">72</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-3 gap-3">
        <MetricCard icon={<Heart size={14} />} label="HRV" value="68" unit="ms" bar="linear-gradient(90deg,#ef4444,#ec4899)" />
        <MetricCard icon={<Moon size={14} />} label="SLEEP" value="7.2" unit="hrs" bar="linear-gradient(90deg,#a855f7,#3b82f6)" />
        <MetricCard icon={<Dumbbell size={14} />} label="LOAD" value="45" unit="" bar="linear-gradient(90deg,#f59e0b,#fbbf24)" />
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">7-Day Trend</h3>
          <TrendingUp size={18} className="text-green-400" />
        </div>
        <Sparkline />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          {["M","T","W","T","F","S","S"].map((d,i)=><span key={i}>{d}</span>)}
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">Marathon Goal</h3>
            <p className="text-sm text-muted-foreground">Sub 3:30 · October 2026</p>
          </div>
          <div className="text-2xl font-black text-[#3b82f6]">65%</div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-brand" style={{ width: "65%" }} />
        </div>
        <div className="mt-5 grid grid-cols-3 text-center">
          <div><div className="text-xl font-bold">142</div><div className="text-xs text-muted-foreground">Total Miles</div></div>
          <div><div className="text-xl font-bold">12</div><div className="text-xs text-muted-foreground">Long Runs</div></div>
          <div><div className="text-xl font-bold">7:45</div><div className="text-xs text-muted-foreground">Avg Pace</div></div>
        </div>
      </Card>
      <section>
        <h3 className="mb-3 text-xl font-bold">Friends Activity</h3>
        <button onClick={() => openDetail({ kind: "run", title: "Trail Morning Run — Marcus", date: "Today, 6:14 AM", stats: ["8.3 mi", "1:04:20", "7:45/mi", "158 bpm"] })} className="w-full text-left">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarC initials="ML" color="from-orange-400 to-amber-500" />
              <div>
                <div className="font-semibold">Marcus Lee</div>
                <div className="text-xs text-muted-foreground">Today, 6:14 AM</div>
              </div>
            </div>
            <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300">Strong</span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Activity size={18} className="text-white" />
            </div>
            <div className="font-semibold">Trail Morning Run</div>
          </div>
          <div className="mt-3 grid grid-cols-4 text-sm">
            <Stat label="Distance" value="8.3 mi" />
            <Stat label="Duration" value="1:04:20" />
            <Stat label="Pace" value="7:45/mi" />
            <Stat label="Avg HR" value="158 bpm" />
          </div>
        </Card>
        </button>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, unit, bar }: any) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full w-2/3 rounded-full" style={{ background: bar }} />
      </div>
    </Card>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-semibold">{value}</div></div>;
}
function AvatarC({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${color} text-sm font-bold text-white`}>
      {initials}
    </div>
  );
}
function Sparkline() {
  const pts = [40, 55, 48, 62, 58, 70, 72];
  const max = 80;
  const w = 320, h = 90;
  const step = w / (pts.length - 1);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-24 w-full">
      <defs>
        <linearGradient id="sg" x1="0" x2="1">
          <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#sg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlanScreen({ tab, setTab, onBook, openDetail }: { tab: "plan" | "find"; setTab: (t: any) => void; onBook: () => void; openDetail: (d: Detail) => void }) {
  return (
    <div className="space-y-6 px-5 pt-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-1">
        <div className="grid grid-cols-2 gap-1">
          <button onClick={() => setTab("plan")} className={`rounded-xl py-3 text-sm font-semibold ${tab === "plan" ? "bg-gradient-brand text-white shadow-brand" : "text-muted-foreground"}`}>My Plan</button>
          <button onClick={() => setTab("find")} className={`rounded-xl py-3 text-sm font-semibold ${tab === "find" ? "bg-gradient-brand text-white shadow-brand" : "text-muted-foreground"}`}>Find Coach</button>
        </div>
      </div>
      {tab === "plan" ? <MyPlan openDetail={openDetail} /> : <FindCoach onBook={onBook} openDetail={openDetail} />}
    </div>
  );
}

function MyPlan({ openDetail }: { openDetail: (d: Detail) => void }) {
  const days = [
    { day: "Monday", date: "May 5", type: "Easy Run", miles: "5 miles", pace: "8:30/mi", done: true },
    { day: "Tuesday", date: "May 6", type: "Intervals", miles: "6 miles", pace: "6x800m @ 6:45", done: true },
    { day: "Wednesday", date: "May 7", type: "Recovery", miles: "4 miles", pace: "9:00/mi", done: true },
    { day: "Thursday", date: "May 8", type: "Tempo", miles: "5 miles", pace: "7:30/mi", done: false },
  ];
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold leading-tight">This Week's<br />Plan</h2>
          <p className="mt-2 text-sm text-muted-foreground">Week 8 of 16 · Base Building Phase</p>
        </div>
        <button onClick={() => openDetail({ kind: "ai-notes" })} className="flex items-center gap-2 rounded-2xl bg-gradient-brand px-4 py-3 text-xs font-semibold text-white shadow-brand">
          <Sparkles size={16} /> AI Coach<br />Notes
        </button>
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Weekly Progress</span>
          <span className="font-bold">3/7 sessions</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full" style={{ width: "43%", background: "linear-gradient(90deg,#10b981,#3b82f6)" }} />
        </div>
      </Card>
      <div className="space-y-3">
        {days.map((d) => (
          <button key={d.day} onClick={() => openDetail({ kind: "workout", day: d.day, date: d.date, type: d.type, miles: d.miles, pace: d.pace })} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left ${d.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 bg-card/80"}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${d.done ? "bg-emerald-500" : "border border-white/15"}`}>
              {d.done && <Check size={16} className="text-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><span className="font-bold">{d.day}</span><span className="text-sm text-muted-foreground">{d.date}</span></div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm">
                <span className="font-semibold text-[#3b82f6]">{d.type}</span>
                <span className="text-muted-foreground">·</span>
                <span>{d.miles}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{d.pace}</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </>
  );
}

function FindCoach({ onBook, openDetail }: { onBook: () => void; openDetail: (d: Detail) => void }) {
  const filters = ["All", "Marathon", "Speed", "Beginner", "Ultra"];
  const [active, setActive] = useState("All");
  return (
    <>
      <div>
        <h2 className="text-3xl font-bold">Find Your Coach</h2>
        <p className="mt-2 text-muted-foreground">Expert guidance for your running goals</p>
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <Search size={18} className="text-muted-foreground" />
        <input placeholder="Search coaches…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 scrollbar-hide">
        {filters.map((f) => (
          <button key={f} onClick={() => setActive(f)} className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold ${active === f ? "border-transparent bg-[#3b82f6] text-white" : "border-white/10 text-muted-foreground"}`}>{f}</button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">4 coaches found</p>
      <CoachCard onBook={onBook} openDetail={openDetail} />
      <button onClick={() => openDetail({ kind: "coach", name: "Marcus Chen", specialty: "Speed & Track", initials: "MC", price: "$199" })} className="w-full text-left">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 font-bold text-white">MC</div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-bold">Marcus Chen</div>
                <div className="text-sm text-muted-foreground">Speed & Track</div>
              </div>
              <div className="text-right">
                <div className="font-bold">$199<span className="text-xs text-muted-foreground">/mo</span></div>
                <span className="mt-1 inline-block rounded-full border border-orange-500/40 px-2 py-0.5 text-xs text-orange-400">Waitlist</span>
              </div>
            </div>
            <div className="mt-3"><span className="rounded-full border border-[#3b82f6]/40 px-2 py-0.5 text-xs text-[#3b82f6]">USATF L3</span></div>
          </div>
        </div>
      </Card>
      </button>
    </>
  );
}

function CoachCard({ onBook, openDetail }: { onBook: () => void; openDetail: (d: Detail) => void }) {
  return (
    <Card className="p-5">
      <button onClick={() => openDetail({ kind: "coach", name: "Sarah Mitchell", specialty: "Marathon Specialist", initials: "SM", price: "$149" })} className="w-full text-left">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand font-bold text-white shadow-brand">SM</div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold">Sarah Mitchell</div>
              <div className="text-sm text-muted-foreground">Marathon Specialist</div>
            </div>
            <div className="text-right">
              <div className="font-bold">$149<span className="text-xs text-muted-foreground">/mo</span></div>
              <span className="mt-1 inline-block rounded-full border border-emerald-500/40 px-2 py-0.5 text-xs text-emerald-400">Available</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full border border-[#3b82f6]/40 px-2 py-0.5 text-xs text-[#3b82f6]">USATF L2</span>
            <span className="rounded-full border border-[#3b82f6]/40 px-2 py-0.5 text-xs text-[#3b82f6]">RRCA</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400" /><span className="font-semibold text-foreground">4.9</span> (127)</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Users size={14} /> 42 runners</span>
        <span>·</span>
        <span className="flex items-center gap-1"><Zap size={14} className="text-yellow-400" /> &lt; 1 hr</span>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Former Boston qualifier with 10+ years coaching experience. Specializing in sub-3hr marathon training and injury prevention through biomechanics analysis.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Sub-3hr","VO2max","Injury Prevention"].map((t) => (
          <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground">{t}</span>
        ))}
      </div>
      </button>
      <button onClick={onBook} className="mt-5 w-full rounded-2xl bg-gradient-brand py-3.5 font-semibold text-white shadow-brand">Book Sarah</button>
    </Card>
  );
}

function BookSheet({ onClose }: { onClose: () => void }) {
  const features = [
    "Personalized 7-day training plan",
    "Weekly 1:1 video check-in",
    "Real-time messaging support",
    "RUNIQ AI + coach hybrid insights",
    "Plan adjustments based on HRV & readiness",
  ];
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="mt-auto max-h-[90vh] overflow-y-auto rounded-t-3xl bg-[#0f1530] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-bold">Book Sarah</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand font-bold text-white shadow-brand">SM</div>
          <div>
            <div className="font-bold">Sarah Mitchell</div>
            <div className="text-sm text-muted-foreground">Marathon Specialist</div>
          </div>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">What's included</p>
        <ul className="mt-3 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm"><Check size={18} className="mt-0.5 text-emerald-400" /> {f}</li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">$149<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <div className="text-xs text-muted-foreground">Cancel anytime · No setup fee</div>
            </div>
            <div className="text-right text-xs">
              <div className="text-muted-foreground">Responds in</div>
              <div className="font-bold">&lt; 1 hour</div>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 py-3.5 text-sm font-semibold"><MessageSquare size={16} /> Message First</button>
          <button className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-3.5 text-sm font-semibold text-white shadow-brand"><Calendar size={16} /> Book Now</button>
        </div>
      </div>
    </div>
  );
}

function ActivityScreen({ tab, setTab }: { tab: "week" | "record"; setTab: (t: any) => void }) {
  return (
    <div className="space-y-6 px-5 pt-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-1">
        <div className="grid grid-cols-2 gap-1">
          <button onClick={() => setTab("week")} className={`rounded-xl py-3 text-sm font-semibold ${tab === "week" ? "bg-gradient-brand text-white shadow-brand" : "text-muted-foreground"}`}>This Week</button>
          <button onClick={() => setTab("record")} className={`rounded-xl py-3 text-sm font-semibold ${tab === "record" ? "bg-gradient-brand text-white shadow-brand" : "text-muted-foreground"}`}>Record</button>
        </div>
      </div>
      {tab === "week" ? <WeekActivity /> : <RecordView />}
    </div>
  );
}

function WeekActivity() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">May 5 – May 11, 2026</span>
        <span className="text-sm font-semibold text-[#3b82f6]">5 activities · 34.8 mi</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={<MapPin size={14} />} label="Distance" value="34.8 mi" />
        <SummaryCard icon={<Zap size={14} />} label="Avg Pace" value="8:02/mi" />
        <SummaryCard icon={<Heart size={14} />} label="Avg HR" value="152 bpm" />
      </div>
      <RunCard title="Morning Easy Run" date="Mon, May 5" tag="Strava" badge="Great" badgeColor="emerald" stats={["4.2 mi","37:42","8:58/mi","142 bpm"]} routeColor="#f97316" />
      <RunCard title="Interval Workout" date="Tue, May 6" tag="Garmin" badge="Hard" badgeColor="orange" stats={["6.1 mi","45:18","7:25/mi","168 bpm"]} routeColor="#3b82f6" />
    </>
  );
}

function SummaryCard({ icon, label, value }: any) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="mt-2 text-lg font-bold">{value}</div>
    </Card>
  );
}

function RunCard({ title, date, tag, badge, badgeColor, stats, routeColor }: any) {
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
            <Activity size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{title}</div>
                <div className="text-sm text-muted-foreground">{date}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-muted-foreground">{tag}</span>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badgeColor === "emerald" ? "border border-emerald-500/40 text-emerald-400" : "border border-orange-500/40 text-orange-400"}`}>{badge}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4">
              <Stat label="Distance" value={stats[0]} />
              <Stat label="Duration" value={stats[1]} />
              <Stat label="Pace" value={stats[2]} />
              <Stat label="Avg HR" value={stats[3]} />
            </div>
          </div>
        </div>
      </div>
      <div className="relative h-40 bg-black/30">
        <svg viewBox="0 0 300 140" className="h-full w-full">
          <defs>
            <pattern id={`g-${routeColor}`} width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeOpacity="0.05" />
            </pattern>
          </defs>
          <rect width="300" height="140" fill={`url(#g-${routeColor})`} />
          {routeColor === "#f97316" ? (
            <path d="M 60 110 L 90 80 L 150 60 L 200 70 L 180 100 L 100 115 Z" fill="none" stroke={routeColor} strokeWidth="3" />
          ) : (
            <polyline points="30,110 70,50 110,90 150,40 190,90 230,110" fill="none" stroke={routeColor} strokeWidth="3" />
          )}
          <circle cx={routeColor === "#f97316" ? 60 : 30} cy={110} r="5" fill="#10b981" />
          <circle cx={routeColor === "#f97316" ? 90 : 150} cy={routeColor === "#f97316" ? 115 : 70} r="5" fill="#ef4444" />
        </svg>
        <button className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs"><Camera size={12} /> Add photo</button>
      </div>
    </Card>
  );
}

function RecordView() {
  return (
    <div className="flex flex-col items-center pt-4">
      <div className="flex w-full items-center justify-between">
        <ArrowLeft className="text-muted-foreground" />
        <span className="text-sm font-bold tracking-[0.3em]">RECORD</span>
        <div className="text-right text-xs text-emerald-400">
          <div className="text-lg leading-none">▮▮▮▮▮</div>
          GPS locked
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center" style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.7))" }}>
        <div className="text-7xl font-black text-emerald-400">00:00</div>
        <div className="mt-2 text-xs tracking-[0.3em] text-muted-foreground">DURATION</div>
      </div>
      <Card className="mt-8 grid w-full grid-cols-3 divide-x divide-white/5 p-5">
        <div className="text-center"><div className="text-2xl font-bold">0.00</div><div className="text-xs text-muted-foreground tracking-wider">MILES</div></div>
        <div className="text-center"><div className="text-2xl font-bold">--:--</div><div className="text-xs text-muted-foreground tracking-wider">PACE /MI</div></div>
        <div className="text-center"><div className="text-2xl font-bold">--</div><div className="text-xs text-muted-foreground tracking-wider">BPM</div></div>
      </Card>
      <button className="mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.6)]">
        <Play size={36} className="ml-1 fill-black text-black" />
      </button>
      <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-4 text-sm font-semibold"><Pencil size={16} /> Manual Input</button>
    </div>
  );
}

function MessagesScreen() {
  const convos = [
    { name: "Sarah Mitchell", initials: "SM", color: "from-indigo-500 to-purple-500", time: "2m", timeBlue: true, preview: "Great job on today's tempo run! Keep the effor…", unread: 2, online: true },
    { name: "Alex Thompson", initials: "AT", color: "from-orange-500 to-red-500", time: "1h", preview: "Thanks for the plan adjustments, feeling much bett…" },
    { name: "Jamie Chen", initials: "JC", color: "from-emerald-400 to-teal-500", time: "3h", timeBlue: true, preview: "Readiness score looking good this week!", unread: 1, online: true },
    { name: "Morning Runners Club", icon: true, color: "from-pink-500 to-fuchsia-500", time: "Yesterday", timeBlue: true, preview: "Ryan: See you all at 6am Saturday!", unread: 5 },
    { name: "Marcus Lee", initials: "ML", color: "from-orange-400 to-amber-500", time: "Yesterday", preview: "That trail route you shared looks epic" },
    { name: "RUNIQ Coaches", icon: true, color: "from-cyan-400 to-blue-500", time: "Mon", preview: "Coach Dana: New HRV protocols drop Monday" },
  ];
  return (
    <div className="space-y-4 px-5 pt-6">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <Search size={18} className="text-muted-foreground" />
        <input placeholder="Search messages…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="space-y-4">
        {convos.map((c) => (
          <div key={c.name} className="flex items-center gap-3">
            <div className="relative">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${c.color} text-sm font-bold text-white`}>
                {c.icon ? <Users size={20} /> : c.initials}
              </div>
              {c.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0a0f24] bg-emerald-400" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="truncate font-bold">{c.name}</div>
                <div className={`text-xs ${c.timeBlue ? "text-[#3b82f6] font-semibold" : "text-muted-foreground"}`}>{c.time}</div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm text-muted-foreground">{c.preview}</div>
                {c.unread && <span className="rounded-full bg-[#3b82f6] px-2 py-0.5 text-xs font-bold text-white">{c.unread}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="my-4 border-t border-white/5" />
      <Card className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b82f6]/15 text-[#3b82f6]"><UserPlus size={18} /></div>
        <div><div className="font-bold">Find a Friend</div><div className="text-sm text-muted-foreground">Connect with other runners</div></div>
      </Card>
      <Card className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15 text-purple-400"><Users size={18} /></div>
        <div><div className="font-bold">Find a Community</div><div className="text-sm text-muted-foreground">Join running groups near you</div></div>
      </Card>
    </div>
  );
}

function ProfileScreen({ onSettings }: { onSettings: () => void }) {
  const items = [
    { icon: User, title: "Edit Profile", sub: "Name, bio, personal info" },
    { icon: Bell, title: "Notifications", sub: "Alerts & reminders" },
    { icon: FileText, title: "Subscription", sub: "Free plan · Upgrade to Pro" },
    { icon: Shield, title: "Privacy", sub: "Data & visibility settings" },
    { icon: HelpCircle, title: "Help & Support", sub: "FAQ, contact, feedback" },
  ];
  return (
    <div className="space-y-6 px-5 pt-6">
      <Card className="p-6 text-center">
        <div className="relative mx-auto h-20 w-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-brand text-3xl shadow-brand">🏃</div>
          <button onClick={onSettings} className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6]">
            <Pencil size={12} className="text-white" />
          </button>
        </div>
        <div className="mt-3 text-2xl font-bold">A</div>
        <div className="text-sm text-muted-foreground">Marathon Runner · Sub-4hr Goal</div>
        <div className="my-5 h-px bg-white/5" />
        <div className="grid grid-cols-3 divide-x divide-white/5">
          <div><div className="text-2xl font-bold">247</div><div className="text-xs text-muted-foreground">Total KM</div></div>
          <div><div className="text-2xl font-bold">42</div><div className="text-xs text-muted-foreground">Runs</div></div>
          <div><div className="text-2xl font-bold">8</div><div className="text-xs text-muted-foreground">Weeks</div></div>
        </div>
      </Card>
      <section>
        <h3 className="mb-3 font-bold">My Coach</h3>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-lg">👩</div>
          <div className="flex-1">
            <div className="font-bold">Sarah Mitchell</div>
            <div className="text-sm text-muted-foreground">Marathon Specialist</div>
          </div>
          <button className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs"><MessageSquare size={14} /> Message</button>
        </Card>
      </section>
      <section>
        <h3 className="mb-3 font-bold">Current Goal</h3>
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-bold">Sub-4hr Marathon</div>
              <div className="text-sm text-muted-foreground">Target: October 15, 2026</div>
            </div>
            <div className="text-xl font-black text-[#3b82f6]">34%</div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-brand" style={{ width: "34%" }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Week 8 of 24</span><span>34% complete</span>
          </div>
        </Card>
      </section>
      <section>
        <h3 className="mb-3 font-bold">Account</h3>
        <Card className="divide-y divide-white/5">
          {items.map((it) => (
            <button key={it.title} className="flex w-full items-center gap-4 p-4 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-muted-foreground"><it.icon size={18} /></div>
              <div className="flex-1">
                <div className="font-semibold">{it.title}</div>
                <div className="text-xs text-muted-foreground">{it.sub}</div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          ))}
        </Card>
      </section>
    </div>
  );
}

function SettingsSheet({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const items = [
    { icon: LinkIcon, label: "Connect Apps" },
    { icon: Shield, label: "Privacy Settings" },
    { icon: Mail, label: "Email Preferences" },
    { icon: Bell, label: "Notifications" },
  ];
  const more = [
    { icon: HelpCircle, label: "Support" },
    { icon: FileText, label: "Legal" },
  ];
  return (
    <div className="absolute inset-0 z-50 bg-black/60" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-[88%] overflow-y-auto bg-[#0f1530] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-xl font-bold shadow-brand">A</div>
          <div><div className="font-bold">A</div><div className="text-sm text-muted-foreground">Athlete</div></div>
        </div>
        <div className="mt-6 space-y-1">
          {items.map((it) => <Row key={it.label} icon={<it.icon size={20} />} label={it.label} />)}
        </div>
        <div className="my-5 h-px bg-white/5" />
        <div className="space-y-1">
          {more.map((it) => <Row key={it.label} icon={<it.icon size={20} />} label={it.label} />)}
        </div>
        <div className="my-5 h-px bg-white/5" />
        <button onClick={onLogout} className="flex w-full items-center gap-4 rounded-xl py-3 text-left text-rose-400">
          <LogOut size={20} /> <span className="font-bold">Log Out</span>
        </button>
      </div>
    </div>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex w-full items-center gap-4 rounded-xl py-3 text-left">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 font-semibold">{label}</span>
      <ChevronRight size={18} className="text-muted-foreground" />
    </button>
  );
}

