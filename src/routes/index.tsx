import { createFileRoute } from "@tanstack/react-router";
import logoRuniq from "../assets/logo-runiq.png";
import { useState, useEffect, useRef } from "react";
import {
  Activity, Settings, LayoutGrid, Calendar, MessageCircle, User,
  Heart, Moon, Dumbbell, TrendingUp, ChevronRight, Link as LinkIcon,
  Shield, Bell, HelpCircle, FileText, LogOut, X, Pencil,
  MessageSquare, ArrowLeft, Play, Search, Users, UserPlus, Check,
  Sparkles, Zap, MapPin, Camera, Star, Lock, Eye, ArrowRight,
  Footprints, Award, Send, Mail, AlertTriangle, Smartphone, Watch,
  Apple, Utensils, ChevronLeft, RefreshCw, Mic, Paperclip, Pin, Crown,
  Wallet, CreditCard, Plus, Trash2,
} from "lucide-react";
import { fetchProfile, upsertProfile, setLocalProfile, listWallets, addWallet, removeWallet, type ProfileRow, type WalletRow } from "@/lib/profile";
import { useProfile } from "@/hooks/use-profile";
import { useAthleteData, fmtDuration, paceOf, logActivity, startOfWeek, type ActivityRow, type SessionRow } from "@/lib/athlete";
import { supabase } from "@/integrations/supabase/client";
import disclaimerMd from "@/content/legal/disclaimer.md?raw";
import privacyMd from "@/content/legal/privacy.md?raw";
import tosMd from "@/content/legal/tos.md?raw";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RUNIQ — AI-Powered Telefitness for Runners" },
      { name: "description", content: "Indonesia's first Telefitness marketplace: AI training plans monitored by certified coaches." },
      { property: "og:title", content: "RUNIQ — AI-Powered Telefitness for Runners" },
      { property: "og:description", content: "Indonesia's first Telefitness marketplace: AI training plans monitored by certified coaches." },
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
  | { kind: "trend-28d" }
  | { kind: "edit-profile" }
  | { kind: "onboarding-adjust" }
  | { kind: "wallet" };



