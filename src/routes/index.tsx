import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Activity, Settings, LayoutGrid, Calendar, MessageCircle, User,
  Heart, Moon, Dumbbell, TrendingUp, ChevronRight, Link as LinkIcon,
  Shield, Bell, HelpCircle, FileText, LogOut, X, Pencil,
  MessageSquare, ArrowLeft, Play, Search, Users, UserPlus, Check,
  Sparkles, Zap, MapPin, Camera, Star, Lock, Eye, ArrowRight,
  Footprints, Award, Send, Mail, AlertTriangle, Smartphone, Watch,
  Apple, Utensils, ChevronLeft, RefreshCw, Mic, Paperclip, Pin, Crown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import disclaimerMd from "@/content/legal/disclaimer.md?raw";
import privacyMd from "@/content/legal/privacy.md?raw";
import tosMd from "@/content/legal/tos.md?raw";



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

// ---------- Integration connect (MOCK) ----------
// Scaffolded mock: pretends the OAuth round-trip succeeded and stores a flag
// in localStorage. Real OAuth (Strava/Garmin/MFP/Whoop/Health) will be wired
// once provider credentials are available — swap this for the authorize URL
// + `/api/public/<provider>/callback` token exchange.
export type Provider = "strava" | "garmin" | "apple-health" | "google-fit" | "huawei-health" | "myfitnesspal" | "whoop";
export function mockConnect(provider: Provider, label: string) {
  const key = `runiq.connected.${provider}`;
  const already = typeof window !== "undefined" && localStorage.getItem(key) === "1";
  if (already) {
    if (confirm(`${label} is connected. Disconnect?`)) localStorage.removeItem(key);
    return;
  }
  // Simulate provider round-trip
  setTimeout(() => {
    localStorage.setItem(key, "1");
    alert(`${label} connected (mock).\nReal OAuth will be wired when credentials are provided.`);
  }, 400);
}
export function isConnected(provider: Provider) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`runiq.connected.${provider}`) === "1";
}
function connectStrava() { mockConnect("strava", "Strava"); }
function connectGarmin() { mockConnect("garmin", "Garmin"); }

type Screen = "dashboard" | "plan" | "activity" | "messages" | "profile";

export type Detail =
  | { kind: "chat"; name: string; initials?: string; color: string; icon?: boolean; isCoach?: boolean; isGroup?: boolean; members?: number }
  | { kind: "coach"; name: string; specialty: string; initials: string; price: string }
  | { kind: "workout"; day: string; date: string; type: string; miles: string; pace: string }
  | { kind: "run"; title: string; date: string; stats: string[] }
  | { kind: "profile-item"; title: string; sub: string }
  | { kind: "settings-item"; label: string }
  | { kind: "find-friend" }
  | { kind: "find-community" }
  | { kind: "find-coach" }
  | { kind: "ai-notes" }
  | { kind: "upgrade" }
  | { kind: "connect-apps" }
  | { kind: "subscription" }
  | { kind: "notif-prefs" }
  | { kind: "privacy-settings" }
  | { kind: "help" }
  | { kind: "legal"; doc: "tos" | "privacy" | "disclaimer"; title: string }
  | { kind: "current-progress" }
  | { kind: "notifications" }
  | { kind: "readiness-breakdown" }
  | { kind: "trend-28d" };


function Index() {
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coachTab, setCoachTab] = useState<"week" | "program">("week");
  const [bookOpen, setBookOpen] = useState(false);
  const [activityTab, setActivityTab] = useState<"week" | "record">("week");
  const [detail, setDetail] = useState<Detail | null>(null);
  const openDetail = (d: Detail) => setDetail(d);

  return (
    <div className="min-h-screen w-full bg-[#050816] text-foreground">
      <div className="mx-auto flex max-w-[420px] flex-col">
        <div className="relative min-h-screen overflow-hidden bg-[#0a0f24]">
          {!authed ? (
            authMode === "login" ? (
              <LoginScreen onLogin={() => setAuthed(true)} onSignup={() => setAuthMode("signup")} onForgot={() => setAuthMode("forgot")} />
            ) : authMode === "signup" ? (
              <SignupScreen onSignup={() => setAuthed(true)} onBack={() => setAuthMode("login")} />
            ) : (
              <ForgotPasswordScreen onBack={() => setAuthMode("login")} />
            )
          ) : (
            <>
              <TopBar
                onNotifications={() => openDetail({ kind: "notifications" })}
                onAvatar={() => setScreen("profile")}
                onSettings={() => setSettingsOpen(true)}
              />
              <main className="pb-28">
                {screen === "dashboard" && <DashboardScreen openDetail={openDetail} setScreen={setScreen} />}
                {screen === "plan" && (
                  <PlanScreen tab={coachTab} setTab={setCoachTab} openDetail={openDetail} />
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

function TopBar({ onNotifications, onAvatar, onSettings }: { onNotifications?: () => void; onAvatar?: () => void; onSettings?: () => void }) {
  const unread = 3;
  return (
    <header className="flex items-center justify-between border-b border-white/5 px-5 py-4">
      <div className="flex items-center gap-3">
        <Logo size={42} />
        <h1 className="text-2xl font-black tracking-wider text-gradient-brand">RUNIQ</h1>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNotifications} className="relative rounded-full p-2 text-muted-foreground hover:text-foreground" aria-label="Notifications">
          <Bell size={22} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white">{unread}</span>
          )}
        </button>
        <button onClick={onAvatar} className="rounded-full" aria-label="Profile">
          <AvatarC initials="AR" color="from-[#3b82f6] to-[#a855f7]" />
        </button>
        {onSettings && (
          <button onClick={onSettings} className="rounded-full p-2 text-muted-foreground hover:text-foreground" aria-label="Settings">
            <Settings size={20} />
          </button>
        )}
      </div>
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

function LoginScreen({ onLogin, onSignup, onForgot }: { onLogin: () => void; onSignup: () => void; onForgot: () => void }) {
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
            <button type="button" onClick={onForgot} className="text-sm text-[#3b82f6]">Forgot password?</button>
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
        <button onClick={connectStrava} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10">
          <Activity size={16} className="text-orange-500" /> Strava
        </button>
        <button onClick={connectGarmin} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10">
          <Activity size={16} className="text-[#3b82f6]" /> Garmin
        </button>
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <button type="button" onClick={onSignup} className="font-semibold text-[#3b82f6]">Sign up</button>
      </p>
    </div>
  );
}

function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    const { error: supaError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (supaError) {
      setError(supaError.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pt-20">
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft size={18} /> Back to login
      </button>
      <div className="flex flex-col items-center">
        <Logo size={64} />
        <h1 className="mt-4 text-3xl font-black tracking-wider text-gradient-brand">Reset Password</h1>
        <p className="mt-1 text-sm text-muted-foreground">We'll send you a reset link</p>
      </div>

      {sent ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
            <Send size={28} className="text-green-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            Check your inbox for a password reset link.
          </p>
          <button onClick={onBack} className="text-sm font-semibold text-[#3b82f6]">
            Back to login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-12 space-y-5">
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <Mail size={18} className="text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-4 font-semibold text-white shadow-brand disabled:opacity-40"
          >
            {loading ? "Sending..." : "Send Reset Link"} <ArrowRight size={18} />
          </button>
        </form>
      )}
    </div>
  );
}


function SignupScreen({ onSignup, onBack }: { onSignup: () => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<"athlete" | "coach" | "">("");
  const [agreed, setAgreed] = useState(false);

  const canSubmit = name && gender && dob && email && password && role && agreed;

  return (
    <div className="flex min-h-screen flex-col px-6 pt-10 pb-10">
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft size={18} /> Back
      </button>
      <div className="flex flex-col items-center">
        <Logo size={64} />
        <h1 className="mt-4 text-3xl font-black tracking-wider text-gradient-brand">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Join the RUNIQ community</p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); if (canSubmit) onSignup(); }}
        className="mt-8 space-y-4"
      >
        <Field label="Full Name">
          <User size={18} className="text-muted-foreground" />
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full bg-transparent text-sm outline-none"
          />
        </Field>

        <div>
          <label className="text-sm font-medium">Gender</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`rounded-xl border py-3 text-sm capitalize transition-colors ${
                  gender === g
                    ? "border-[#3b82f6] bg-[#3b82f6]/15 text-white"
                    : "border-white/10 bg-white/5 text-muted-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <Field label="Date of Birth">
          <Calendar size={18} className="text-muted-foreground" />
          <input
            type="date"
            value={dob} onChange={(e) => setDob(e.target.value)}
            className="w-full bg-transparent text-sm outline-none [color-scheme:dark]"
          />
        </Field>

        <Field label="Email">
          <Mail size={18} className="text-muted-foreground" />
          <input
            type="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-transparent text-sm outline-none"
          />
        </Field>

        <Field label="Password">
          <Lock size={18} className="text-muted-foreground" />
          <input
            type={showPw ? "text" : "password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-transparent text-sm outline-none"
          />
          <button type="button" onClick={() => setShowPw((v) => !v)}>
            <Eye size={18} className="text-muted-foreground" />
          </button>
        </Field>

        <div>
          <label className="text-sm font-medium">I am a</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <RoleCard
              icon={<Footprints size={22} />}
              label="Athlete"
              active={role === "athlete"}
              onClick={() => setRole("athlete")}
            />
            <RoleCard
              icon={<Award size={22} />}
              label="Coach"
              active={role === "coach"}
              onClick={() => setRole("coach")}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAgreed((v) => !v)}
          className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
              agreed ? "border-[#3b82f6] bg-[#3b82f6]" : "border-white/30 bg-transparent"
            }`}
          >
            {agreed && <Check size={14} className="text-white" />}
          </span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            I agree to the{" "}
            <span className="font-semibold text-[#3b82f6]">Terms of Service</span>,{" "}
            <span className="font-semibold text-[#3b82f6]">Privacy Policy</span>, and{" "}
            <span className="font-semibold text-[#3b82f6]">Medical & Fitness Disclaimer</span>, and
            consent to RUNIQ processing my health and training data.
          </span>

        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-4 font-semibold text-white shadow-brand disabled:opacity-40"
        >
          Create Account <ArrowRight size={18} />
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-muted-foreground">or sign up with</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={connectStrava} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10">
          <Activity size={16} className="text-orange-500" /> Strava
        </button>
        <button type="button" onClick={connectGarmin} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10">
          <Activity size={16} className="text-[#3b82f6]" /> Garmin
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={onBack} className="font-semibold text-[#3b82f6]">Log in</button>
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        {children}
      </div>
    </div>
  );
}

function RoleCard({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
        active
          ? "border-[#3b82f6] bg-[#3b82f6]/15 text-white"
          : "border-white/10 bg-white/5 text-muted-foreground"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          active ? "bg-[#3b82f6] text-white" : "bg-white/5 text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function DashboardScreen({ openDetail, setScreen }: { openDetail: (d: Detail) => void; setScreen: (s: Screen) => void }) {
  const readiness = 72;
  const readinessColor = readiness >= 80 ? "#10b981" : readiness >= 60 ? "#eab308" : "#ef4444";
  const readinessLabel = readiness >= 80 ? "Ready to Train Hard 💪" : readiness >= 60 ? "Moderate Training" : "Recovery Focus 🛌";
  const trendUp = true;

  const trend = [62, 68, 58, 71, 65, 70, 72]; // Mon..Sun
  const todayIdx = 3; // Thu highlight
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  const friends = [
    { name: "Marcus", initials: "ML", color: "from-orange-400 to-amber-500", dist: "8.3 km", time: "06:14" },
    { name: "Sarah", initials: "SK", color: "from-pink-400 to-rose-500", dist: "5.0 km", time: "05:42" },
    { name: "Budi", initials: "BP", color: "from-emerald-400 to-teal-500", dist: "12.1 km", time: "05:10" },
  ];

  return (
    <div className="space-y-6 px-5 pt-6">
      {/* Readiness Dashboard */}
      <section>
        <button onClick={() => openDetail({ kind: "readiness-breakdown" })} className="w-full text-left">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">Readiness</h2>
              <p className="mt-1 text-sm" style={{ color: readinessColor }}>{readinessLabel}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp size={12} className={trendUp ? "text-emerald-400" : "rotate-180 text-rose-400"} />
                {trendUp ? "+4" : "-3"} vs yesterday
              </p>
            </div>
            <div className="text-right">
              <div className="text-6xl font-black" style={{ color: readinessColor }}>{readiness}</div>
              <div className="text-xs text-muted-foreground">/ 100 · tap for details</div>
            </div>
          </div>
        </button>
      </section>

      {/* Health Metrics Strip */}
      <section className="grid grid-cols-3 gap-3">
        <MetricCard icon={<Heart size={12} />} label="HRV" value="58" unit="ms" bar="linear-gradient(90deg,#ef4444,#f97316)" sub="vs 62ms base" />
        <MetricCard icon={<Moon size={12} />} label="Sleep" value="7.2" unit="h · 84%" bar="linear-gradient(90deg,#6366f1,#a855f7)" sub="Good quality" />
        <MetricCard icon={<Dumbbell size={12} />} label="Load" value="68" unit="ACWR 1.1" bar="linear-gradient(90deg,#10b981,#3b82f6)" sub="Optimal" />
      </section>

      {/* Nutrition (MyFitnessPal) */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Utensils size={12} /> Nutrition · MyFitnessPal</span>
          <span>1,420 / 2,200 kcal</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full" style={{ width: "64%", background: "linear-gradient(90deg,#10b981,#eab308)" }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          {[
            { l: "Karbo", v: "180g", c: "#3b82f6" },
            { l: "Protein", v: "92g", c: "#a855f7" },
            { l: "Lemak", v: "48g", c: "#f59e0b" },
          ].map((m) => (
            <div key={m.l}>
              <div className="flex justify-between"><span className="text-muted-foreground">{m.l}</span><span>{m.v}</span></div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full" style={{ width: "65%", background: m.c }} /></div>
            </div>
          ))}
        </div>
      </Card>

      {/* Today's Session Card */}
      <Card className="p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Session · Thursday, 8 May</div>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold">Tempo Run</h3>
            <p className="mt-1 text-sm text-muted-foreground">12 km · Zone 4 · HR 165–175</p>
            <p className="text-sm text-muted-foreground">≈ 1h 05m</p>
          </div>
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">● Not Started</span>
        </div>
        <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm">
          2km WU · 8km threshold · 2km CD
        </div>
        <button onClick={() => openDetail({ kind: "chat", name: "Coach Andre", initials: "CA", color: "from-blue-400 to-indigo-500" })} className="mt-3 flex w-full items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-white/10">
          <MessageSquare size={14} className="text-[#3b82f6]" />
          <span><span className="font-semibold text-foreground">Coach Andre:</span> Focus on pace, don't go over-effort early.</span>
        </button>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => setScreen("activity")} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 text-sm font-semibold text-white shadow-brand">
            <Play size={16} /> Start Run
          </button>
          <button onClick={() => openDetail({ kind: "workout", day: "Thursday", date: "8 May", type: "Tempo Run", miles: "12 km", pace: "Zone 4" })} className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10">
            View Details
          </button>
        </div>
      </Card>

      {/* 7-Day Readiness Trend */}
      <Card className="p-5">
        <button onClick={() => openDetail({ kind: "trend-28d" })} className="w-full text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">7-Day Readiness Trend</h3>
            <span className="text-xs font-semibold text-emerald-400">↗ Improving</span>
          </div>
          <div className="mt-4 flex h-24 items-end justify-between gap-2">
            {trend.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${(v / 100) * 100}%`,
                    background: i === todayIdx ? "#22d3ee" : "rgba(168,85,247,0.6)",
                  }}
                />
                <span className={`text-[10px] ${i === todayIdx ? "text-[#22d3ee] font-bold" : "text-muted-foreground"}`}>{days[i]}</span>
              </div>
            ))}
          </div>
        </button>
      </Card>

      {/* Friends Activity Strip */}
      {friends.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Friends Activity Today</h3>
          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2">
            {friends.map((f) => (
              <button
                key={f.name}
                onClick={() => openDetail({ kind: "run", title: `${f.name}'s Run`, date: `Today, ${f.time}`, stats: [f.dist, "—", "—", "—"] })}
                className="flex min-w-[140px] flex-col items-start gap-2 rounded-2xl border border-white/5 bg-card/80 p-3 text-left"
              >
                <AvatarC initials={f.initials} color={f.color} />
                <div className="text-sm font-semibold">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.dist} · {f.time}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Community Quick Access */}
      <section className="grid grid-cols-2 gap-3">
        <button onClick={() => openDetail({ kind: "find-friend" })} className="flex flex-col items-start gap-2 rounded-2xl border border-white/5 bg-card/80 p-4 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500"><UserPlus size={16} className="text-white" /></div>
          <div className="text-sm font-semibold">Find Runner Friends</div>
          <div className="text-xs text-muted-foreground">Connect & follow</div>
        </button>
        <button onClick={() => openDetail({ kind: "find-community" })} className="flex flex-col items-start gap-2 rounded-2xl border border-white/5 bg-card/80 p-4 text-left">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500"><Users size={16} className="text-white" /></div>
          <div className="text-sm font-semibold">Running Communities</div>
          <div className="text-xs text-muted-foreground">Join groups</div>
        </button>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, unit, bar, sub }: any) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full w-2/3 rounded-full" style={{ background: bar }} />
      </div>
      {sub && <div className="mt-1 text-[10px] text-muted-foreground">{sub}</div>}
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

function PlanScreen({ tab, setTab, openDetail }: { tab: "week" | "program"; setTab: (t: any) => void; openDetail: (d: Detail) => void }) {
  return (
    <div className="space-y-6 px-5 pt-6">
      <div>
        <h2 className="text-3xl font-bold leading-tight">Plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your weekly plan and program journey</p>
      </div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-1">
        <div className="grid grid-cols-2 gap-1">
          <button onClick={() => setTab("week")} className={`rounded-xl py-3 text-sm font-semibold ${tab === "week" ? "bg-gradient-brand text-white shadow-brand" : "text-muted-foreground"}`}>This Week</button>
          <button onClick={() => setTab("program")} className={`rounded-xl py-3 text-sm font-semibold ${tab === "program" ? "bg-gradient-brand text-white shadow-brand" : "text-muted-foreground"}`}>Program</button>
        </div>
      </div>
      {tab === "week" ? <ThisWeekView openDetail={openDetail} /> : <ProgramView />}
    </div>
  );
}

const SESSION_COLORS: Record<string, string> = {
  "Easy Run": "#3B82F6",
  "Intervals": "#7C3AED",
  "Recovery": "#10B981",
  "Tempo": "#F97316",
  "Long Run": "#EF4444",
  "Strength": "#EAB308",
};