function Index() {
  const [authed, setAuthed] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coachTab, setCoachTab] = useState<"week" | "program">("week");
  const [bookOpen, setBookOpen] = useState(false);
  const [activityTab, setActivityTab] = useState<"week" | "record">("week");
  const [detail, setDetail] = useState<Detail | null>(null);
  const openDetail = (d: Detail) => { setDetail(d); document.querySelector("main")?.scrollTo(0, 0); };
  const changeScreen = (s: Screen) => { setScreen(s); document.querySelector("main")?.scrollTo(0, 0); };

  // Auto-login if Supabase session exists (client-only) + route coaches to their console
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const { data } = await (supabase as any)
        .from("profiles").select("role").eq("user_id", session.user.id).maybeSingle();
      if (data?.role === "coach") { window.location.href = "/coach"; return; }
      setAuthed(true);
    }).catch(() => {});
  }, []);

  async function afterLogin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await (supabase as any)
        .from("profiles").select("role, onboarded").eq("user_id", user.id).maybeSingle();
      if (!data?.onboarded) { window.location.href = "/onboarding"; return; }
      if (data?.role === "coach") { window.location.href = "/coach"; return; }
    }
    setAuthed(true);
  }

  return (
    <div className="min-h-screen w-full bg-[#0A1628] text-foreground">
      <div className="mx-auto flex max-w-[420px] flex-col">
        <div className="relative flex min-h-screen flex-col bg-[#0D1E35]">
          {!authed ? (
            authMode === "login" ? (
              <LoginScreen onLogin={afterLogin} onSignup={() => setAuthMode("signup")} onForgot={() => setAuthMode("forgot")} />
            ) : authMode === "signup" ? (
              <SignupScreen onSignup={() => { if (typeof window !== "undefined") { localStorage.removeItem("runiq_onboarded"); localStorage.removeItem("runiq.onboarding.done"); window.location.href = "/onboarding"; } }} onBack={() => setAuthMode("login")} />
            ) : (
              <ForgotPasswordScreen onBack={() => setAuthMode("login")} />
            )
          ) : (
            <>
              <TopBar
                onNotifications={() => openDetail({ kind: "notifications" })}
                onAvatar={() => changeScreen("profile")}
                onSettings={() => setSettingsOpen(true)}
              />
              <main className="flex-1 overflow-y-auto pb-28 pt-[70px]">
                {screen === "dashboard" && <DashboardScreen openDetail={openDetail} setScreen={setScreen} />}
                {screen === "plan" && (
                  <PlanScreen tab={coachTab} setTab={setCoachTab} openDetail={openDetail} />
                )}
                {screen === "activity" && <ActivityScreen tab={activityTab} setTab={setActivityTab} openDetail={openDetail} />}
                {screen === "messages" && <MessagesScreen openDetail={openDetail} />}
                {screen === "profile" && <ProfileScreen onSettings={() => setSettingsOpen(true)} openDetail={openDetail} />}
              </main>
              <TabBar screen={screen} setScreen={changeScreen} />
              {settingsOpen && (
                <SettingsSheet onClose={() => setSettingsOpen(false)} onLogout={async () => { setSettingsOpen(false); await supabase.auth.signOut(); setAuthed(false); }} openDetail={openDetail} />
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
  const { initials } = useProfile();
  return (
    <header className="fixed top-0 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 flex items-center justify-between border-b border-white/5 bg-[#0D1E35] px-5 py-4">
      <div className="flex items-center gap-3">
        <img src={logoRuniq} alt="RUNIQ" className="h-10 w-10 rounded-xl object-cover" />
        <h1 className="text-2xl font-black tracking-wider" style={{color:"#00D4C8"}}>RUNIQ</h1>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNotifications} className="relative rounded-full p-2 text-muted-foreground hover:text-foreground" aria-label="Notifications">
          <Bell size={22} />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white">{unread}</span>
          )}
        </button>
        <button onClick={onAvatar} className="rounded-full" aria-label="Profile">
          <AvatarC initials={initials} color="from-[#00D4C8] to-[#00D4C8]" />
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
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 border-t border-white/5 bg-[#0D1E35]/95 backdrop-blur">
      <div className="flex items-center justify-around px-2 py-3">
        {items.map((it) => {
          const active = screen === it.id;
          const Icon = it.icon;
          return (
            <button key={it.id} onClick={() => setScreen(it.id)} className="relative flex flex-col items-center gap-1 px-4 py-1">
              <Icon size={22} className={active ? "text-[#00D4C8]" : "text-muted-foreground"} />
              {active && <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#00D4C8]" />}
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) { setError("Enter your email and password."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) { setError(err.message || "Invalid email or password."); return; }
    onLogin();
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pt-20">
      <div className="flex flex-col items-center">
        <Logo size={88} />
        <h1 className="mt-6 text-4xl font-black tracking-wider text-gradient-brand">RUNIQ</h1>
        <p className="mt-2 text-muted-foreground">AI-Powered Training Platform</p>
      </div>
      <form onSubmit={handleLogin} className="mt-12 space-y-5">
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Mail size={18} className="text-muted-foreground" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            <button type="button" onClick={onForgot} className="text-sm text-[#00D4C8]">Forgot password?</button>
          </div>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <Lock size={18} className="text-muted-foreground" />
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-transparent text-sm outline-none" />
            <button type="button" onClick={() => setShowPw((v) => !v)}><Eye size={18} className="text-muted-foreground" /></button>
          </div>
        </div>
        {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-4 font-semibold text-white shadow-brand disabled:opacity-50">
          {loading ? "Signing in…" : <>Log In <ArrowRight size={18} /></>}
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
          <Activity size={16} className="text-[#00D4C8]" /> Garmin
        </button>
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <button type="button" onClick={onSignup} className="font-semibold text-[#00D4C8]">Sign up</button>
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
          <button onClick={onBack} className="text-sm font-semibold text-[#00D4C8]">
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canSubmit = name && gender && dob && email && password && role && agreed;

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
        data: { full_name: name.trim(), role, gender, dob },
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setLocalProfile({ full_name: name.trim(), email: email.trim(), role, gender, dob } as any);
    onSignup();
  }


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
        onSubmit={handleSignup}
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
                    ? "border-[#00D4C8] bg-[#00D4C8]/15 text-white"
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
              agreed ? "border-[#00D4C8] bg-[#00D4C8]" : "border-white/30 bg-transparent"
            }`}
          >
            {agreed && <Check size={14} className="text-white" />}
          </span>
          <span className="text-xs leading-relaxed text-muted-foreground">
            I agree to the{" "}
            <span className="font-semibold text-[#00D4C8]">Terms of Service</span>,{" "}
            <span className="font-semibold text-[#00D4C8]">Privacy Policy</span>, and{" "}
            <span className="font-semibold text-[#00D4C8]">Medical & Fitness Disclaimer</span>, and
            consent to RUNIQ processing my health and training data.
          </span>

        </button>

        {error && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-4 font-semibold text-white shadow-brand disabled:opacity-40"
        >
          {loading ? "Creating…" : <>Create Account <ArrowRight size={18} /></>}
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
          <Activity size={16} className="text-[#00D4C8]" /> Garmin
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button type="button" onClick={onBack} className="font-semibold text-[#00D4C8]">Log in</button>
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
          ? "border-[#00D4C8] bg-[#00D4C8]/15 text-white"
          : "border-white/10 bg-white/5 text-muted-foreground"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          active ? "bg-[#00D4C8] text-white" : "bg-white/5 text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function EmptyState({ title, sub, action, onAction }: { title: string; sub: string; action?: string; onAction?: () => void }) {
  return (
    <Card className="p-5 text-center">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      {action && onAction && (
        <button onClick={onAction} className="mt-3 rounded-xl bg-gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-brand">{action}</button>
      )}
    </Card>
  );
}

function DashboardScreen({ openDetail, setScreen }: { openDetail: (d: Detail) => void; setScreen: (s: Screen) => void }) {
  const { displayName } = useProfile();
  const { metrics, sessions, activities, loading } = useAthleteData();

  const latest = metrics[0];
  const prev = metrics[1];
  const readiness = latest?.readiness_score ?? null;
  const readinessColor = readiness == null ? "#6B7099" : readiness >= 80 ? "#10b981" : readiness >= 60 ? "#eab308" : "#ef4444";
  const readinessLabel = readiness == null ? "No readiness data yet" : readiness >= 80 ? "Ready to Train Hard 💪" : readiness >= 60 ? "Moderate Training" : "Recovery Focus 🛌";
  const delta = readiness != null && prev?.readiness_score != null ? readiness - prev.readiness_score : null;

  const trend = metrics.slice(0, 7).reverse();
  const todayIso = new Date().toISOString().slice(0, 10);
  const todaySession = sessions.find((s) => s.session_date === todayIso) ?? null;

  return (
    <div className="space-y-6 px-5 pt-6">
      <section>
        <button onClick={() => openDetail({ kind: "readiness-breakdown" })} className="w-full text-left">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">Hi, {displayName}</h2>
              <p className="mt-1 text-sm" style={{ color: readinessColor }}>{readinessLabel}</p>
              {delta != null && (
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp size={12} className={delta >= 0 ? "text-[#EEFF41]" : "rotate-180 text-rose-400"} />
                  {delta >= 0 ? "+" : ""}{delta} vs yesterday
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-6xl font-black" style={{ color: readinessColor }}>{readiness ?? "—"}</div>
              <div className="text-xs text-muted-foreground">/ 100 · readiness</div>
            </div>
          </div>
        </button>
      </section>

      {/* Health Metrics — only when synced data exists */}
      {latest ? (
        <section className="grid grid-cols-3 gap-3">
          <MetricCard icon={<Heart size={12} />} label="HRV" value={latest.hrv_ms ?? "—"} unit="ms" bar="linear-gradient(90deg,#ef4444,#f97316)" />
          <MetricCard icon={<Moon size={12} />} label="Sleep" value={latest.sleep_hours ?? "—"} unit={latest.sleep_quality ? `h · ${latest.sleep_quality}%` : "h"} bar="linear-gradient(90deg,#6366f1,#00D4C8)" />
          <MetricCard icon={<Dumbbell size={12} />} label="Load" value={latest.training_load ?? "—"} unit="load" bar="linear-gradient(90deg,#10b981,#00D4C8)" />
        </section>
      ) : !loading ? (
        <EmptyState
          title="No health data yet"
          sub="Connect Garmin, Strava, Apple Health or Whoop to sync HRV, sleep and training load."
          action="Connect apps"
          onAction={() => openDetail({ kind: "connect-apps" })}
        />
      ) : null}

      {/* Nutrition — requires MyFitnessPal connection */}
      {!isConnected("myfitnesspal") && (
        <button onClick={() => openDetail({ kind: "connect-apps" })} className="w-full rounded-2xl border border-white/5 bg-card/80 p-4 text-left">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Utensils size={12} /> Nutrition</span>
            <span className="text-[#00D4C8]">Connect MyFitnessPal →</span>
          </div>
        </button>
      )}

      {/* Today's Session */}
      {todaySession ? (
        <Card className="p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Today's Session · {new Date(todaySession.session_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
          </div>
          <div className="mt-2 flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">{todaySession.session_type}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {todaySession.distance_km ? `${todaySession.distance_km} km` : `${todaySession.duration_min ?? 0} min`}{todaySession.zone ? ` · ${todaySession.zone}` : ""}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${todaySession.completed ? "bg-[#EEFF41]/15 text-[#EEFF41]" : "bg-amber-500/15 text-amber-300"}`}>
              {todaySession.completed ? "● Completed" : "● Not Started"}
            </span>
          </div>
          {todaySession.description && (
            <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm">{todaySession.description}</div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => setScreen("activity")} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 text-sm font-semibold text-white shadow-brand">
              <Play size={16} /> Start Run
            </button>
            <button
              onClick={() => openDetail({ kind: "workout", day: new Date(todaySession.session_date).toLocaleDateString("en-GB", { weekday: "long" }), date: todaySession.session_date, type: todaySession.session_type, miles: todaySession.distance_km ? `${todaySession.distance_km} km` : "—", pace: todaySession.description ?? "—" })}
              className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold hover:bg-white/10"
            >
              View Details
            </button>
          </div>
        </Card>
      ) : !loading ? (
        <EmptyState
          title="No session scheduled today"
          sub="Your plan appears here once your coach approves an AI-generated week."
          action="Go to Plan"
          onAction={() => setScreen("plan")}
        />
      ) : null}

      {/* Readiness Trend */}
      {trend.length > 1 && (
        <Card className="p-5">
          <button onClick={() => openDetail({ kind: "trend-28d" })} className="w-full text-left">
            <h3 className="font-bold">Readiness Trend</h3>
            <div className="mt-4 flex h-24 items-end justify-between gap-2">
              {trend.map((m, i) => (
                <div key={m.id} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t" style={{ height: `${((m.readiness_score ?? 0) / 100) * 100}%`, background: i === trend.length - 1 ? "#22d3ee" : "rgba(0,212,200,0.5)" }} />
                  <span className="text-[10px] text-muted-foreground">{new Date(m.metric_date).toLocaleDateString("en-GB", { weekday: "narrow" })}</span>
                </div>
              ))}
            </div>
          </button>
        </Card>
      )}

      {/* Recent activity */}
      {activities.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Recent Runs</h3>
          <div className="space-y-2">
            {activities.slice(0, 3).map((a) => (
              <button
                key={a.id}
                onClick={() => openDetail({ kind: "run", title: a.title, date: new Date(a.started_at).toLocaleString(), stats: [`${a.distance_km} km`, fmtDuration(a.duration_sec), a.avg_pace ?? "—", a.avg_hr ? `${a.avg_hr} bpm` : "—"] })}
                className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-card/80 p-3 text-left"
              >
                <div>
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.started_at).toLocaleDateString()} · {a.source}</div>
                </div>
                <div className="text-sm font-bold">{a.distance_km} km</div>
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
          <stop offset="0%" stopColor="#00D4C8" /><stop offset="100%" stopColor="#00D4C8" />
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

function AiCoachNotesCard() {
  const { displayName } = useProfile();
  const [note, setNote] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [streaming, setStreaming] = useState(false);

  async function generate() {
    setLoading(true);
    setNote("");
    setGenerated(false);
    setStreaming(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{
            role: "user",
            content: `Kamu adalah RUNIQ, AI coach lari untuk runner Indonesia. Tulis catatan coaching mingguan yang hangat dan personal dalam Bahasa Indonesia (2 paragraf pendek, maks 80 kata total) untuk runner ${displayName}. Goal: Sub-4hr Marathon Oktober 2026. Data: HRV 68ms (baseline 72ms, sedikit di bawah), Tidur 7.2jam (kualitas 78%), Training Load 45 (ACWR 1.1), Minggu ke-8 dari 24 base building. Minggu ini: Easy 8km Sen ✓, Intervals 10km Sel ✓, Recovery 6km Rab ✓. Ke depan: Tempo 12km Kam, Long Run 22km Sab. Spesifik, hangat, sebut penurunan HRV. Gunakan "kamu". Seperti coach sungguhan, bukan robot.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text ?? "Catatan coaching tidak tersedia saat ini.";
      let i = 0;
      const interval = setInterval(() => {
        i += 4;
        setNote(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setStreaming(false);
          setGenerated(true);
        }
      }, 16);
    } catch {
      setNote("Tidak dapat terhubung ke AI Coach. Coba lagi nanti.");
      setStreaming(false);
      setGenerated(true);
    }
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-[#00D4C8]/30 bg-[#00D4C8]/10 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#00D4C8]">
          <Sparkles size={16} />
          <span className="text-sm font-bold">AI Coach Notes</span>
        </div>
        {generated && (
          <button onClick={generate} className="flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs text-muted-foreground">
            <RefreshCw size={10} /> Refresh
          </button>
        )}
      </div>
      {!generated && !loading && (
        <button onClick={generate} className="w-full rounded-xl bg-gradient-to-r from-[#00D4C8] to-[#00BFA5] py-3 text-sm font-bold text-white">
          ✦ Generate Catatan Coach Minggu Ini
        </button>
      )}
      {loading && !note && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#00D4C8] border-t-transparent" />
          Menganalisis data latihanmu...
        </div>
      )}
      {note && (
        <div className="text-sm text-muted-foreground leading-relaxed">
          {note}{streaming && <span className="animate-pulse opacity-50">▋</span>}
        </div>
      )}
      {generated && (
        <div className="text-xs text-muted-foreground/50">
          Digenerate {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long" })} · RUNIQ AI
        </div>
      )}
    </div>
  );
}

function ThisWeekView({ openDetail }: { openDetail: (d: Detail) => void }) {
  const { sessions, activities, loading } = useAthleteData();

  const total = sessions.length;
  const completed = sessions.filter((s) => s.completed).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const kmTarget = sessions.reduce((n, s) => n + (Number(s.distance_km) || 0), 0);
  const weekStart = startOfWeek();
  const kmDone = activities
    .filter((a) => new Date(a.started_at) >= weekStart)
    .reduce((n, a) => n + (Number(a.distance_km) || 0), 0);

  return (
    <>
      <AiCoachNotesCard />

      {total > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Weekly Progress</span>
            <span className="font-bold">{completed}/{total} sessions</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#10b981,#00D4C8)" }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Volume</span>
            <span className="font-semibold">{kmDone.toFixed(1)} km <span className="text-muted-foreground">of {kmTarget.toFixed(0)} km target</span></span>
          </div>
        </Card>
      )}

      {/* Session Cards */}
      <div className="space-y-3">
        {sessions.map((s) => {
          const color = SESSION_COLORS[s.session_type] ?? "#3B82F6";
          const d = new Date(s.session_date);
          return (
            <button key={s.id} onClick={() => openDetail({ kind: "workout", day: d.toLocaleDateString("en-GB", { weekday: "long" }), date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), type: s.session_type, miles: s.distance_km ? `${s.distance_km} km` : `${s.duration_min ?? 0} min`, pace: s.description ?? "—" })} className={`flex w-full items-stretch overflow-hidden rounded-2xl border text-left ${s.completed ? "border-[#EEFF41]/30 bg-[#EEFF41]/5" : "border-white/5 bg-card/80"}`}>
              <div className="w-1.5 shrink-0" style={{ background: color }} />
              <div className="flex flex-1 items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="font-bold">{d.toLocaleDateString("en-GB", { weekday: "long" })}</span><span className="text-xs text-muted-foreground">{d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 text-sm">
                    <span className="font-semibold" style={{ color }}>{s.session_type}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>{s.distance_km ? `${s.distance_km} km` : `${s.duration_min ?? 0} min`}</span>
                    {s.zone && <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">{s.zone}</span>}
                  </div>
                  {s.description && <p className="mt-1 text-xs text-muted-foreground truncate">{s.description}</p>}
                </div>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.completed ? "bg-[#EEFF41]" : "border border-white/15"}`}>
                  {s.completed && <Check size={16} className="text-white" />}
                </div>
              </div>
            </button>
          );
        })}
        {!loading && total === 0 && (
          <EmptyState
            title="No sessions this week"
            sub="Once your coach approves an AI-generated plan, your weekly sessions show up here."
            action="Message your coach"
            onAction={() => openDetail({ kind: "find-coach" })}
          />
        )}
      </div>
    </>
  );
}

function ProgramView() {
  const { profile } = useProfile();
  const { activities, loading } = useAthleteData();

  const totalKm = activities.reduce((n, a) => n + (Number(a.distance_km) || 0), 0);
  const totalSec = activities.reduce((n, a) => n + (a.duration_sec || 0), 0);
  const longest = activities.reduce((n, a) => Math.max(n, Number(a.distance_km) || 0), 0);

  if (!profile.goal && !profile.race_distance) {
    return (
      <EmptyState
        title="No program yet"
        sub="Set your goal and race distance in your running profile to start a program."
      />
    );
  }

  return (
    <>
      <Card className="p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#00D4C8]">Your Program</div>
        <h3 className="mt-1 text-xl font-bold">{profile.goal || "Running goal"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile.race_distance ? `${profile.race_distance}` : "Distance not set"}
          {profile.runs_per_week ? ` · ${profile.runs_per_week} runs/week` : ""}
          {profile.weekly_distance_km ? ` · ${profile.weekly_distance_km} km/week target` : ""}
        </p>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-bold mb-4">Program Stats (last 30 days)</div>
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading…</div>
        ) : activities.length === 0 ? (
          <div className="text-xs text-muted-foreground">No runs logged yet — record a run or sync a device.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Total KM" value={totalKm.toFixed(1)} />
            <StatBox label="Runs Logged" value={String(activities.length)} />
            <StatBox label="Avg Pace" value={paceOf(totalKm, totalSec)} />
            <StatBox label="Longest Run" value={`${longest.toFixed(1)} km`} />
          </div>
        )}
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
          <button key={f} onClick={() => setActive(f)} className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold ${active === f ? "border-transparent bg-[#00D4C8] text-white" : "border-white/10 text-muted-foreground"}`}>{f}</button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">4 coaches found</p>
      <CoachCard onBook={onBook} openDetail={openDetail} />
      <button onClick={() => openDetail({ kind: "coach", name: "Marcus Chen", specialty: "Speed & Track", initials: "MC", price: "Rp 500.000" })} className="w-full text-left">
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
                <div className="font-bold">Rp 500.000<span className="text-xs text-muted-foreground">/bulan</span></div>
                <span className="mt-1 inline-block rounded-full border border-orange-500/40 px-2 py-0.5 text-xs text-orange-400">Waitlist</span>
              </div>
            </div>
            <div className="mt-3"><span className="rounded-full border border-[#00D4C8]/40 px-2 py-0.5 text-xs text-[#00D4C8]">USATF L3</span></div>
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
      <button onClick={() => openDetail({ kind: "coach", name: "Sarah Mitchell", specialty: "Marathon Specialist", initials: "SM", price: "Rp 350.000" })} className="w-full text-left">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand font-bold text-white shadow-brand">SM</div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold">Sarah Mitchell</div>
              <div className="text-sm text-muted-foreground">Marathon Specialist</div>
            </div>
            <div className="text-right">
              <div className="font-bold">Rp 350.000<span className="text-xs text-muted-foreground">/bulan</span></div>
              <span className="mt-1 inline-block rounded-full border border-[#EEFF41]/40 px-2 py-0.5 text-xs text-[#EEFF41]">Available</span>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <span className="rounded-full border border-[#00D4C8]/40 px-2 py-0.5 text-xs text-[#00D4C8]">USATF L2</span>
            <span className="rounded-full border border-[#00D4C8]/40 px-2 py-0.5 text-xs text-[#00D4C8]">RRCA</span>
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
            <li key={f} className="flex items-start gap-3 text-sm"><Check size={18} className="mt-0.5 text-[#EEFF41]" /> {f}</li>
          ))}
        </ul>
        <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold">Rp 350.000<span className="text-sm font-normal text-muted-foreground">/bulan</span></div>
              <div className="text-xs text-muted-foreground">Cancel anytime · No setup fee</div>
            </div>
            <div className="text-right text-xs">
              <div className="text-muted-foreground">Responds in</div>
              <div className="font-bold">&lt; 1 hour</div>
            </div>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 text-[11px] text-muted-foreground">
            Harga sudah termasuk 20% platform fee RUNIQ
            <div className="mt-1 flex justify-between"><span>Coach rate</span><span>Rp 291.667</span></div>
            <div className="flex justify-between"><span>Platform fee (20%)</span><span>Rp 58.333</span></div>
            <div className="mt-1 flex justify-between font-semibold text-foreground"><span>Total</span><span>Rp 350.000</span></div>
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
  // FIX 5: No toggle. Always show WeekActivity with Record Run + Manual Input buttons.
  // RecordFlow opens only when user taps Record Run button (via goRecord prop).
  if (tab === "record") {
    return (
      <div className="space-y-5 px-5 pt-6">
        <RecordFlow goWeek={() => setTab("week")} />
      </div>
    );
  }
  return (
    <div className="space-y-5 px-5 pt-6">
      <WeekActivity openDetail={openDetail} goRecord={() => setTab("record")} />
    </div>
  );
}

type MatchStatus = "match" | "diff" | "extra";
const MATCH_STYLE: Record<MatchStatus, { label: string; cls: string }> = {
  match: { label: "✓ Matches Plan", cls: "border-[#EEFF41]/40 bg-[#EEFF41]/10 text-[#EEFF41]" },
  diff:  { label: "⚠ Differs from Plan", cls: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400" },
  extra: { label: "Extra Run", cls: "border-sky-500/40 bg-sky-500/10 text-sky-400" },
};

function WeekActivity({ openDetail, goRecord }: { openDetail: (d: Detail) => void; goRecord: () => void }) {
  const [manualOpen, setManualOpen] = useState(false);
  const { activities, sessions, loading, reload } = useAthleteData();

  const weekStart = startOfWeek();
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const week = activities.filter((a) => {
    const d = new Date(a.started_at);
    return d >= weekStart && d < weekEnd;
  });
  const km = week.reduce((n, a) => n + (Number(a.distance_km) || 0), 0);
  const sec = week.reduce((n, a) => n + (a.duration_sec || 0), 0);
  const hrVals = week.map((a) => a.avg_hr).filter((h): h is number => !!h);
  const avgHr = hrVals.length ? Math.round(hrVals.reduce((n, h) => n + h, 0) / hrVals.length) : null;
  const target = sessions.reduce((n, s) => n + (Number(s.distance_km) || 0), 0);

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
          <span className="text-xs text-muted-foreground">
            {weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(weekEnd.getTime() - 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="text-xs font-semibold text-[#00D4C8]">{week.length} {week.length === 1 ? "activity" : "activities"}</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          <Stat label="Distance" value={`${km.toFixed(1)} km`} />
          <Stat label="Time" value={sec ? fmtDuration(sec) : "—"} />
          <Stat label="Avg Pace" value={paceOf(km, sec)} />
          <Stat label="Avg HR" value={avgHr ? `${avgHr} bpm` : "—"} />
        </div>
        {target > 0 && (
          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">vs weekly plan target</span>
              <span className="font-semibold text-[#EEFF41]">{km.toFixed(1)} / {target.toFixed(0)} km</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(100, (km / target) * 100)}%` }} />
            </div>
          </div>
        )}
      </Card>

      {/* Activity Cards */}
      {activities.map((a) => (
        <button
          key={a.id}
          onClick={() => openDetail({ kind: "run", title: a.title, date: new Date(a.started_at).toLocaleString(), stats: [`${a.distance_km} km`, fmtDuration(a.duration_sec), a.avg_pace ?? paceOf(Number(a.distance_km), a.duration_sec), a.avg_hr ? `${a.avg_hr} bpm` : "—"] })}
          className="block w-full text-left"
        >
          <ActivityCard
            title={a.title}
            date={new Date(a.started_at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            source={a.source}
            feel={a.feel ?? ""}
            stats={[`${a.distance_km} km`, fmtDuration(a.duration_sec), a.avg_pace ?? paceOf(Number(a.distance_km), a.duration_sec), a.avg_hr ? `${a.avg_hr} bpm` : "—"]}
            match={"extra" as MatchStatus}
            color="#00D4C8"
          />
        </button>
      ))}

      {!loading && activities.length === 0 && (
        <EmptyState title="No runs logged yet" sub="Record a run, add it manually, or connect Strava/Garmin to sync automatically." action="Record a run" onAction={goRecord} />
      )}

      {manualOpen && <ManualInputSheet onClose={() => { setManualOpen(false); reload(); }} />}
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


// ── LIVE MAP (Geolocation + Canvas) ──────────────────────────────
function LiveMap({ active, full = false, onToggleFull }: { active: boolean; full?: boolean; onToggleFull?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptsRef = useRef<{lat: number; lng: number}[]>([]);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || typeof navigator === "undefined") return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        ptsRef.current.push({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        drawMap();
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 2000 }
    );
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, [active]);

  function drawMap() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pts = ptsRef.current;
    if (pts.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const lats = pts.map(p => p.lat), lngs = pts.map(p => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const pad = 20;
    const scaleX = (W - pad*2) / (maxLng - minLng || 0.001);
    const scaleY = (H - pad*2) / (maxLat - minLat || 0.001);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#0a0f24";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#00D4C8";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = pad + (p.lng - minLng) * scaleX;
      const y = H - pad - (p.lat - minLat) * scaleY;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Current position dot
    const last = pts[pts.length - 1];
    const cx = pad + (last.lng - minLng) * scaleX;
    const cy = H - pad - (last.lat - minLat) * scaleY;
    ctx.fillStyle = "#F0FF4B";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!active) return (
    <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
      <div className="text-center text-xs text-muted-foreground">
        <MapPin size={20} className="mx-auto mb-2 opacity-40" />
        Map appears once recording starts
      </div>
    </div>
  );

  return (
    <div className={full ? "relative h-full w-full overflow-hidden" : "relative overflow-hidden rounded-2xl border border-[#00D4C8]/30"}>
      <canvas ref={canvasRef} width={380} height={full ? 620 : 160} className={full ? "h-full w-full object-cover" : "w-full"} />
      {onToggleFull && (
        <button
          onClick={onToggleFull}
          className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"
          aria-label={full ? "Exit fullscreen map" : "Fullscreen map"}
        >
          {full ? "Exit map" : "⤢ Fullscreen"}
        </button>
      )}
      {ptsRef.current.length < 2 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0D1E35]">
          <div className="text-center text-xs text-muted-foreground">
            <div className="mb-1 animate-pulse text-[#00D4C8]">● Detecting location...</div>
          </div>
        </div>
      )}
    </div>
  );
}


function RecordFlow({ goWeek }: { goWeek: () => void }) {
  const [phase, setPhase] = useState<RecPhase>("pre");
  const [signal, setSignal] = useState<SignalState>("ready");
  const [linkPlan, setLinkPlan] = useState(true);
  const [locked, setLocked] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [mapFull, setMapFull] = useState(false);


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
  if (phase === "post") return (
    <PostRunSummary
      duration={fmt(seconds)}
      distance={km}
      onDiscard={() => { setPhase("pre"); setSeconds(0); }}
      onSave={async () => {
        await logActivity({
          title: "Recorded Run",
          source: "RUNIQ Record",
          started_at: new Date(Date.now() - seconds * 1000).toISOString(),
          distance_km: Number(km),
          duration_sec: seconds,
        });
        goWeek();
      }}
    />
  );
  if (phase === "active") {
    if (mapFull) {
      return (
        <div className="fixed inset-0 z-[60] mx-auto flex max-w-[420px] flex-col bg-[#0A1628]">
          <div className="relative flex-1">
            <LiveMap active={true} full onToggleFull={() => setMapFull(false)} />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 pb-8 pt-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs font-bold tracking-widest text-red-400">RECORDING</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-black/85 to-transparent px-4 pb-5 pt-12">
              <div className="grid grid-cols-3 text-center">
                <div><div className="text-2xl font-black tabular-nums text-[#EEFF41]">{fmt(seconds)}</div><div className="text-[9px] tracking-widest text-white/60">DURATION</div></div>
                <div><div className="text-2xl font-black tabular-nums">{km}</div><div className="text-[9px] tracking-widest text-white/60">KM</div></div>
                <div><div className="text-2xl font-black tabular-nums">5:12</div><div className="text-[9px] tracking-widest text-white/60">PACE</div></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPaused((p) => !p)} className="rounded-2xl border border-white/20 bg-white/10 py-3.5 text-sm font-bold backdrop-blur">{paused ? "▶ Resume" : "⏸ Pause"}</button>
                <button onClick={() => { setMapFull(false); setPhase("post"); }} className="rounded-2xl bg-red-500 py-3.5 text-sm font-bold text-white">⏹ Stop</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
            <span className="text-xs font-bold tracking-widest text-red-400">RECORDING</span>
          </div>
          <SignalIndicator state={signal} />
        </div>
        <LiveMap active={true} onToggleFull={() => setMapFull(true)} />
        <div className="flex flex-col items-center py-4" style={{ filter: "drop-shadow(0 0 30px rgba(16,185,129,0.6))" }}>
          <div className="text-6xl font-black text-[#EEFF41] tabular-nums">{fmt(seconds)}</div>
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
      <LiveMap active={false} />
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
          <input type="checkbox" checked={linkPlan} onChange={(e) => setLinkPlan(e.target.checked)} className="h-5 w-5 accent-[#00D4C8]" />
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
        <div className="text-xs tracking-widest text-[#EEFF41]">RUN COMPLETE</div>
        <div className="mt-1 text-3xl font-black">{distance} km · {duration}</div>
      </div>
      <Card className="overflow-hidden">
        <div className="h-40 bg-black/30">
          <svg viewBox="0 0 300 140" className="h-full w-full">
            <rect width="300" height="140" fill="rgba(255,255,255,0.02)" />
            <path d="M 40 110 Q 90 40, 150 70 T 260 100" fill="none" stroke="#00D4C8" strokeWidth="3" />
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
            { z: "Z1", pct: 8, color: "#00D4C8" },
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
          <button onClick={() => setMatchPlan("yes")} className={`rounded-xl border py-3 text-sm font-semibold ${matchPlan === "yes" ? "border-[#EEFF41]/60 bg-[#EEFF41]/10 text-[#EEFF41]" : "border-white/10 bg-white/5"}`}>✓ Yes, mark done</button>
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
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#0D1E35] p-5 pb-8">
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
  const [when, setWhen] = useState("");
  const [dist, setDist] = useState("");
  const [dur, setDur] = useState("");
  const [hr, setHr] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const types = ["Easy","Tempo","Long Run","Intervals","Strength","Other"];

  async function save() {
    setError("");
    const km = parseFloat(dist);
    const parts = dur.split(":").map((p) => parseInt(p, 10) || 0);
    const sec = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
    if (!km || !sec) { setError("Enter distance and duration (HH:MM:SS)."); return; }
    setSaving(true);
    const res = await logActivity({
      title: type,
      source: "Manual",
      started_at: when ? new Date(when).toISOString() : new Date().toISOString(),
      distance_km: km,
      duration_sec: sec,
      avg_hr: hr ? parseInt(hr, 10) : null,
      feel: FEELS[feel],
      notes: notes || null,
    });
    setSaving(false);
    if (!res.ok) { setError(res.error || "Could not save. Please sign in again."); return; }
    onSave();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-muted-foreground"><ArrowLeft size={20} /></button>
        <span className="text-sm font-bold tracking-widest">MANUAL INPUT</span>
        <span className="w-5" />
      </div>
      <FormField label="Date & Start Time">
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" />
      </FormField>
      <FormField label="Activity Type">
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button key={t} onClick={() => setType(t)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${type === t ? "border-[#00D4C8] bg-[#00D4C8]/15 text-[#00D4C8]" : "border-white/10 bg-white/5 text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Distance (km)"><input value={dist} onChange={(e) => setDist(e.target.value)} type="number" step="0.01" placeholder="0.00" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" /></FormField>
        <FormField label="Duration (HH:MM:SS)"><input value={dur} onChange={(e) => setDur(e.target.value)} type="text" placeholder="00:00:00" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" /></FormField>
      </div>
      <FormField label="Avg HR (optional)"><input value={hr} onChange={(e) => setHr(e.target.value)} type="number" placeholder="bpm" className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" /></FormField>
      <FormField label="Feel">
        <div className="flex justify-between">
          {FEELS.map((f, i) => (
            <button key={i} onClick={() => setFeel(i)} className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${feel === i ? "bg-gradient-brand shadow-brand" : "bg-white/5"}`}>{f}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional notes" className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" /></FormField>
      <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
        <span className="text-xs">Match with today's planned session</span>
        <input type="checkbox" checked={linkPlan} onChange={(e) => setLinkPlan(e.target.checked)} className="h-5 w-5 accent-[#00D4C8]" />
      </label>
      {error && <p className="text-xs text-[#FF6B4A]">{error}</p>}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button onClick={onCancel} className="rounded-2xl border border-white/10 py-3.5 text-sm font-semibold text-muted-foreground">Cancel</button>
        <button disabled={saving} onClick={save} className="rounded-2xl bg-gradient-brand py-3.5 text-sm font-bold text-white shadow-brand disabled:opacity-60">{saving ? "Saving…" : "Save Activity"}</button>
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
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#00D4C8]">Your Coach</h4>
          <span className="rounded-full bg-[#00D4C8]/15 px-2 py-0.5 text-[9px] font-semibold text-[#00D4C8]">Pinned</span>
        </div>
        {showCoach ? (
          <button
            onClick={() => openDetail({ kind: "chat", name: coach.name, initials: coach.initials, color: coach.color, isCoach: true })}
            className="flex w-full items-center gap-3 rounded-2xl border border-[#00D4C8]/25 bg-gradient-to-r from-[#00D4C8]/10 to-purple-500/10 p-3 text-left"
          >
            <div className="relative">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${coach.color} text-sm font-bold text-white`}>{coach.initials}</div>
              {coach.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0a0f24] bg-[#EEFF41]" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="truncate font-bold">{coach.name}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[#00D4C8]">Your Coach</div>
                </div>
                <div className="text-xs font-semibold text-[#00D4C8]">{coach.time}</div>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="truncate text-sm text-muted-foreground">{coach.preview}</div>
                <span className="rounded-full bg-[#00D4C8] px-2 py-0.5 text-xs font-bold text-white">{coach.unread}</span>
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
                  {(c as any).online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0a0f24] bg-[#EEFF41]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.time}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm text-muted-foreground">{c.preview}</div>
                    {(c as any).unread && <span className="rounded-full bg-[#00D4C8] px-2 py-0.5 text-xs font-bold text-white">{(c as any).unread}</span>}
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
                      <span className="rounded-full bg-[#00D4C8] px-2 py-0.5 text-xs font-bold text-white">{c.unread}</span>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00D4C8]/15 text-[#00D4C8]"><UserPlus size={18} /></div>
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

function OnboardingAdjustView() {
  const [goal, setGoal] = useState("Train for a race");
  const [pace, setPace] = useState("5:30");
  const [kmPerWeek, setKmPerWeek] = useState(30);
  const [targetRace, setTargetRace] = useState("");
  const [saved, setSaved] = useState(false);

  const goals = ["First 5K","First 10K","First Half Marathon","First Marathon","Improve My Time","Fitness Umum"];

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Running Goal</div>
        <div className="space-y-2">
          {goals.map(g => (
            <button key={g} onClick={() => setGoal(g)}
              className={`w-full rounded-xl border p-3 text-left text-sm transition-all ${goal === g ? "border-[#00D4C8]/60 bg-[#00D4C8]/15 font-semibold" : "border-white/10 bg-white/5"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Race Date</div>
        <input type="date" value={targetRace} onChange={e => setTargetRace(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" />
      </div>
      <div>
        <div className="mb-3 flex justify-between text-sm">
          <span>KM per minggu</span>
          <span className="font-bold text-[#00D4C8]">{kmPerWeek} km</span>
        </div>
        <input type="range" min={5} max={120} step={5} value={kmPerWeek} onChange={e => setKmPerWeek(Number(e.target.value))}
          className="w-full accent-[#00D4C8]" />
      </div>
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Pace (min/km)</div>
        <input value={pace} onChange={e => setPace(e.target.value)} placeholder="e.g. 5:30"
          className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none" />
      </div>
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className={`w-full rounded-2xl py-4 font-bold transition-all ${saved ? "bg-[#EEFF41]/20 text-[#EEFF41] border border-[#EEFF41]/30" : "bg-gradient-to-r from-[#00D4C8] to-[#00BFA5] text-white"}`}>
        {saved ? "✓ Tersimpan!" : "Simpan Perubahan"}
      </button>
    </div>
  );
}

function ProfileScreen({ onSettings, openDetail }: { onSettings: () => void; openDetail: (d: Detail) => void }) {
  const { displayName, profile } = useProfile();
  const { activities, metrics } = useAthleteData();
  const totalKm = activities.reduce((n, a) => n + (Number(a.distance_km) || 0), 0);
  const totalSec = activities.reduce((n, a) => n + (a.duration_sec || 0), 0);
  const latest = metrics[0];
  const trend = metrics.slice(0, 7).reverse();

  const photoInput = useRef<HTMLInputElement>(null);
  const bgInput = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [bg, setBg] = useState<string>("linear-gradient(135deg,#00D4C8,#00D4C8)");

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
      {/* Profile header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile</h2>
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
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#00D4C8] ring-2 ring-[#0a0f24]"
              aria-label="Edit profile photo"
            >
              <Pencil size={12} className="text-white" />
            </button>
            <input ref={photoInput} type="file" accept="image/*" hidden onChange={onPhoto} />
          </div>
          <div className="mt-3 text-xl font-bold">{displayName}</div>
          <div className="text-sm text-muted-foreground">{profile.goal || "Set your running goal"}</div>

          <div className="my-5 h-px bg-white/5" />
          <div className="grid grid-cols-3 divide-x divide-white/5">
            <div><div className="text-2xl font-bold">{totalKm.toFixed(0)}</div><div className="text-xs text-muted-foreground">Total KM</div></div>
            <div><div className="text-2xl font-bold">{activities.length}</div><div className="text-xs text-muted-foreground">Total Runs</div></div>
            <div><div className="text-2xl font-bold">{totalSec ? fmtDuration(totalSec).split(":")[0] : 0}</div><div className="text-xs text-muted-foreground">Total Hours</div></div>
          </div>
          <button
            onClick={() => openDetail({ kind: "onboarding-adjust" })}
            className="mt-4 w-full rounded-2xl border border-[#00D4C8]/30 bg-[#00D4C8]/10 py-3 text-sm font-semibold text-[#00D4C8]"
          >
            ⚙ Adjust Running Profile
          </button>
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
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#EEFF41]/15 px-2 py-0.5 text-[10px] font-semibold text-[#EEFF41]">
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
              onClick={() => openDetail({ kind: "coach", name: "Sarah Mitchell", specialty: "Marathon Specialist", initials: "SM", price: "Rp 350.000" })}
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
                <div className="font-bold">{profile.goal || "No goal set"}</div>
                <div className="text-xs text-muted-foreground">
                  {profile.race_distance ? `${profile.race_distance}` : "Set your race distance"}
                  {profile.weekly_distance_km ? ` · ${profile.weekly_distance_km} km/week target` : ""}
                </div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
            <ProgressGridMini />
          </Card>
        </button>
      </section>

      {/* DAILY READINESS metrics */}
      <section>
        <h3 className="mb-3 font-bold">Daily Readiness</h3>
        {latest ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <MetricCard icon={<Heart size={14} />} label="HRV" value={String(latest.hrv_ms ?? "—")} unit="ms" bar="linear-gradient(90deg,#ef4444,#ec4899)" />
              <MetricCard icon={<Moon size={14} />} label="SLEEP" value={String(latest.sleep_hours ?? "—")} unit="hrs" bar="linear-gradient(90deg,#00D4C8,#00D4C8)" />
              <MetricCard icon={<Dumbbell size={14} />} label="LOAD" value={String(latest.training_load ?? "—")} unit="" bar="linear-gradient(90deg,#f59e0b,#fbbf24)" />
            </div>
            {trend.length > 1 && (
              <button onClick={() => openDetail({ kind: "trend-28d" })} className="mt-3 w-full text-left">
                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">7-Day Trend</h3>
                    <TrendingUp size={18} className="text-green-400" />
                  </div>
                  <div className="mt-4 flex h-20 items-end gap-1.5">
                    {trend.map((m, i) => (
                      <div key={i} className="flex-1">
                        <div className="w-full rounded-t" style={{ height: `${((m.readiness_score ?? 0) / 100) * 80}px`, background: i === trend.length - 1 ? "#22d3ee" : "rgba(0,212,200,0.5)" }} />
                      </div>
                    ))}
                  </div>
                </Card>
              </button>
            )}
          </>
        ) : (
          <EmptyState title="No health data yet" sub="Connect Garmin, Strava, Apple Health or Whoop to sync HRV, sleep and training load." action="Connect apps" onAction={() => openDetail({ kind: "connect-apps" })} />
        )}
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
  const { profile, displayName, initials } = useProfile();
  type Item = { icon: any; label: string; sub?: string; badge?: string; onClick: () => void };
  const account: Item[] = [
    { icon: User, label: "Edit Profile", sub: "Name, email, goal, fitness level", onClick: () => openDetail({ kind: "edit-profile" }) },
    { icon: LinkIcon, label: "Connect Apps", sub: "Garmin, Strava, Apple Health, MFP, Whoop", onClick: () => openDetail({ kind: "connect-apps" }) },
    { icon: Shield, label: "Privacy Settings", sub: "Data sharing & visibility", onClick: () => openDetail({ kind: "privacy-settings" }) },
    { icon: Bell, label: "Notifications", sub: "Alerts, reminders, HRV pings", onClick: () => openDetail({ kind: "notif-prefs" }) },
  ];
  const billing: Item[] = [
    { icon: FileText, label: "Subscription", sub: "RUNIQ Pro · Rp 35.000/bulan", badge: "Free", onClick: () => openDetail({ kind: "subscription" }) },
    { icon: Wallet, label: "Wallet & Payments", sub: "e-wallet, QRIS, card, PayPal, Google Pay", onClick: () => openDetail({ kind: "wallet" }) },
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-xl font-bold shadow-brand">{initials}</div>
          <div>
            <div className="font-bold">{displayName}</div>
            <div className="text-xs text-muted-foreground">
              {(profile.role === "coach" ? "Coach" : "Athlete")}{profile.email ? ` · ${profile.email}` : ""}
            </div>
          </div>
        </div>

        <Group title="Account" items={account} />
        <Group title="Billing" items={billing} />
        <Group title="Support" items={help} />
        <Group title="Legal" items={legal} />


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
    <div className="absolute inset-0 z-[60] flex flex-col bg-[#0D1E35]">
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
    case "edit-profile": return "Edit Profile";
    case "wallet": return "Wallet & Payments";
    case "onboarding-adjust": return "Adjust Running Profile";
  }

}


// ── FIX 8: Coach Package Selector ─────────────────────────────────
function CoachPackageSelector({ price, coachFirstName }: { price: string; coachFirstName: string }) {
  const [selected, setSelected] = useState<"partner"|"athlete"|"pro">("partner");
  const base = parseInt(price.replace(/[^0-9]/g, "") || "150000", 10);
  const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
  const sameCity = true; // TODO: compare user city with coach city from profile

  const packages = [
    {
      id: "partner" as const,
      icon: "🤝",
      name: "Partner",
      price: base,
      desc: "Akuntabilitas & panduan dasar",
      features: [
        "Chat langsung dengan coach kapan saja",
        "Pendampingan & motivasi mingguan",
        "Review & approval plan AI mingguan",
      ],
      cityRequired: false,
    },
    {
      id: "athlete" as const,
      icon: "🏃",
      name: "Athlete",
      price: base * 2,
      desc: "Progress lebih cepat dengan pendampingan lebih dalam",
      features: [
        "Semua fitur Partner",
        "Personalized pacing strategy per race goal",
        "Panduan nutrisi dasar sesuai program",
        "2x sesi offline/bulan (Sabtu–Minggu)",
      ],
      cityRequired: true,
    },
    {
      id: "pro" as const,
      icon: "⚡",
      name: "Pro Athlete",
      price: base * 4,
      desc: "Untuk runner serius yang kejar performa & PB",
      features: [
        "Semua fitur Athlete",
        "Analisa HR zones & sleep mendalam",
        "Periodisasi 12–24 minggu penuh",
        "Race day strategy & tapering protocol",
        "Recovery & injury prevention protocol",
        "Monthly video call 1-on-1 dengan coach",
        "Priority response (balas ≤2 jam)",
        "8x sesi offline/bulan (Sabtu–Minggu)",
        "Export laporan performa PDF bulanan",
      ],
      cityRequired: true,
    },
  ];

  const activePkg = packages.find(p => p.id === selected)!;

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pilih Paket</div>
      {packages.map(pkg => {
        const locked = pkg.cityRequired && !sameCity;
        return (
          <button
            key={pkg.id}
            onClick={() => !locked && setSelected(pkg.id)}
            disabled={locked}
            className={`w-full rounded-2xl border-2 p-4 text-left transition-all ${
              selected === pkg.id
                ? "border-[#00D4C8] bg-[#00D4C8]/15"
                : locked
                ? "border-white/5 bg-white/[0.02] opacity-40"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{pkg.icon}</span>
                <span className="font-bold">{pkg.name}</span>
                {selected === pkg.id && <span className="rounded-full bg-[#00D4C8]/20 px-2 py-0.5 text-[10px] font-bold text-[#00D4C8]">DIPILIH</span>}
              </div>
              <div className="text-right">
                <div className="font-bold text-[#00D4C8] text-sm">{fmt(pkg.price)}</div>
                <div className="text-[10px] text-muted-foreground">/bulan</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mb-2">{pkg.desc}</div>
            <div className="space-y-1">
              {pkg.features.map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <span className="text-[#EEFF41] mt-0.5 flex-shrink-0">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            {pkg.cityRequired && (
              <div className={`mt-2 rounded-lg px-3 py-1.5 text-xs ${sameCity ? "bg-[#EEFF41]/10 text-[#EEFF41]" : "bg-yellow-500/10 text-yellow-400"}`}>
                {sameCity ? "✓ Tersedia di kotamu" : "⚠ Hanya untuk kota yang sama dengan coach"}
              </div>
            )}
          </button>
        );
      })}
      <button className="w-full rounded-2xl bg-gradient-brand py-4 font-bold text-white shadow-brand">
        📅 Book Paket {activePkg.name} · {fmt(activePkg.price)}/bulan
      </button>
      <p className="text-center text-xs text-muted-foreground">Batalkan kapan saja · Harga sudah termasuk 20% platform fee</p>
    </div>
  );
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
          <div className="text-3xl font-black">{detail.price}<span className="text-sm font-normal text-muted-foreground">/bulan</span></div>
          {(() => {
            const digits = (detail.price || "").replace(/[^0-9]/g, "");
            const total = parseInt(digits || "0", 10);
            if (!total) return null;
            const rate = Math.round(total / 1.2);
            const fee = total - rate;
            const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
            return (
              <div className="mt-3 border-t border-white/10 pt-3 text-xs text-muted-foreground">
                Harga sudah termasuk 20% platform fee RUNIQ
                <div className="mt-1 flex justify-between"><span>Coach rate</span><span>{fmt(rate)}</span></div>
                <div className="flex justify-between"><span>Platform fee (20%)</span><span>{fmt(fee)}</span></div>
                <div className="mt-1 flex justify-between font-semibold text-foreground"><span>Total</span><span>{fmt(total)}</span></div>
              </div>
            );
          })()}
        </Card>
        <div>
          <h3 className="mb-2 font-bold">About</h3>
          <p className="text-sm text-muted-foreground">10+ years coaching elite runners. Personalized plans validated against your HRV, sleep and recent training load.</p>
        </div>
        <div>
          <h3 className="mb-2 font-bold">Certifications</h3>
          <div className="flex gap-2"><span className="rounded-full border border-[#00D4C8]/40 px-2 py-0.5 text-xs text-[#00D4C8]">USATF L2</span><span className="rounded-full border border-[#00D4C8]/40 px-2 py-0.5 text-xs text-[#00D4C8]">RRCA</span></div>
        </div>
        <CoachPackageSelector price={detail.price ?? "Rp 150.000"} coachFirstName={detail.name.split(" ")[0]} />
      </div>
    );
  }
  if (detail.kind === "workout") {
    return (
      <div className="space-y-5">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{detail.date}</div>
          <div className="mt-1 text-2xl font-bold text-[#00D4C8]">{detail.type}</div>
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
        <AiCoachNotesCard />
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
            <button className="rounded-full bg-[#00D4C8] px-4 py-2 text-xs font-semibold text-white">Add</button>
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
          <div className="text-2xl font-bold">Rp 35.000<span className="text-sm font-normal text-muted-foreground">/bulan</span></div>
        </Card>
        <ul className="space-y-3">
          {["Unlimited AI plan rewrites","Coach-validated workouts","Advanced HRV insights","Priority messaging"].map(f => (
            <li key={f} className="flex items-start gap-3 text-sm"><Check size={18} className="text-[#EEFF41]" /> {f}</li>
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
  if (detail.kind === "edit-profile") return <EditProfileView />;
  if (detail.kind === "wallet") return <WalletView />;
  if (detail.kind === "onboarding-adjust") return <OnboardingAdjustView />;

  if (detail.kind === "profile-item") {
    return <EditProfileView />;
  }

  if (detail.kind === "settings-item") {
    return <SettingsItemView label={(detail as any).label} />;
  }
  return null;
}

function SettingsItemView({ label }: { label: string }) {
  if (label === "Subscription") return <SubscriptionView />;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
      <div className="rounded-full bg-white/5 p-5">
        <Settings size={28} className="text-muted-foreground" />
      </div>
      <div className="font-bold">{label}</div>
      <div className="text-sm text-muted-foreground max-w-[200px]">Fitur ini sedang dalam pengembangan. Akan segera hadir!</div>
    </div>
  );
}

function ConnectAppsView() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const apps = [
    { id: "garmin", name: "Garmin Connect", desc: "Watches & cycling computers", icon: <Watch size={22} className="text-[#00D4C8]" />, onConnect: connectGarmin },
    { id: "strava", name: "Strava", desc: "Activities & social feed", icon: <Activity size={22} className="text-orange-500" />, onConnect: connectStrava },
    { id: "apple-health", name: "Apple Health", desc: "iPhone & Apple Watch", icon: <Apple size={22} className="text-white" />, onConnect: () => alert("Apple Health: Tap Allow when iOS prompts to share HealthKit data.") },
    { id: "google-fit", name: "Google Fit / Android Health", desc: "Android phones & Wear OS", icon: <Smartphone size={22} className="text-[#EEFF41]" />, onConnect: () => alert("Android: redirect to Google Fit authorization (OAuth).") },
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
                  ? "border border-[#EEFF41]/40 text-[#EEFF41]"
                  : "bg-[#00D4C8] text-white"
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
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#EEFF41]" /> Training</span>
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
          <div className="text-2xl font-bold text-[#EEFF41]">{trained}</div>
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
        { title: "Tempo Run session waiting", body: "12 km · Zone 4 · Tap to start", time: "08:12", icon: <Activity size={16} className="text-[#00D4C8]" /> },
        { title: "Coach Andre sent a message", body: "Focus on pace, don't over-effort.", time: "07:40", icon: <MessageSquare size={16} className="text-[#EEFF41]" /> },
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
        <button className="text-xs font-semibold text-[#00D4C8]">Mark all read</button>
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
    { l: "Sleep", w: 30, v: 84, c: "#00D4C8", sub: "7.2 h · 84% quality" },
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
    { me: false, t: "", time: "09:22", card: { title: "Tomorrow · Recovery Jog", sub: "5 km · HR < 140 · Zone 1–2", icon: <Footprints size={18} className="text-[#00D4C8]" /> } },
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
        <div className="border-b border-[#00D4C8]/25 bg-gradient-to-r from-[#00D4C8]/15 to-purple-500/10 px-5 py-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#00D4C8]">
            <Pin size={12} /> Pinned Plan
          </div>
          <div className="mt-1 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold">This Week — Marathon Base Wk 8</div>
              <div className="text-[11px] text-muted-foreground">6 sessions · Approved · Last updated 2h ago</div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EEFF41]/15 px-2 py-0.5 text-[10px] font-semibold text-[#EEFF41]">
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
                    <div className="text-[10px] uppercase tracking-wider text-[#00D4C8]">Session Card</div>
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
      <div className="border-t border-white/5 bg-[#0D1E35] px-4 py-3">
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
    { name: "Sarah Mitchell", initials: "SM", specialty: "Marathon Specialist", price: "Rp 350.000", rating: 4.9, reviews: 127, certs: ["USATF L2", "RRCA"], color: "from-indigo-500 to-purple-500" },
    { name: "Marcus Chen", initials: "MC", specialty: "Speed & Track", price: "Rp 500.000", rating: 4.8, reviews: 92, certs: ["USATF L3"], color: "from-orange-500 to-red-500" },
    { name: "Jamie Lee", initials: "JL", specialty: "Beginner Friendly", price: "Rp 150.000", rating: 4.9, reviews: 156, certs: ["RRCA"], color: "from-pink-500 to-fuchsia-500" },
    { name: "Dana Wijaya", initials: "DW", specialty: "Trail & Ultra", price: "Rp 450.000", rating: 4.8, reviews: 84, certs: ["UESCA", "ACE"], color: "from-emerald-500 to-teal-500" },
    { name: "Rio Hidayat", initials: "RH", specialty: "Speed & 5k–10k", price: "Rp 200.000", rating: 4.7, reviews: 56, certs: ["USATF L1"], color: "from-sky-500 to-blue-500" },
    { name: "Mira Santoso", initials: "MS", specialty: "Base Building", price: "Rp 50.000", rating: 4.9, reviews: 210, certs: ["RRCA"], color: "from-amber-500 to-yellow-500" },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
        Mulai dari <span className="font-semibold text-foreground">Rp 50.000/bulan</span> · Tiap coach menentukan tarifnya sendiri
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
        <Search size={16} className="text-muted-foreground" />
        <input placeholder="Search coaches…" className="w-full bg-transparent text-sm outline-none" />
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${filter === c ? "border-[#00D4C8] bg-[#00D4C8]/20 text-[#00D4C8]" : "border-white/10 bg-white/5 text-muted-foreground"}`}
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
                  <div className="text-sm font-bold">{c.price}<span className="text-[10px] font-normal text-muted-foreground">/bulan</span></div>
                </div>
                <div className="text-xs text-muted-foreground">{c.specialty}</div>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{c.rating}</span>
                  <span className="text-muted-foreground">({c.reviews})</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.certs.map((cert) => (
                    <span key={cert} className="rounded-full border border-[#00D4C8]/40 px-2 py-0.5 text-[10px] text-[#00D4C8]">{cert}</span>
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
            {billing === "monthly" ? "Rp 35.000" : "Rp 350.000"}
            <span className="ml-1 text-sm font-normal text-white/70">/ {billing === "monthly" ? "bulan" : "tahun"}</span>
          </div>
          {billing === "yearly" && <div className="text-xs text-white/80">Hemat 17% · setara Rp 29.167/bulan</div>}
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
            <li key={p} className="flex items-start gap-2"><Check size={16} className="mt-0.5 text-[#EEFF41]" /><span>{p}</span></li>
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
      <Card className="border border-[#00D4C8]/25 bg-[#00D4C8]/10 p-4 text-xs text-muted-foreground">
        <div className="flex items-start gap-2 text-foreground"><Shield size={14} className="mt-0.5 text-[#00D4C8]" /><span className="font-semibold">Your data is yours.</span></div>
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

// ================= Edit Profile =================
function EditProfileView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [remote, setRemote] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileRow>({});

  useEffect(() => {
    (async () => {
      const p = await fetchProfile();
      setForm(p);
      setLoading(false);
    })();
  }, []);

  async function save(patch: ProfileRow) {
    setSaving(true);
    const merged = { ...form, ...patch };
    setForm(merged);
    const res = await upsertProfile(patch);
    setRemote(res.remote);
    setSaving(false);
    if (res.ok) setSavedAt(new Date().toLocaleTimeString());
  }

  function field<K extends keyof ProfileRow>(key: K, value: ProfileRow[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading profile…</div>;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold">Personal details</div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] ${remote ? "bg-[#EEFF41]/20 text-emerald-300" : "bg-white/5 text-muted-foreground"}`}>
            {remote ? "Synced to cloud" : "Local (sign in to sync)"}
          </span>
        </div>
        <div className="space-y-3">
          <Field label="Full name">
            <input value={form.full_name || ""} onChange={(e) => field("full_name", e.target.value)} onBlur={(e) => save({ full_name: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" placeholder="Your full name" />
          </Field>
          <Field label="Email address">
            <input type="email" value={form.email || ""} onChange={(e) => field("email", e.target.value)} onBlur={(e) => save({ email: e.target.value })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm" placeholder="you@example.com" />
          </Field>
          <Field label="Goal">
            <select value={form.goal || ""} onChange={(e) => { field("goal", e.target.value); save({ goal: e.target.value }); }} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
              <option value="">Select goal</option>
              <option value="race">Train for a race</option>
              <option value="fitness">General fitness</option>
              <option value="weight">Lose weight</option>
              <option value="return">Return to running</option>
            </select>
          </Field>
          <Field label="Fitness level">
            <div className="grid grid-cols-3 gap-2">
              {["beginner","intermediate","advanced"].map((l) => (
                <button key={l} onClick={() => save({ fitness_level: l })} className={`rounded-xl border py-2 text-xs capitalize ${form.fitness_level === l ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-white/10 bg-white/5 text-muted-foreground"}`}>{l}</button>
              ))}
            </div>
          </Field>
          <Field label="Language">
            <div className="grid grid-cols-2 gap-2">
              {[["en","English"],["id","Bahasa Indonesia"]].map(([id,label]) => (
                <button key={id} onClick={() => save({ language: id })} className={`rounded-xl border py-2 text-xs ${form.language === id ? "border-indigo-500 bg-indigo-500/10 text-white" : "border-white/10 bg-white/5 text-muted-foreground"}`}>{label}</button>
              ))}
            </div>
          </Field>
        </div>
      </Card>
      <div className="text-center text-[11px] text-muted-foreground">
        {saving ? "Saving…" : savedAt ? `Saved at ${savedAt}` : "Changes save automatically"}
      </div>
    </div>
  );
}


// ================= Wallet & Payments =================
function WalletView() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  async function refresh() { setWallets(await listWallets()); }
  useEffect(() => { (async () => { await refresh(); setLoading(false); })(); }, []);

  const options = [
    { provider: "midtrans", method: "qris", label: "QRIS (via Midtrans)", desc: "Scan-to-pay from any Indonesian bank/e-wallet" },
    { provider: "midtrans", method: "gopay", label: "GoPay", desc: "Midtrans" },
    { provider: "xendit", method: "shopeepay", label: "ShopeePay", desc: "Xendit" },
    { provider: "xendit", method: "ovo", label: "OVO", desc: "Xendit" },
    { provider: "xendit", method: "dana", label: "DANA", desc: "Xendit" },
    { provider: "googlepay", method: "card", label: "Google Pay", desc: "Cards via Google Wallet" },
    { provider: "card", method: "card", label: "Credit / Debit Card", desc: "Visa · Mastercard · JCB" },
    { provider: "paypal", method: "paypal", label: "PayPal", desc: "International accounts" },
  ];

  async function connect(o: typeof options[number]) {
    setConnecting(o.label);
    // Mock provider handshake — real Midtrans/Xendit OAuth wired when keys provided.
    await new Promise((r) => setTimeout(r, 700));
    await addWallet({ provider: o.provider, method: o.method, label: o.label, is_default: wallets.length === 0 });
    await refresh();
    setConnecting(null);
  }

  async function detach(id: string) {
    await removeWallet(id);
    await refresh();
  }

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300"><Wallet size={20} /></div>
          <div>
            <div className="text-sm font-semibold">RUNIQ Wallet</div>
            <div className="text-[11px] text-muted-foreground">Used to pay subscription and coach fees.</div>
          </div>
        </div>
      </Card>

      <section>
        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Your payment methods</h4>
        {loading ? (
          <div className="text-xs text-muted-foreground">Loading…</div>
        ) : wallets.length === 0 ? (
          <Card className="p-4 text-xs text-muted-foreground">No payment methods connected yet.</Card>
        ) : (
          <Card className="divide-y divide-white/5 p-0">
            {wallets.map((w) => (
              <div key={w.id} className="flex items-center gap-3 p-3.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground"><CreditCard size={16} /></span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{w.label}</div>
                  <div className="text-[11px] text-muted-foreground">{w.provider}{w.is_default ? " · Default" : ""}</div>
                </div>
                <button onClick={() => w.id && detach(w.id)} aria-label="Remove" className="rounded-lg p-2 text-muted-foreground hover:text-rose-400"><Trash2 size={16} /></button>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section>
        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Add a method</h4>
        <Card className="divide-y divide-white/5 p-0">
          {options.map((o) => (
            <button key={o.label} disabled={connecting === o.label} onClick={() => connect(o)} className="flex w-full items-center gap-3 p-3.5 text-left disabled:opacity-60">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-muted-foreground"><Plus size={16} /></span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{o.label}</span>
                <span className="block text-[11px] text-muted-foreground">{o.desc}</span>
              </span>
              <span className="text-[10px] text-muted-foreground">{connecting === o.label ? "Connecting…" : "Connect"}</span>
            </button>
          ))}
        </Card>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Payment gateways (Midtrans/Xendit) use a mock handshake here. Real OAuth is wired once merchant credentials are provided.
        </p>
      </section>
    </div>
  );
}