function ThisWeekView({ openDetail }: { openDetail: (d: Detail) => void }) {
  const [noteGenerated, setNoteGenerated] = useState(true);
  const sessions = [
    { day: "Monday", date: "May 5", type: "Easy Run", dist: "8 km", zone: "Z2", detail: "Conversational pace, focus on form", done: true },
    { day: "Tuesday", date: "May 6", type: "Intervals", dist: "10 km", zone: "Z4", detail: "6×800m @ 4:10/km, 2min recovery jog", done: true },
    { day: "Wednesday", date: "May 7", type: "Recovery", dist: "6 km", zone: "Z1", detail: "Very easy shakeout, HR under 140", done: true },
    { day: "Thursday", date: "May 8", type: "Tempo", dist: "10 km", zone: "Z3", detail: "20 min @ 4:45/km threshold effort", done: false },
    { day: "Saturday", date: "May 10", type: "Long Run", dist: "24 km", zone: "Z2", detail: "Steady long run, last 5km slightly faster", done: false },
    { day: "Sunday", date: "May 11", type: "Strength", dist: "45 min", zone: "—", detail: "Runner-specific strength: single-leg work + core", done: false },
  ];
  const total = sessions.length;
  const completed = sessions.filter((s) => s.done).length;
  const pct = Math.round((completed / total) * 100);
  const kmDone = 24;
  const kmTarget = 58;

  return (
    <>
      {/* AI Coaching Notes Card */}
      {!noteGenerated ? (
        <button onClick={() => setNoteGenerated(true)} className="w-full rounded-2xl bg-gradient-brand p-5 text-left shadow-brand">
          <div className="flex items-center gap-2 text-white"><Sparkles size={18} /><span className="text-sm font-semibold">AI Coaching Notes</span></div>
          <p className="mt-2 text-sm text-white/90">Get personalised insights on this week's plan based on your HRV, sleep and training load.</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white">✦ Generate Now</div>
        </button>
      ) : (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#3b82f6]"><Sparkles size={18} /><span className="text-sm font-bold">AI Coaching Notes</span></div>
            <button onClick={() => {}} className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"><RefreshCw size={12} /> Refresh</button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            Your HRV is 8% below baseline this week — I've kept intensity moderate. Prioritise sleep before Thursday's tempo…
          </p>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => openDetail({ kind: "ai-notes" })} className="text-xs font-semibold text-[#3b82f6]">Read More →</button>
            <span className="text-[10px] text-muted-foreground">Generated 2h ago</span>
          </div>
        </Card>
      )}

      {/* Coach Approval Banner */}
      <button onClick={() => openDetail({ kind: "ai-notes" })} className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-left">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-emerald-400 font-semibold">✓ Approved by Coach Sarah</span>
          <span className="text-muted-foreground text-xs ml-auto">2h ago</span>
        </div>
      </button>

      {/* Weekly Progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Weekly Progress</span>
          <span className="font-bold">{completed}/{total} sessions</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#10b981,#3b82f6)" }} />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Volume</span>
          <span className="font-semibold">{kmDone} km <span className="text-muted-foreground">of {kmTarget} km target</span></span>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Sessions auto-fill when activities sync from Strava/Garmin ✓</p>
      </Card>

      {/* Session Cards */}
      <div className="space-y-3">
        {sessions.map((s) => {
          const color = SESSION_COLORS[s.type] ?? "#3B82F6";
          return (
            <button key={s.day} onClick={() => openDetail({ kind: "workout", day: s.day, date: s.date, type: s.type, miles: s.dist, pace: s.detail })} className={`flex w-full items-stretch overflow-hidden rounded-2xl border text-left ${s.done ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 bg-card/80"}`}>
              <div className="w-1.5 shrink-0" style={{ background: color }} />
              <div className="flex flex-1 items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="font-bold">{s.day}</span><span className="text-xs text-muted-foreground">{s.date}</span></div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
                    <span className="font-semibold" style={{ color }}>{s.type}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>{s.dist}</span>
                    <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">{s.zone}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate">{s.detail}</p>
                </div>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.done ? "bg-emerald-500" : "border border-white/15"}`}>
                  {s.done && <Check size={16} className="text-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3">Session Types</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(SESSION_COLORS).map(([name, c]) => (
            <div key={name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
              <span>{name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50" /><span className="text-muted-foreground">Rest</span></div>
        </div>
      </Card>
    </>
  );
}

function ProgramView() {
  const phases = [
    { name: "Base", weeks: "Week 1–8", focus: "Aerobic foundation", status: "done" as const },
    { name: "Build", weeks: "Week 9–16", focus: "Threshold + volume", status: "active" as const },
    { name: "Peak", weeks: "Week 17–20", focus: "Race-specific intensity", status: "locked" as const },
    { name: "Taper", weeks: "Week 21–23", focus: "Recover & sharpen", status: "locked" as const },
    { name: "Race", weeks: "Week 24", focus: "Race day", status: "locked" as const },
  ];
  const overallPct = 45;
  const volumes = [30, 35, 40, 38, 45, 50, 48, 55, 60, 62, 65, 60, 70, 72, 68, 75, 80, 78, 70, 65, 55, 45, 30, 42];

  return (
    <>
      {/* Program Overview */}
      <Card className="p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#3b82f6]">Marathon Program</div>
        <h3 className="mt-1 text-xl font-bold">Sub-3:30 Marathon Program</h3>
        <p className="mt-1 text-sm text-muted-foreground">Jakarta Marathon · October 26, 2026</p>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Overall progress</span>
          <span className="font-bold">{overallPct}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${overallPct}%` }} />
        </div>
        <div className="mt-4">
          <div className="text-[11px] text-muted-foreground mb-2">Current phase: <span className="text-white font-semibold">Build</span></div>
          <div className="flex h-2 gap-1 overflow-hidden rounded-full">
            <div className="flex-[8] rounded-l-full bg-emerald-500/60" />
            <div className="flex-[8] bg-[#3b82f6]" />
            <div className="flex-[4] bg-white/10" />
            <div className="flex-[3] bg-white/10" />
            <div className="flex-[1] rounded-r-full bg-white/10" />
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
            <span>Base</span><span>Build</span><span>Peak</span><span>Taper</span><span>Race</span>
          </div>
        </div>
      </Card>

      {/* Program Stats */}
      <Card className="p-5">
        <div className="text-sm font-bold mb-4">Program Stats</div>
        <div className="grid grid-cols-2 gap-4">
          <StatBox label="Total KM" value="428" />
          <StatBox label="Sessions Completed" value="52" />
          <StatBox label="Avg Pace" value="5:12/km" />
          <StatBox label="Longest Run" value="28 km" />
          <div className="col-span-2">
            <StatBox label="Adherence Rate" value="92%" />
          </div>
        </div>
      </Card>

      {/* Phase Breakdown */}
      <Card className="p-5">
        <div className="text-sm font-bold mb-3">Phase Breakdown</div>
        <div className="space-y-2">
          {phases.map((p) => (
            <div key={p.name} className={`rounded-xl border p-3 ${p.status === "active" ? "border-[#3b82f6]/50 bg-[#3b82f6]/10" : p.status === "done" ? "border-white/5 bg-white/[0.02] opacity-60" : "border-white/5 bg-white/[0.02]"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{p.name}</span>
                  {p.status === "done" && <Check size={14} className="text-emerald-400" />}
                  {p.status === "active" && <span className="rounded-full bg-[#3b82f6] px-2 py-0.5 text-[9px] font-bold text-white">ACTIVE</span>}
                  {p.status === "locked" && <span className="text-xs text-muted-foreground">🔒</span>}
                </div>
                <span className="text-xs text-muted-foreground">{p.weeks}</span>
              </div>
              {p.status === "active" && <div className="mt-1 text-xs text-muted-foreground">{p.focus}</div>}
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Volume Chart */}
      <Card className="p-5">
        <div className="text-sm font-bold mb-1">Weekly Volume</div>
        <div className="text-xs text-muted-foreground mb-4">24-week taper visualisation (km)</div>
        <div className="-mx-1 overflow-x-auto scrollbar-hide">
          <div className="flex items-end gap-1 px-1" style={{ minWidth: 24 * 14 }}>
            {volumes.map((v, i) => {
              const isActive = i === 10;
              let color = "#10B981";
              if (i >= 8 && i < 16) color = "#3B82F6";
              else if (i >= 16 && i < 20) color = "#F97316";
              else if (i >= 20 && i < 23) color = "#EAB308";
              else if (i >= 23) color = "#EF4444";
              return (
                <div key={i} className="flex flex-col items-center gap-1" style={{ width: 12 }}>
                  <div className="w-full rounded-t" style={{ height: v * 1.2, background: color, opacity: isActive ? 1 : 0.7, outline: isActive ? "1px solid white" : "none" }} />
                  <div className="text-[8px] text-muted-foreground">{i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[10px]">
          <LegendDot color="#10B981" label="Base" />
          <LegendDot color="#3B82F6" label="Build" />
          <LegendDot color="#F97316" label="Peak" />
          <LegendDot color="#EAB308" label="Taper" />
          <LegendDot color="#EF4444" label="Race" />
        </div>
      </Card>
    </>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
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

function ActivityScreen({ tab, setTab, openDetail }: { tab: "week" | "record"; setTab: (t: any) => void; openDetail: (d: Detail) => void }) {
  return (
    <div className="space-y-5 px-5 pt-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-1">
        <div className="grid grid-cols-2 gap-1">
          <button onClick={() => setTab("week")} className={`rounded-xl py-3 text-sm font-semibold ${tab === "week" ? "bg-gradient-brand text-white shadow-brand" : "text-muted-foreground"}`}>This Week</button>
          <button onClick={() => setTab("record")} className={`rounded-xl py-3 text-sm font-semibold ${tab === "record" ? "bg-gradient-brand text-white shadow-brand" : "text-muted-foreground"}`}>Record</button>
        </div>
      </div>
      {tab === "week" ? <WeekActivity openDetail={openDetail} goRecord={() => setTab("record")} /> : <RecordFlow goWeek={() => setTab("week")} />}
    </div>
  );
}

type MatchStatus = "match" | "diff" | "extra";
const MATCH_STYLE: Record<MatchStatus, { label: string; cls: string }> = {
  match: { label: "✓ Matches Plan", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" },
  diff:  { label: "⚠ Differs from Plan", cls: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
  extra: { label: "Extra Run", cls: "border-sky-500/40 bg-sky-500/10 text-sky-400" },
};

function WeekActivity({ openDetail, goRecord }: { openDetail: (d: Detail) => void; goRecord: () => void }) {
  const [manualOpen, setManualOpen] = useState(false);
  const activities = [
    { title: "Tempo Run", date: "Wed, May 7 · 6:12 AM", source: "Strava", feel: "💪", stats: ["12.1 km","54:22","4:29/km","162 bpm"], match: "match" as MatchStatus, color: "#f97316" },
    { title: "Easy Recovery", date: "Tue, May 6 · 5:45 AM", source: "Garmin", feel: "🙂", stats: ["6.0 km","33:14","5:32/km","138 bpm"], match: "match" as MatchStatus, color: "#3b82f6" },
    { title: "Long Run", date: "Sun, May 4 · 5:30 AM", source: "RUNIQ Record", feel: "😐", stats: ["18.4 km","1:38:02","5:19/km","149 bpm"], match: "diff" as MatchStatus, color: "#a855f7" },
    { title: "Trail Adventure", date: "Sat, May 3 · 7:00 AM", source: "Strava", feel: "🔥", stats: ["8.2 km","52:11","6:22/km","155 bpm"], match: "extra" as MatchStatus, color: "#10b981" },
  ];
  return (
    <>
      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={goRecord} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-4 text-sm font-bold text-white shadow-brand">
          <Play size={16} className="fill-white" /> Record Run
        </button>
        <button onClick={() => setManualOpen(true)} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-bold">
          <Pencil size={16} /> Manual Input
        </button>
      </div>

      {/* Week Summary Card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">May 5 – May 11, 2026</span>
          <span className="text-xs font-semibold text-[#3b82f6]">4 activities</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Stat label="Distance" value="44.7 km" />
          <Stat label="Time" value="3:57" />
          <Stat label="Avg Pace" value="5:18/km" />
          <Stat label="Avg HR" value="151 bpm" />
        </div>
        <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">vs weekly plan target</span>
            <span className="font-semibold text-emerald-400">44.7 / 55 km</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-brand" style={{ width: "81%" }} />
          </div>
        </div>
      </Card>

      {/* Activity Cards */}
      {activities.map((a) => (
        <button key={a.title + a.date} onClick={() => openDetail({ kind: "run", title: a.title, date: a.date, stats: a.stats })} className="block w-full text-left">
          <ActivityCard {...a} />
        </button>
      ))}

      {manualOpen && <ManualInputSheet onClose={() => setManualOpen(false)} />}
    </>
  );
}

function ActivityCard({ title, date, source, feel, stats, match, color }: any) {
  const m = MATCH_STYLE[match as MatchStatus];
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand shadow-brand">
            <Activity size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{title}</div>
                <div className="text-xs text-muted-foreground">{date}</div>
              </div>
              <span className="text-xl">{feel}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-muted-foreground">{source}</span>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${m.cls}`}>{m.label}</span>
            </div>
            <div className="mt-3 grid grid-cols-4">
              <Stat label="Distance" value={stats[0]} />
              <Stat label="Time" value={stats[1]} />
              <Stat label="Pace" value={stats[2]} />
              <Stat label="Avg HR" value={stats[3]} />
            </div>
          </div>
        </div>
      </div>
      <div className="relative h-32 bg-black/30">
        <svg viewBox="0 0 300 120" className="h-full w-full">
          <rect width="300" height="120" fill="rgba(255,255,255,0.02)" />
          <polyline points="30,95 70,40 110,80 150,30 190,80 240,100" fill="none" stroke={color} strokeWidth="3" />
          <circle cx="30" cy="95" r="5" fill="#10b981" />
          <circle cx="240" cy="100" r="5" fill="#ef4444" />
        </svg>
      </div>
    </Card>
  );
}

type SignalState = "searching" | "low" | "good" | "ready";

const SIGNAL_CONFIG: Record<SignalState, { label: string; color: string; dim: string; bars: number }> = {
  searching: { label: "Searching…", color: "#ef4444", dim: "rgba(239,68,68,0.15)", bars: 1 },
  low: { label: "Low signal", color: "#f97316", dim: "rgba(249,115,22,0.15)", bars: 2 },
  good: { label: "Good signal", color: "#86efac", dim: "rgba(134,239,172,0.15)", bars: 3 },
  ready: { label: "GPS ready", color: "#22c55e", dim: "rgba(34,197,94,0.15)", bars: 4 },
};

function SignalIndicator({ state }: { state: SignalState }) {
  const cfg = SIGNAL_CONFIG[state];
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-end gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-sm transition-all duration-300" style={{ width: 5, height: 8 + i * 5, backgroundColor: i < cfg.bars ? cfg.color : cfg.dim, boxShadow: i < cfg.bars ? `0 0 8px ${cfg.color}` : "none" }} />
        ))}
      </div>
      <span className="text-[10px] font-semibold tracking-wide" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

type RecPhase = "pre" | "active" | "post" | "manual";

function RecordFlow({ goWeek }: { goWeek: () => void }) {
  const [phase, setPhase] = useState<RecPhase>("pre");
  const [signal, setSignal] = useState<SignalState>("ready");
  const [linkPlan, setLinkPlan] = useState(true);
  const [locked, setLocked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (phase !== "active" || paused) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase, paused]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };
  const km = (seconds / 300).toFixed(2);

  if (phase === "manual") return <ManualInputScreen onCancel={() => setPhase("pre")} onSave={goWeek} />;
  if (phase === "post") return <PostRunSummary duration={fmt(seconds)} distance={km} onDiscard={() => { setPhase("pre"); setSeconds(0); }} onSave={goWeek} />;
  if (phase === "active") {
    return (
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
            <span className="text-xs font-bold tracking-widest text-red-400">RECORDING</span>
          </div>
          <SignalIndicator state={signal} />
        </div>
        <div className="flex flex-col items-center py-4" style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.6))" }}>
          <div className="text-6xl font-black text-emerald-400 tabular-nums">{fmt(seconds)}</div>
          <div className="mt-1 text-[10px] tracking-[0.3em] text-muted-foreground">DURATION</div>
        </div>
        <Card className="p-5 text-center">
          <div className="text-5xl font-black tabular-nums">{km}</div>
          <div className="mt-1 text-[10px] tracking-widest text-muted-foreground">KILOMETERS</div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center"><div className="text-2xl font-bold">5:12</div><div className="text-[10px] tracking-widest text-muted-foreground">PACE /KM</div></Card>
          <Card className="p-4 text-center"><div className="text-2xl font-bold">5:24</div><div className="text-[10px] tracking-widest text-muted-foreground">AVG PACE</div></Card>
          <Card className="p-4 text-center"><div className="text-2xl font-bold">148</div><div className="text-[10px] tracking-widest text-muted-foreground">BPM · Z3</div></Card>
          <Card className="p-4 text-center"><div className="text-2xl font-bold">42 m</div><div className="text-[10px] tracking-widest text-muted-foreground">ELEVATION</div></Card>
        </div>
        {!locked ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPaused((p) => !p)} className="rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-bold">{paused ? "▶ Resume" : "⏸ Pause"}</button>
              <button onClick={() => setPhase("post")} className="rounded-2xl bg-red-500 py-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]">⏹ Stop</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-xl border border-white/10 py-3 text-xs font-semibold text-muted-foreground">＋ Lap</button>
              <button onClick={() => setLocked(true)} className="rounded-xl border border-white/10 py-3 text-xs font-semibold text-muted-foreground flex items-center justify-center gap-1"><Lock size={12} /> Lock</button>
            </div>
          </>
        ) : (
          <button onClick={() => setLocked(false)} className="w-full rounded-2xl border border-yellow-500/40 bg-yellow-500/10 py-4 text-sm font-bold text-yellow-400 flex items-center justify-center gap-2"><Lock size={14} /> Screen Locked — tap to unlock</button>
        )}
      </div>
    );
  }

  // Pre-record
  const canStart = signal === "good" || signal === "ready";
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <button onClick={goWeek} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={22} /></button>
        <span className="text-sm font-bold tracking-[0.3em]">RECORD</span>
        <button onClick={() => { const o: SignalState[] = ["searching","low","good","ready"]; setSignal(o[(o.indexOf(signal)+1)%o.length]); }}><SignalIndicator state={signal} /></button>
      </div>

      <Card className="p-4">
        <div className="text-xs tracking-widest text-muted-foreground">GPS STATUS</div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: SIGNAL_CONFIG[signal].dim }}>
              <MapPin size={18} style={{ color: SIGNAL_CONFIG[signal].color }} />
            </div>
            <div>
              <div className="font-bold" style={{ color: SIGNAL_CONFIG[signal].color }}>{SIGNAL_CONFIG[signal].label}</div>
              <div className="text-[10px] text-muted-foreground">Tap indicator to simulate</div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-widest text-muted-foreground">TODAY'S SESSION</div>
            <div className="mt-1 font-bold">Tempo · 12 km · Z3–4</div>
          </div>
          <span className="rounded-full border border-orange-500/40 bg-orange-500/10 px-2 py-1 text-[10px] font-semibold text-orange-400">Tempo</span>
        </div>
        <label className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-3">
          <span className="text-xs">Train for this session</span>
          <input type="checkbox" checked={linkPlan} onChange={(e) => setLinkPlan(e.target.checked)} className="h-5 w-5 accent-[#3b82f6]" />
        </label>
      </Card>

      <button
        onClick={() => canStart && setPhase("active")}
        disabled={!canStart}
        className={`w-full rounded-2xl py-5 text-base font-bold flex items-center justify-center gap-2 ${canStart ? "bg-gradient-brand text-white shadow-brand" : "cursor-not-allowed bg-white/5 text-muted-foreground"}`}
      >
        <Play size={20} className={canStart ? "fill-white" : ""} /> {canStart ? "Start Run" : "Waiting for GPS lock…"}
      </button>

      <button onClick={() => setPhase("manual")} className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-sm font-semibold flex items-center justify-center gap-2">
        <Pencil size={16} /> Manual Input (Treadmill / Fallback)
      </button>
    </div>
  );
}

const FEELS = ["😩","😐","🙂","💪","🔥"];

function PostRunSummary({ duration, distance, onDiscard, onSave }: { duration: string; distance: string; onDiscard: () => void; onSave: () => void }) {
  const [feel, setFeel] = useState(2);
  const [notes, setNotes] = useState("");
  const [matchPlan, setMatchPlan] = useState<"yes"|"no"|null>(null);
  return (
    <div className="space-y-4 pt-2">
      <div className="text-center">
        <div className="text-xs tracking-widest text-emerald-400">RUN COMPLETE</div>
        <div className="mt-1 text-3xl font-black">{distance} km · {duration}</div>
      </div>
      <Card className="overflow-hidden">
        <div className="h-40 bg-black/30">
          <svg viewBox="0 0 300 140" className="h-full w-full">
            <rect width="300" height="140" fill="rgba(255,255,255,0.02)" />
            <path d="M 40 110 Q 90 40, 150 70 T 260 100" fill="none" stroke="#3b82f6" strokeWidth="3" />
            <circle cx="40" cy="110" r="5" fill="#10b981" />
            <circle cx="260" cy="100" r="5" fill="#ef4444" />
          </svg>
        </div>
      </Card>
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Pace" value="5:18/km" />
          <Stat label="Avg HR" value="151" />
          <Stat label="Elev" value="128 m" />
          <Stat label="Cal" value="642" />
          <Stat label="Cadence" value="176" />
          <Stat label="Max HR" value="172" />
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground">SPLITS (PACE /KM)</div>
        <div className="mt-3 space-y-1.5">
          {["5:32","5:24","5:18","5:12","5:08"].map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-6 text-muted-foreground">{i+1}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-brand" style={{ width: `${60 + i*7}%` }} /></div>
              <span className="w-14 text-right font-mono">{p}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground">HR ZONE DISTRIBUTION</div>
        <div className="mt-3 grid grid-cols-5 gap-1.5 text-center text-[10px]">
          {[
            { z: "Z1", pct: 8, color: "#3b82f6" },
            { z: "Z2", pct: 22, color: "#10b981" },
            { z: "Z3", pct: 41, color: "#f59e0b" },
            { z: "Z4", pct: 24, color: "#f97316" },
            { z: "Z5", pct: 5, color: "#ef4444" },
          ].map((z) => (
            <div key={z.z}>
              <div className="h-16 flex items-end"><div className="w-full rounded-t" style={{ height: `${z.pct * 1.6}%`, backgroundColor: z.color }} /></div>
              <div className="mt-1 font-bold">{z.z}</div>
              <div className="text-muted-foreground">{z.pct}%</div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground">HOW DID IT FEEL?</div>
        <div className="mt-3 flex justify-between">
          {FEELS.map((f, i) => (
            <button key={i} onClick={() => setFeel(i)} className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition ${feel === i ? "bg-gradient-brand shadow-brand scale-110" : "bg-white/5"}`}>{f}</button>
          ))}
        </div>
      </Card>
      <Card className="p-4 space-y-3">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground">MATCH TO PLAN</div>
        <div className="text-sm">Was this your Tempo session for today?</div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setMatchPlan("yes")} className={`rounded-xl border py-3 text-sm font-semibold ${matchPlan === "yes" ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/5"}`}>✓ Yes, mark done</button>
          <button onClick={() => setMatchPlan("no")} className={`rounded-xl border py-3 text-sm font-semibold ${matchPlan === "no" ? "border-sky-500/60 bg-sky-500/10 text-sky-400" : "border-white/10 bg-white/5"}`}>Extra run</button>
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-xs font-semibold tracking-widest text-muted-foreground">NOTES</div>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Anything worth remembering?" className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-muted-foreground/60" />
      </Card>
      <div className="grid grid-cols-2 gap-3 pb-2">
        <button onClick={() => { if (confirm("Discard this run? This cannot be undone.")) onDiscard(); }} className="rounded-2xl border border-white/10 py-4 text-sm font-semibold text-muted-foreground">Discard</button>
        <button onClick={onSave} className="rounded-2xl bg-gradient-brand py-4 text-sm font-bold text-white shadow-brand">Save Activity</button>
      </div>
    </div>
  );
}

function ManualInputScreen({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return <ManualInputBody onCancel={onCancel} onSave={onSave} />;
}

function ManualInputSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#0a0f24] p-5 pb-8">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
        <ManualInputBody onCancel={onClose} onSave={onClose} />
      </div>
    </div>
  );
}

function ManualInputBody({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  const [type, setType] = useState("Easy");
  const [feel, setFeel] = useState(2);
  const [linkPlan, setLinkPlan] = useState(false);
  const types = ["Easy","Tempo","Long Run","Intervals","Strength","Other"];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-muted-foreground"><ArrowLeft size={20} /></button>
        <span className="text-sm font-bold tracking-widest">MANUAL INPUT</span>
        <span className="w-5" />
      </div>
      <FormField label="Date & Start Time">
        <input type="datetime-local" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" />
      </FormField>
      <FormField label="Activity Type">
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button key={t} onClick={() => setType(t)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${type === t ? "border-[#3b82f6] bg-[#3b82f6]/15 text-[#3b82f6]" : "border-white/10 bg-white/5 text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Distance (km)"><input type="number" step="0.01" placeholder="0.00" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" /></FormField>
        <FormField label="Duration (HH:MM:SS)"><input type="text" placeholder="00:00:00" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" /></FormField>
      </div>
      <FormField label="Avg HR (optional)"><input type="number" placeholder="bpm" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" /></FormField>
      <FormField label="Feel">
        <div className="flex justify-between">
          {FEELS.map((f, i) => (
            <button key={i} onClick={() => setFeel(i)} className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${feel === i ? "bg-gradient-brand shadow-brand" : "bg-white/5"}`}>{f}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Notes"><textarea rows={3} placeholder="Optional notes" className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" /></FormField>
      <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
        <span className="text-xs">Match with today's planned session</span>
        <input type="checkbox" checked={linkPlan} onChange={(e) => setLinkPlan(e.target.checked)} className="h-5 w-5 accent-[#3b82f6]" />
      </label>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button onClick={onCancel} className="rounded-2xl border border-white/10 py-3.5 text-sm font-semibold text-muted-foreground">Cancel</button>
        <button onClick={onSave} className="rounded-2xl bg-gradient-brand py-3.5 text-sm font-bold text-white shadow-brand">Save Activity</button>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold tracking-widest text-muted-foreground">{label.toUpperCase()}</div>
      {children}
    </div>
  );
}


function MessagesScreen({ openDetail }: { openDetail: (d: Detail) => void }) {
  const [q, setQ] = useState("");
  const coach = { name: "Coach Sarah Mitchell", initials: "SM", color: "from-indigo-500 to-purple-500", time: "2m", preview: "Great job on today's tempo run! Keep the effort dialed in.", unread: 2, online: true };
  const runners = [
    { name: "Alex Thompson", initials: "AT", color: "from-orange-500 to-red-500", time: "1h", preview: "Thanks for the plan tweaks — feeling better." },
    { name: "Jamie Chen", initials: "JC", color: "from-emerald-400 to-teal-500", time: "3h", preview: "Readiness looks good this week!", unread: 1, online: true },
    { name: "Marcus Lee", initials: "ML", color: "from-orange-400 to-amber-500", time: "Yesterday", preview: "That trail route looks epic" },
  ];
  const communities = [
    { name: "Morning Runners Club", color: "from-pink-500 to-fuchsia-500", time: "Yesterday", preview: "Ryan: See you all at 6am Saturday!", unread: 5, members: 128 },
    { name: "Jakarta Trail Pack", color: "from-cyan-400 to-blue-500", time: "Mon", preview: "New route added for weekend LSD", members: 64 },
  ];
  const match = (s: string) => s.toLowerCase().includes(q.toLowerCase());
  const showCoach = !q || match(coach.name) || match(coach.preview);
  const runnersF = runners.filter((r) => !q || match(r.name) || match(r.preview));
  const commF = communities.filter((c) => !q || match(c.name) || match(c.preview));

  return (
    <div className="space-y-5 px-5 pt-6">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <Search size={18} className="text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages…" className="w-full bg-transparent text-sm outline-none" />
      </div>

      {/* YOUR COACH — pinned */}
      <section>
        <div className="mb-2 flex items-center gap-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#3b82f6]">Your Coach</h4>
          <span className="rounded-full bg-[#3b82f6]/15 px-2 py-0.5 text-[9px] font-semibold text-[#3b82f6]">Pinned</span>
        </div>
        {showCoach ? (
          <button
            onClick={() => openDetail({ kind: "chat", name: coach.name, initials: coach.initials, color: coach.color, isCoach: true })}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#3b82f6]/25 bg-gradient-to-r from-[#3b82f6]/10 to-purple-500/10 p-3 text-left"
          >
            <div className="relative">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${coach.color} text-sm font-bold text-white`}>{coach.initials}</div>
              {coach.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0a0f24] bg-emerald-400" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="truncate font-bold">{coach.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#3b82f6]">Your Coach</div>
                </div>
                <div className="text-xs font-semibold text-[#3b82f6]">{coach.time}</div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="truncate text-sm text-muted-foreground">{coach.preview}</div>
                <span className="rounded-full bg-[#3b82f6] px-2 py-0.5 text-xs font-bold text-white">{coach.unread}</span>
              </div>
            </div>
          </button>
        ) : (
          <Card className="p-4 text-center">
            <div className="font-bold">No coach yet</div>
            <p className="mt-1 text-xs text-muted-foreground">Coach will review and approve every plan for you.</p>
            <button onClick={() => openDetail({ kind: "find-coach" })} className="mt-3 rounded-full bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-brand">Find a Coach</button>
          </Card>
        )}
      </section>

      {/* RUNNERS */}
      {runnersF.length > 0 && (
        <section>
          <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Fellow Runners</h4>
          <div className="space-y-3">
            {runnersF.map((c) => (
              <button key={c.name} onClick={() => openDetail({ kind: "chat", name: c.name, initials: c.initials, color: c.color })} className="flex w-full items-center gap-3 text-left">
                <div className="relative">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${c.color} text-sm font-bold text-white`}>{c.initials}</div>
                  {(c as any).online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0a0f24] bg-emerald-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.time}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm text-muted-foreground">{c.preview}</div>
                    {(c as any).unread && <span className="rounded-full bg-[#3b82f6] px-2 py-0.5 text-xs font-bold text-white">{(c as any).unread}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* COMMUNITY */}
      {commF.length > 0 && (
        <section>
          <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Community</h4>
          <div className="space-y-3">
            {commF.map((c) => (
              <button key={c.name} onClick={() => openDetail({ kind: "chat", name: c.name, color: c.color, icon: true, isGroup: true, members: c.members })} className="flex w-full items-center gap-3 text-left">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${c.color} text-white`}><Users size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.time}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm text-muted-foreground">{c.preview}</div>
                    {c.unread ? (
                      <span className="rounded-full bg-[#3b82f6] px-2 py-0.5 text-xs font-bold text-white">{c.unread}</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">{c.members} members</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="my-2 border-t border-white/5" />
      <button onClick={() => openDetail({ kind: "find-friend" })} className="w-full text-left">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3b82f6]/15 text-[#3b82f6]"><UserPlus size={18} /></div>
          <div><div className="font-bold">Find a Runner Friend</div><div className="text-sm text-muted-foreground">Connect with other runners</div></div>
        </Card>
      </button>
      <button onClick={() => openDetail({ kind: "find-community" })} className="w-full text-left">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/15 text-purple-400"><Users size={18} /></div>
          <div><div className="font-bold">Find a Community</div><div className="text-sm text-muted-foreground">Join running groups near you</div></div>
        </Card>
      </button>
    </div>
  );
}

function ProfileScreen({ onSettings, openDetail }: { onSettings: () => void; openDetail: (d: Detail) => void }) {
  const photoInput = useRef<HTMLInputElement>(null);
  const bgInput = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [bg, setBg] = useState<string>("linear-gradient(135deg,#3b82f6,#a855f7)");

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPhoto(URL.createObjectURL(f));
  }
  function onBg(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setBg(`url(${URL.createObjectURL(f)}) center/cover`);
  }

  return (
    <div className="space-y-6 px-5 pt-6">
      {/* Header with gear icon (only entry point to Settings Drawer) */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile</h2>
        <button onClick={onSettings} aria-label="Settings" className="rounded-full border border-white/10 bg-white/5 p-2.5">
          <Settings size={18} />
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        {/* Background banner (editable) */}
        <div className="relative h-28 w-full" style={{ background: bg }}>
          <button
            onClick={() => bgInput.current?.click()}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur hover:bg-black/70"
            aria-label="Edit background"
          >
            <Pencil size={14} className="text-white" />
          </button>
          <span className="absolute bottom-2 right-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/80 backdrop-blur">Tap to change background</span>
          <input ref={bgInput} type="file" accept="image/*" hidden onChange={onBg} />
        </div>
        <div className="px-6 pb-6 text-center">
          <div className="relative mx-auto -mt-10 h-20 w-20">
            <div
              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-3xl shadow-brand ring-4 ring-[#0a0f24]"
              style={photo ? { backgroundImage: `url(${photo})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              {!photo && "🏃"}
            </div>
            <button
              onClick={() => photoInput.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6] ring-2 ring-[#0a0f24]"
              aria-label="Edit profile photo"
            >
              <Pencil size={12} className="text-white" />
            </button>
            <input ref={photoInput} type="file" accept="image/*" hidden onChange={onPhoto} />
          </div>
          <div className="mt-3 text-xl font-bold">Andi Pratama</div>
          <div className="text-sm text-muted-foreground">Marathon Runner · Sub-4hr Goal</div>
          <div className="my-5 h-px bg-white/5" />
          <div className="grid grid-cols-3 divide-x divide-white/5">
            <div><div className="text-2xl font-bold">247</div><div className="text-xs text-muted-foreground">Total KM</div></div>
            <div><div className="text-2xl font-bold">42</div><div className="text-xs text-muted-foreground">Total Runs</div></div>
            <div><div className="text-2xl font-bold">8</div><div className="text-xs text-muted-foreground">Active Weeks</div></div>
          </div>
        </div>
      </Card>

      {/* MY COACH */}
      <section>
        <h3 className="mb-3 font-bold">My Coach</h3>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">SM</div>
            <div className="flex-1">
              <div className="font-bold">Sarah Mitchell</div>
              <div className="text-xs text-muted-foreground">Marathon Specialist</div>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <Check size={10} /> Plan approved
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => openDetail({ kind: "chat", name: "Coach Sarah Mitchell", initials: "SM", color: "from-indigo-500 to-purple-500", isCoach: true })}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-brand py-2.5 text-xs font-semibold text-white shadow-brand"
            >
              <MessageSquare size={14} /> Message
            </button>
            <button
              onClick={() => openDetail({ kind: "coach", name: "Sarah Mitchell", specialty: "Marathon Specialist", initials: "SM", price: "Rp 850k" })}
              className="rounded-xl border border-white/15 py-2.5 text-xs font-semibold"
            >
              View Profile
            </button>
            <button
              onClick={() => openDetail({ kind: "find-coach" })}
              className="rounded-xl border border-white/15 py-2.5 text-xs font-semibold"
            >
              Change
            </button>
          </div>
        </Card>
      </section>

      {/* FIND COACH marketplace entry */}
      <section>
        <h3 className="mb-3 font-bold">Find Coach</h3>
        <button onClick={() => openDetail({ kind: "find-coach" })} className="w-full text-left">
          <Card className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-brand"><Search size={18} /></div>
            <div className="flex-1">
              <div className="font-bold">Browse Coach Marketplace</div>
              <div className="text-xs text-muted-foreground">Marathon · Speed · Trail · Ultra</div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Card>
        </button>
      </section>

      {/* CURRENT PROGRESS (collapsed) */}
      <section>
        <h3 className="mb-3 font-bold">Current Progress</h3>
        <button onClick={() => openDetail({ kind: "current-progress" })} className="w-full text-left">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">Jakarta Marathon 2026</div>
                <div className="text-xs text-muted-foreground">Target: 15 Nov 2026 · Week 8 of 16</div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-brand" style={{ width: "50%" }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">50% complete</span>
              <span className="font-semibold text-[#3b82f6]">See calendar →</span>
            </div>
            <ProgressGridMini />
          </Card>
        </button>
      </section>

      {/* DAILY READINESS metrics */}
      <section>
        <h3 className="mb-3 font-bold">Daily Readiness</h3>
        <div className="grid grid-cols-3 gap-3">
          <MetricCard icon={<Heart size={14} />} label="HRV" value="68" unit="ms" bar="linear-gradient(90deg,#ef4444,#ec4899)" />
          <MetricCard icon={<Moon size={14} />} label="SLEEP" value="7.2" unit="hrs" bar="linear-gradient(90deg,#a855f7,#3b82f6)" />
          <MetricCard icon={<Dumbbell size={14} />} label="LOAD" value="45" unit="" bar="linear-gradient(90deg,#f59e0b,#fbbf24)" />
        </div>
        <button onClick={() => openDetail({ kind: "trend-28d" })} className="mt-3 w-full text-left">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">7-Day Trend</h3>
              <TrendingUp size={18} className="text-green-400" />
            </div>
            <Sparkline />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              {["M","T","W","T","F","S","S"].map((d,i)=><span key={i}>{d}</span>)}
            </div>
          </Card>
        </button>
      </section>
    </div>
  );
}

// Status for each calendar day in Current Progress
type DayStatus = "training" | "rest" | "none";

function generateMonth(year: number, month: number): { date: Date; status: DayStatus }[] {
  // Build a 5-week (35 day) view starting from the first Sunday on/before the 1st
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0=Sun
  const start = new Date(year, month, 1 - startOffset);
  const out: { date: Date; status: DayStatus }[] = [];
  const today = new Date();
  for (let i = 0; i < 35; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    let status: DayStatus = "none";
    if (d.getMonth() === month && d.getTime() <= today.getTime()) {
      // Demo: weekdays training, weekends rest, with some misses
      const wd = d.getDay();
      if (wd === 0 || wd === 6) status = "rest";
      else status = d.getDate() % 5 === 0 ? "rest" : "training";
    }
    out.push({ date: d, status });
  }
  return out;
}

function ProgressGridMini() {
  const now = new Date();
  const cells = generateMonth(now.getFullYear(), now.getMonth());
  return (
    <div className="mt-4 grid grid-cols-7 gap-1.5">
      {cells.slice(0, 14).map((c, i) => (
        <div
          key={i}
          className="aspect-square rounded-full"
          style={{
            background:
              c.status === "training" ? "#22c55e" :
              c.status === "rest" ? "#ef4444" :
              "rgba(255,255,255,0.08)",
          }}
        />
      ))}
    </div>
  );
}


function SettingsSheet({ onClose, onLogout, openDetail }: { onClose: () => void; onLogout: () => void; openDetail: (d: Detail) => void }) {
  type Item = { icon: any; label: string; sub?: string; badge?: string; onClick: () => void };
  const account: Item[] = [
    { icon: User, label: "Edit Profile", sub: "Name, bio, personal info", onClick: () => openDetail({ kind: "profile-item", title: "Edit Profile", sub: "Name, bio, personal info" }) },
    { icon: LinkIcon, label: "Connect Apps", sub: "Garmin, Strava, Apple Health, MFP, Whoop", onClick: () => openDetail({ kind: "connect-apps" }) },
    { icon: Shield, label: "Privacy Settings", sub: "Data sharing & visibility", onClick: () => openDetail({ kind: "privacy-settings" }) },
    { icon: Bell, label: "Notifications", sub: "Alerts, reminders, HRV pings", onClick: () => openDetail({ kind: "notif-prefs" }) },
  ];
  const billing: Item[] = [
    { icon: FileText, label: "Subscription", sub: "RUNIQ Pro · Rp 180k/mo", badge: "Free", onClick: () => openDetail({ kind: "subscription" }) },
  ];
  const help: Item[] = [
    { icon: HelpCircle, label: "Help & Support", sub: "FAQ, contact, feedback", onClick: () => openDetail({ kind: "help" }) },
  ];
  const legal: Item[] = [
    { icon: FileText, label: "Terms of Service", onClick: () => openDetail({ kind: "legal", doc: "tos", title: "Terms of Service" }) },
    { icon: Shield, label: "Privacy Policy", onClick: () => openDetail({ kind: "legal", doc: "privacy", title: "Privacy Policy" }) },
    { icon: AlertTriangle, label: "Medical & Fitness Disclaimer", onClick: () => openDetail({ kind: "legal", doc: "disclaimer", title: "Medical & Fitness Disclaimer" }) },
  ];

  function Group({ title, items }: { title: string; items: Item[] }) {
    return (
      <div className="mt-5">
        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h4>
        <Card className="divide-y divide-white/5 p-0">
          {items.map((it) => (
            <button key={it.label} onClick={() => { onClose(); it.onClick(); }} className="flex w-full items-center gap-3 p-3.5 text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground"><it.icon size={16} /></span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{it.label}</span>
                {it.sub && <span className="block text-[11px] text-muted-foreground">{it.sub}</span>}
              </span>
              {it.badge && <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{it.badge}</span>}
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/60" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-[88%] overflow-y-auto bg-[#0f1530] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-xl font-bold shadow-brand">A</div>
          <div>
            <div className="font-bold">Andi Pratama</div>
            <div className="text-xs text-muted-foreground">Athlete · andi@example.com</div>
          </div>
        </div>

        <Group title="Account" items={account} />
        <Group title="Billing" items={billing} />
        <Group title="Support" items={help} />
        <Group title="Legal" items={legal} />

        <div className="mt-5">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Explore (Scaffold)</h4>
          <Card className="divide-y divide-white/5 p-0">
            <a href="/onboarding" className="flex w-full items-center gap-3 p-3.5 text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground"><Sparkles size={16} /></span>
              <span className="flex-1"><span className="block text-sm font-semibold">Onboarding Flow</span><span className="block text-[11px] text-muted-foreground">Goal → Baseline → Devices → Coach</span></span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </a>
            <a href="/coach" className="flex w-full items-center gap-3 p-3.5 text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground"><Users size={16} /></span>
              <span className="flex-1"><span className="block text-sm font-semibold">Coach Console</span><span className="block text-[11px] text-muted-foreground">Athletes, plan review, squad insights</span></span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </a>
            <a href="/admin" className="flex w-full items-center gap-3 p-3.5 text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground"><Shield size={16} /></span>
              <span className="flex-1"><span className="block text-sm font-semibold">Admin Dashboard</span><span className="block text-[11px] text-muted-foreground">Super Admin, Coach Head, Sales, Analytics</span></span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </a>
          </Card>
        </div>

        <div className="my-6 h-px bg-white/5" />
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-left text-rose-400">
          <LogOut size={18} /> <span className="font-bold">Log Out</span>
        </button>
        <div className="mt-4 text-center text-[10px] text-muted-foreground">RUNIQ v1.0.0 · Made in Jakarta 🇮🇩</div>
      </div>
    </div>
  );
}

function Row({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-4 rounded-xl py-3 text-left">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 font-semibold">{label}</span>
      <ChevronRight size={18} className="text-muted-foreground" />
    </button>
  );
}

function DetailOverlay({ detail, onBack }: { detail: Detail; onBack: () => void }) {
  return (
    <div className="absolute inset-0 z-[60] flex flex-col bg-[#0a0f24]">
      <header className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
        <button onClick={onBack} className="rounded-full p-1"><ArrowLeft size={22} /></button>
        <h2 className="text-lg font-bold">{detailTitle(detail)}</h2>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <DetailBody detail={detail} />
      </div>
    </div>
  );
}

function detailTitle(d: Detail): string {
  switch (d.kind) {
    case "chat": return d.name;
    case "coach": return d.name;
    case "workout": return `${d.day} · ${d.type}`;
    case "run": return d.title;
    case "profile-item": return d.title;
    case "settings-item": return d.label;
    case "find-friend": return "Find a Friend";
    case "find-community": return "Find a Community";
    case "find-coach": return "Find Coach";
    case "ai-notes": return "AI Coach Notes";
    case "upgrade": return "Upgrade to Pro";
    case "connect-apps": return "Connect Apps";
    case "subscription": return "Subscription";
    case "notif-prefs": return "Notifications";
    case "privacy-settings": return "Privacy Settings";
    case "help": return "Help & Support";
    case "legal": return d.title;
    case "current-progress": return "Current Progress";
    case "notifications": return "Notifications";
    case "readiness-breakdown": return "Readiness Breakdown";
    case "trend-28d": return "28-Day Trend";
  }
}


function DetailBody({ detail }: { detail: Detail }) {
  if (detail.kind === "chat") return <ChatDetailView chat={detail} />;
  if (detail.kind === "coach") {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-xl font-bold text-white shadow-brand">{detail.initials}</div>
          <div>
            <div className="text-xl font-bold">{detail.name}</div>
            <div className="text-sm text-muted-foreground">{detail.specialty}</div>
          </div>
        </div>
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">Monthly subscription</div>
          <div className="text-3xl font-black">{detail.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
        </Card>
        <div>
          <h3 className="mb-2 font-bold">About</h3>
          <p className="text-sm text-muted-foreground">10+ years coaching elite runners. Personalized plans validated against your HRV, sleep and recent training load.</p>
        </div>
        <div>
          <h3 className="mb-2 font-bold">Certifications</h3>
          <div className="flex gap-2"><span className="rounded-full border border-[#3b82f6]/40 px-2 py-0.5 text-xs text-[#3b82f6]">USATF L2</span><span className="rounded-full border border-[#3b82f6]/40 px-2 py-0.5 text-xs text-[#3b82f6]">RRCA</span></div>
        </div>
        <button className="w-full rounded-2xl bg-gradient-brand py-4 font-semibold text-white shadow-brand">Book {detail.name.split(" ")[0]}</button>
      </div>
    );
  }
  if (detail.kind === "workout") {
    return (
      <div className="space-y-5">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{detail.date}</div>
          <div className="mt-1 text-2xl font-bold text-[#3b82f6]">{detail.type}</div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><div className="text-muted-foreground">Distance</div><div className="text-lg font-bold">{detail.miles}</div></div>
            <div><div className="text-muted-foreground">Target</div><div className="text-lg font-bold">{detail.pace}</div></div>
          </div>
        </Card>
        <div>
          <h3 className="mb-2 font-bold">Coach Notes</h3>
          <p className="text-sm text-muted-foreground">Keep effort conversational. Focus on cadence around 175 spm. Hydrate well before and after.</p>
        </div>
        <button className="w-full rounded-2xl bg-gradient-brand py-4 font-semibold text-white shadow-brand">Start Workout</button>
      </div>
    );
  }
  if (detail.kind === "run") {
    return (
      <div className="space-y-5">
        <div className="text-sm text-muted-foreground">{detail.date}</div>
        <Card className="grid grid-cols-2 gap-4 p-5 text-sm">
          {["Distance","Duration","Pace","Avg HR"].map((l,i)=>(
            <div key={l}><div className="text-muted-foreground">{l}</div><div className="text-lg font-bold">{detail.stats[i]}</div></div>
          ))}
        </Card>
        <Card className="h-44 p-0">
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Route map</div>
        </Card>
        <button className="w-full rounded-2xl border border-white/10 py-3.5 text-sm font-semibold">Share Activity</button>
      </div>
    );
  }
  if (detail.kind === "ai-notes") {
    return (
      <div className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[#3b82f6]"><Sparkles size={18} /><span className="font-bold">This Week</span></div>
          <p className="mt-3 text-sm text-muted-foreground">Your HRV is trending up. We've increased Thursday's tempo by 0.5 mi. Coach Sarah reviewed and approved on May 6.</p>
        </Card>
        <Card className="p-5">
          <div className="font-bold">Why this week</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Readiness 72 (up from 65)</li>
            <li>Sleep avg 7.2 hrs</li>
            <li>Load below CTL target</li>
          </ul>
        </Card>
      </div>
    );
  }
  if (detail.kind === "find-friend") {
    return (
      <div className="space-y-3">
        {["Aldi P.","Rina S.","Budi H.","Citra M."].map((n,i) => (
          <Card key={n} className="flex items-center gap-3 p-4">
            <AvatarC initials={n.split(" ").map(s=>s[0]).join("")} color={["from-orange-400 to-amber-500","from-indigo-500 to-purple-500","from-emerald-400 to-teal-500","from-pink-500 to-fuchsia-500"][i]} />
            <div className="flex-1"><div className="font-bold">{n}</div><div className="text-xs text-muted-foreground">Jakarta · 5x/wk</div></div>
            <button className="rounded-full bg-[#3b82f6] px-4 py-2 text-xs font-semibold text-white">Add</button>
          </Card>
        ))}
      </div>
    );
  }
  if (detail.kind === "find-community") {
    return (
      <div className="space-y-3">
        {[
          { name: "Morning Runners Club", members: 128 },
          { name: "Jakarta Trail Pack", members: 64 },
          { name: "Sub-4 Marathon Squad", members: 42 },
        ].map((g) => (
          <Card key={g.name} className="p-4">
            <div className="font-bold">{g.name}</div>
            <div className="text-xs text-muted-foreground">{g.members} runners</div>
            <button className="mt-3 w-full rounded-xl bg-gradient-brand py-2.5 text-sm font-semibold text-white shadow-brand">Join</button>
          </Card>
        ))}
      </div>
    );
  }
  if (detail.kind === "upgrade") {
    return (
      <div className="space-y-4">
        <Card className="p-5 text-center">
          <div className="text-3xl font-black">Pro</div>
          <div className="text-2xl font-bold">Rp 149k<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
        </Card>
        <ul className="space-y-3">
          {["Unlimited AI plan rewrites","Coach-validated workouts","Advanced HRV insights","Priority messaging"].map(f => (
            <li key={f} className="flex items-start gap-3 text-sm"><Check size={18} className="text-emerald-400" /> {f}</li>
          ))}
        </ul>
        <button className="w-full rounded-2xl bg-gradient-brand py-4 font-semibold text-white shadow-brand">Upgrade</button>
      </div>
    );
  }
  if (detail.kind === "connect-apps") return <ConnectAppsView />;
  if (detail.kind === "legal") {
    const text =
      detail.doc === "tos" ? tosMd :
      detail.doc === "privacy" ? privacyMd :
      disclaimerMd;
    return (
      <div className="prose prose-invert max-w-none text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
        {text}
      </div>
    );
  }
  if (detail.kind === "current-progress") return <CurrentProgressView />;
  if (detail.kind === "notifications") return <NotificationsView />;
  if (detail.kind === "readiness-breakdown") return <ReadinessBreakdownView />;
  if (detail.kind === "trend-28d") return <Trend28View />;
  if (detail.kind === "find-coach") return <FindCoachView />;
  if (detail.kind === "subscription") return <SubscriptionView />;
  if (detail.kind === "notif-prefs") return <NotifPrefsView />;
  if (detail.kind === "privacy-settings") return <PrivacySettingsView />;
  if (detail.kind === "help") return <HelpSupportView />;
  if (detail.kind === "settings-item" || detail.kind === "profile-item") {
    const sub = detail.kind === "profile-item" ? detail.sub : "Manage your preferences";
    return (
      <div className="space-y-4">
        <Card className="p-5">
          <div className="font-bold">{(detail as any).title ?? (detail as any).label}</div>
          <div className="mt-1 text-sm text-muted-foreground">{sub}</div>
        </Card>
        <Card className="divide-y divide-white/5">
          {["Option A","Option B","Option C"].map(o => (
            <div key={o} className="flex items-center justify-between p-4">
              <span className="text-sm">{o}</span>
              <span className="h-5 w-9 rounded-full bg-white/10 p-0.5"><span className="block h-4 w-4 rounded-full bg-white" /></span>
            </div>
          ))}
        </Card>
      </div>
    );

  }
  return null;
}

function ConnectAppsView() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const apps = [
    { id: "garmin", name: "Garmin Connect", desc: "Watches & cycling computers", icon: <Watch size={22} className="text-[#3b82f6]" />, onConnect: connectGarmin },
    { id: "strava", name: "Strava", desc: "Activities & social feed", icon: <Activity size={22} className="text-orange-500" />, onConnect: connectStrava },
    { id: "apple-health", name: "Apple Health", desc: "iPhone & Apple Watch", icon: <Apple size={22} className="text-white" />, onConnect: () => alert("Apple Health: Tap Allow when iOS prompts to share HealthKit data.") },
    { id: "google-fit", name: "Google Fit / Android Health", desc: "Android phones & Wear OS", icon: <Smartphone size={22} className="text-emerald-400" />, onConnect: () => alert("Android: redirect to Google Fit authorization (OAuth).") },
    { id: "huawei-health", name: "Huawei Health", desc: "Huawei watches & bands", icon: <Smartphone size={22} className="text-red-400" />, onConnect: () => alert("Huawei Health Kit: redirect to Huawei ID OAuth.") },
    { id: "mfp", name: "MyFitnessPal", desc: "Nutrition & calorie tracking", icon: <Utensils size={22} className="text-blue-400" />, onConnect: () => alert("MyFitnessPal: redirect to MFP OAuth.") },
    { id: "whoop", name: "Whoop", desc: "Recovery, strain & sleep", icon: <Heart size={22} className="text-rose-400" />, onConnect: () => alert("Whoop: redirect to api.prod.whoop.com OAuth.") },
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Connect your devices and apps so RUNIQ can sync workouts, recovery metrics, and nutrition automatically.
      </p>
      {apps.map((a) => {
        const isConnected = connected[a.id];
        return (
          <Card key={a.id} className="flex items-center gap-4 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">{a.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{a.name}</div>
              <div className="text-xs text-muted-foreground truncate">{a.desc}</div>
            </div>
            <button
              onClick={() => {
                if (isConnected) {
                  setConnected((c) => ({ ...c, [a.id]: false }));
                } else {
                  setConnected((c) => ({ ...c, [a.id]: true }));
                  a.onConnect();
                }
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                isConnected
                  ? "border border-emerald-500/40 text-emerald-400"
                  : "bg-[#3b82f6] text-white"
              }`}
            >
              {isConnected ? "Connected" : "Connect"}
            </button>
          </Card>
        );
      })}
    </div>
  );
}

function CurrentProgressView() {
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const cells = generateMonth(cursor.y, cursor.m);
  const monthName = new Date(cursor.y, cursor.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const trained = cells.filter((c) => c.status === "training").length;
  const rest = cells.filter((c) => c.status === "rest").length;

  function shift(delta: number) {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  // Touch swipe handlers
  const touchX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) shift(dx < 0 ? 1 : -1);
    touchX.current = null;
  }

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <button onClick={() => shift(-1)} className="rounded-full p-1.5 hover:bg-white/5"><ChevronLeft size={20} /></button>
          <div className="font-bold">{monthName}</div>
          <button onClick={() => shift(1)} className="rounded-full p-1.5 hover:bg-white/5"><ChevronRight size={20} /></button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
          {["S","M","T","W","T","F","S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div
          className="mt-2 grid grid-cols-7 gap-1.5 select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {cells.map((c, i) => {
            const inMonth = c.date.getMonth() === cursor.m;
            const color =
              c.status === "training" ? "#22c55e" :
              c.status === "rest" ? "#ef4444" :
              "rgba(255,255,255,0.08)";
            return (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-full text-[10px] font-semibold"
                style={{
                  background: color,
                  color: c.status === "none" ? "rgba(255,255,255,0.4)" : "#0a0f24",
                  opacity: inMonth ? 1 : 0.25,
                }}
              >
                {c.date.getDate()}
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Training</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Rest</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-white/10" /> No plan</span>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 font-bold">Weekly Summary</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.slice(0, 7).map((c, i) => {
            const ratio = c.status === "training" ? 1 : c.status === "rest" ? 0.3 : 0;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="relative h-9 w-9">
                  <svg viewBox="0 0 36 36" className="h-9 w-9 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                    <circle
                      cx="18" cy="18" r="15" fill="none"
                      stroke={c.status === "training" ? "#22c55e" : c.status === "rest" ? "#ef4444" : "transparent"}
                      strokeWidth="4"
                      strokeDasharray={`${ratio * 94.2} 94.2`}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <span className="text-[10px] text-muted-foreground">{["S","M","T","W","T","F","S"][c.date.getDay()]}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="grid grid-cols-2 gap-4 p-5 text-center">
        <div>
          <div className="text-2xl font-bold text-emerald-400">{trained}</div>
          <div className="text-xs text-muted-foreground">Training days</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-400">{rest}</div>
          <div className="text-xs text-muted-foreground">Rest / missed</div>
        </div>
      </Card>
    </div>
  );
}



function NotificationsView() {
  const groups = [
    {
      label: "Today",
      items: [
        { title: "Tempo Run session waiting", body: "12 km · Zone 4 · Tap to start", time: "08:12", icon: <Activity size={16} className="text-[#3b82f6]" /> },
        { title: "Coach Andre sent a message", body: "Focus on pace, don't over-effort.", time: "07:40", icon: <MessageSquare size={16} className="text-emerald-400" /> },
        { title: "Readiness ready", body: "Score 72 — Moderate Training", time: "06:30", icon: <Heart size={16} className="text-rose-400" /> },
      ],
    },
    {
      label: "Yesterday",
      items: [
        { title: "Sarah selesai 5 km", body: "Pace 5:42/km · 28:30", time: "Kemarin", icon: <Footprints size={16} className="text-amber-400" /> },
      ],
    },
    {
      label: "Last Week",
      items: [
        { title: "Program plan diperbarui", body: "Week 8 of 16 · Base Building", time: "3 hari", icon: <Calendar size={16} className="text-purple-400" /> },
      ],
    },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Latest notifications</span>
        <button className="text-xs font-semibold text-[#3b82f6]">Mark all read</button>
      </div>
      {groups.map((g) => (
        <div key={g.label}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</h4>
          <div className="space-y-2">
            {g.items.map((n, i) => (
              <Card key={i} className="flex items-start gap-3 p-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">{n.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadinessBreakdownView() {
  const parts = [
    { l: "HRV", w: 40, v: 70, c: "#ef4444", sub: "58 ms vs 62 ms baseline" },
    { l: "Sleep", w: 30, v: 84, c: "#a855f7", sub: "7.2 h · 84% quality" },
    { l: "Load", w: 30, v: 68, c: "#10b981", sub: "ACWR 1.1 · optimal" },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-5 text-center">
        <div className="text-5xl font-black text-[#eab308]">72</div>
        <div className="mt-1 text-sm text-muted-foreground">Daily composite · Moderate Training</div>
      </Card>
      {parts.map((p) => (
        <Card key={p.l} className="p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{p.l} <span className="text-xs text-muted-foreground">({p.w}%)</span></div>
            <div className="text-sm font-bold">{p.v}</div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full" style={{ width: `${p.v}%`, background: p.c }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{p.sub}</p>
        </Card>
      ))}
    </div>
  );
}

function Trend28View() {
  const data = Array.from({ length: 28 }, (_, i) => 50 + Math.round(Math.sin(i / 3) * 15 + (i % 5) * 3));
  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex items-end justify-between gap-1" style={{ height: 160 }}>
          {data.map((v, i) => (
            <div key={i} className="flex-1 rounded-t" style={{ height: `${v}%`, background: i === data.length - 1 ? "#22d3ee" : "rgba(168,85,247,0.6)" }} />
          ))}
        </div>
        <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
          <span>4 weeks ago</span><span>Today</span>
        </div>
      </Card>
      <Card className="p-4 text-sm">
        <div className="font-semibold">Insight</div>
        <p className="mt-1 text-muted-foreground">28-day average: 64. Last 7-day trend improving (+8). Maintain 7+ hours of sleep.</p>
      </Card>
    </div>
  );
}

// ================= Chat Detail =================
function ChatDetailView({ chat }: { chat: Extract<Detail, { kind: "chat" }> }) {
  type Msg = { me: boolean; t: string; time?: string; voice?: boolean; sec?: number; card?: { title: string; sub: string; icon: React.ReactNode } };
  const isCoach = !!chat.isCoach;
  const isGroup = !!chat.isGroup;

  const coachMsgs: Msg[] = [
    { me: false, t: "Great job on today's tempo run! Keep the effort dialed in.", time: "09:12" },
    { me: false, t: "", voice: true, sec: 32, time: "09:13" },
    { me: true, t: "Thanks coach — legs felt strong today.", time: "09:20" },
    { me: false, t: "", time: "09:22", card: { title: "Tomorrow · Recovery Jog", sub: "5 km · HR < 140 · Zone 1–2", icon: <Footprints size={18} className="text-[#3b82f6]" /> } },
    { me: false, t: "Keep HR under 140 and hydrate well before bed.", time: "09:22" },
  ];
  const runnerMsgs: Msg[] = [
    { me: false, t: "Ready for Saturday LSD? 🏃", time: "16:04" },
    { me: true, t: "Ya, jam 6 pagi ya", time: "16:10" },
  ];
  const groupMsgs: Msg[] = [
    { me: false, t: "Ryan: See you all at 6am Saturday!", time: "Yesterday" },
    { me: false, t: "Dita: I'll bring bananas 🍌", time: "Yesterday" },
    { me: true, t: "Count me in!", time: "08:02" },
  ];
  const msgs = isCoach ? coachMsgs : isGroup ? groupMsgs : runnerMsgs;

  return (
    <div className="-mx-5 -my-6 flex h-[calc(100%+3rem)] flex-col">
      {/* Pinned plan banner — coach only */}
      {isCoach && (
        <div className="border-b border-[#3b82f6]/25 bg-gradient-to-r from-[#3b82f6]/15 to-purple-500/10 px-5 py-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#3b82f6]">
            <Pin size={12} /> Pinned Plan
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold">This Week — Marathon Base Wk 8</div>
              <div className="text-[11px] text-muted-foreground">6 sessions · Approved · Last updated 2h ago</div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <Check size={10} /> Approved
            </span>
          </div>
        </div>
      )}
      {isGroup && (
        <div className="border-b border-white/5 px-5 py-2 text-center text-[11px] text-muted-foreground">
          <Users size={12} className="mr-1 inline" /> {chat.members ?? 42} members
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                m.me
                  ? "bg-gradient-brand text-white shadow-brand"
                  : "border border-white/10 bg-white/5"
              }`}
            >
              {m.card ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">{m.card.icon}</div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-[#3b82f6]">Session Card</div>
                    <div className="font-bold">{m.card.title}</div>
                    <div className="text-[11px] text-muted-foreground">{m.card.sub}</div>
                  </div>
                </div>
              ) : m.voice ? (
                <div className="flex items-center gap-3">
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"><Play size={14} /></button>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 18 }).map((_, k) => (
                      <span key={k} className="block w-0.5 rounded-full bg-white/70" style={{ height: `${6 + Math.abs(Math.sin(k)) * 14}px` }} />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground">0:{String(m.sec ?? 0).padStart(2, "0")}</span>
                </div>
              ) : (
                <div>{m.t}</div>
              )}
              {m.time && <div className={`mt-1 text-[10px] ${m.me ? "text-white/70" : "text-muted-foreground"}`}>{m.time}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="border-t border-white/5 bg-[#0a0f24] px-4 py-3">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1.5">
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-white" aria-label="Attach">
            <Paperclip size={16} />
          </button>
          <input placeholder="Type a message…" className="w-full bg-transparent text-sm outline-none" />
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-white" aria-label="Voice note">
            <Mic size={16} />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand shadow-brand" aria-label="Send">
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= Find Coach =================
function FindCoachView() {
  const [filter, setFilter] = useState("All");
  const chips = ["All", "Marathon", "Speed", "Trail", "Ultra", "Beginner"];
  const coaches = [
    { name: "Sarah Mitchell", initials: "SM", specialty: "Marathon Specialist", price: "Rp 850k", rating: 4.9, reviews: 127, certs: ["USATF L2", "RRCA"], color: "from-indigo-500 to-purple-500" },
    { name: "Dana Wijaya", initials: "DW", specialty: "Trail & Ultra", price: "Rp 950k", rating: 4.8, reviews: 84, certs: ["UESCA", "ACE"], color: "from-emerald-500 to-teal-500" },
    { name: "Rio Hidayat", initials: "RH", specialty: "Speed & 5k–10k", price: "Rp 650k", rating: 4.7, reviews: 56, certs: ["USATF L1"], color: "from-orange-500 to-red-500" },
    { name: "Mira Santoso", initials: "MS", specialty: "Beginner Friendly", price: "Rp 550k", rating: 4.9, reviews: 210, certs: ["RRCA"], color: "from-pink-500 to-fuchsia-500" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <Search size={16} className="text-muted-foreground" />
        <input placeholder="Search coaches…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === c ? "border-[#3b82f6] bg-[#3b82f6]/20 text-[#3b82f6]" : "border-white/10 bg-white/5 text-muted-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {coaches.map((c) => (
          <Card key={c.name} className="p-4">
            <div className="flex items-start gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${c.color} font-bold text-white`}>{c.initials}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold">{c.name}</div>
                  <div className="text-sm font-bold">{c.price}<span className="text-[10px] font-normal text-muted-foreground">/mo</span></div>
                </div>
                <div className="text-xs text-muted-foreground">{c.specialty}</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{c.rating}</span>
                  <span className="text-muted-foreground">({c.reviews})</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.certs.map((cert) => (
                    <span key={cert} className="rounded-full border border-[#3b82f6]/40 px-2 py-0.5 text-[10px] text-[#3b82f6]">{cert}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="rounded-xl border border-white/15 py-2 text-xs font-semibold">View Profile</button>
              <button className="rounded-xl bg-gradient-brand py-2 text-xs font-semibold text-white shadow-brand">Book</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ================= Subscription =================
function SubscriptionView() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const perks = [
    "Unlimited AI training plans",
    "Coach-approved sessions",
    "Advanced HRV & load analytics",
    "Priority chat with your coach",
    "Custom race calendar & taper",
    "Export to Garmin, Strava, Apple Health",
  ];
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-brand p-5 text-white">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/80"><Crown size={12} /> RUNIQ Pro</div>
          <div className="mt-2 text-3xl font-black">
            {billing === "monthly" ? "Rp 180,000" : "Rp 1,800,000"}
            <span className="ml-1 text-sm font-normal text-white/70">/ {billing === "monthly" ? "month" : "year"}</span>
          </div>
          {billing === "yearly" && <div className="text-xs text-white/80">Save Rp 360,000 · 2 months free</div>}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
            {(["monthly", "yearly"] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)} className={`rounded-lg py-2 text-xs font-semibold ${billing === b ? "bg-gradient-brand text-white shadow-brand" : "text-muted-foreground"}`}>
                {b === "monthly" ? "Monthly" : "Yearly · -17%"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="font-bold">What you get</div>
        <ul className="mt-3 space-y-2 text-sm">
          {perks.map((p) => (
            <li key={p} className="flex items-start gap-2"><Check size={16} className="mt-0.5 text-emerald-400" /><span>{p}</span></li>
          ))}
        </ul>
      </Card>

      <Card className="p-4 text-xs text-muted-foreground">
        Current plan: <span className="font-semibold text-foreground">Free</span> · Renews automatically. Cancel anytime from Settings.
      </Card>

      <button className="w-full rounded-2xl bg-gradient-brand py-4 font-bold text-white shadow-brand">
        Upgrade to Pro
      </button>
      <button className="w-full rounded-2xl border border-white/10 py-3 text-sm font-semibold text-muted-foreground">Restore Purchase</button>
    </div>
  );
}

// ================= Notification Preferences =================
function NotifPrefsView() {
  const groups = [
    { title: "Training", items: ["Daily plan reminder", "Coach approved plan", "Session start reminder"] },
    { title: "Health", items: ["Low HRV alert", "Poor sleep detected", "High training load"] },
    { title: "Social", items: ["Friend activity", "Community messages", "Coach message"] },
    { title: "System", items: ["App updates", "Promotions & tips"] },
  ];
  const [state, setState] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setState((s) => ({ ...s, [k]: !(s[k] ?? true) }));
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <section key={g.title}>
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{g.title}</h4>
          <Card className="divide-y divide-white/5 p-0">
            {g.items.map((it) => {
              const on = state[it] ?? true;
              return (
                <div key={it} className="flex items-center justify-between p-4">
                  <span className="text-sm">{it}</span>
                  <button
                    onClick={() => toggle(it)}
                    className={`relative h-6 w-11 rounded-full transition ${on ? "bg-gradient-brand" : "bg-white/10"}`}
                    aria-pressed={on}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </Card>
        </section>
      ))}
    </div>
  );
}

// ================= Privacy Settings =================
function PrivacySettingsView() {
  const groups = [
    { title: "Data Sharing", items: ["Share activities with coach", "Share HRV & sleep with coach", "Anonymous analytics"] },
    { title: "Visibility", items: ["Show profile in community", "Discoverable by friends", "Share workouts to feed"] },
    { title: "Third-party Sync", items: ["Sync to Strava", "Sync to Garmin", "Sync to Apple Health"] },
  ];
  const [state, setState] = useState<Record<string, boolean>>({ "Share activities with coach": true, "Share HRV & sleep with coach": true });
  const toggle = (k: string) => setState((s) => ({ ...s, [k]: !s[k] }));
  return (
    <div className="space-y-5">
      <Card className="border border-[#3b82f6]/25 bg-[#3b82f6]/10 p-4 text-xs text-muted-foreground">
        <div className="flex items-start gap-2 text-foreground"><Shield size={14} className="mt-0.5 text-[#3b82f6]" /><span className="font-semibold">Your data is yours.</span></div>
        <p className="mt-1">Manage what RUNIQ, your coach, and connected apps can see. Changes take effect immediately.</p>
      </Card>
      {groups.map((g) => (
        <section key={g.title}>
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{g.title}</h4>
          <Card className="divide-y divide-white/5 p-0">
            {g.items.map((it) => {
              const on = !!state[it];
              return (
                <div key={it} className="flex items-center justify-between p-4">
                  <span className="text-sm">{it}</span>
                  <button
                    onClick={() => toggle(it)}
                    className={`relative h-6 w-11 rounded-full transition ${on ? "bg-gradient-brand" : "bg-white/10"}`}
                    aria-pressed={on}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </Card>
        </section>
      ))}
      <Card className="divide-y divide-white/5 p-0">
        <button className="flex w-full items-center justify-between p-4 text-left text-sm">
          <span>Download my data</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
        <button className="flex w-full items-center justify-between p-4 text-left text-sm text-rose-400">
          <span>Delete account</span>
          <ChevronRight size={16} className="text-rose-400/60" />
        </button>
      </Card>
    </div>
  );
}

// ================= Help & Support =================
function HelpSupportView() {
  const faqs = [
    { q: "How does coach approval work?", a: "AI drafts your plan based on HRV, sleep and load. Your coach reviews, tweaks and approves before you train." },
    { q: "Can I sync with Garmin & Strava?", a: "Yes. Go to Settings → Connect Apps and authorize each provider. Activities sync both ways." },
    { q: "How is Readiness calculated?", a: "A blend of HRV, resting HR, sleep quality, prior load and subjective feel — scored 0–100." },
    { q: "Cancel my Pro subscription?", a: "Settings → Subscription → Cancel. You keep Pro until the end of the billing period." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="text-sm font-bold">Need a human?</div>
        <p className="mt-1 text-xs text-muted-foreground">Our team replies in under 24 hours (Mon–Fri, WIB).</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-brand py-2.5 text-xs font-semibold text-white shadow-brand">
            <Mail size={14} /> Email us
          </button>
          <button className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 py-2.5 text-xs font-semibold">
            <MessageSquare size={14} /> Live chat
          </button>
        </div>
      </Card>

      <section>
        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Frequently Asked</h4>
        <Card className="divide-y divide-white/5 p-0">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left">
                <span className="text-sm font-semibold">{f.q}</span>
                <ChevronRight size={16} className={`text-muted-foreground transition-transform ${open === i ? "rotate-90" : ""}`} />
              </button>
              {open === i && <div className="px-4 pb-4 text-xs text-muted-foreground">{f.a}</div>}
            </div>
          ))}
        </Card>
      </section>

      <Card className="p-4 text-xs text-muted-foreground">
        App version <span className="font-semibold text-foreground">1.0.0</span> · Build 2025.05
      </Card>
    </div>
  );
}
