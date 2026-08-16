import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users, MessageSquare, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, ArrowLeft, Search, BarChart3, ClipboardList, User,
  Settings, Bell, LogOut, Send, X, Wallet, Shield, FileText, HelpCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Coach Console — RUNIQ" },
      { name: "description", content: "Review AI plans, message runners, monitor squad progress." },
      { property: "og:title", content: "Coach Console — RUNIQ" },
      { property: "og:description", content: "Review AI plans, message runners, monitor squad progress." },
    ],
  }),
  component: CoachApp,
});

type Tab = "runners" | "review" | "chat" | "squad";
type Runner = { name: string; plan: string; adherence: number; status: string };
type Detail =
  | { kind: "runner"; runner: Runner }
  | { kind: "thread"; name: string }
  | { kind: "notifications" }
  | { kind: "settings-item"; label: string };

const RUNNERS: Runner[] = [
  { name: "Andi Pratama", plan: "Sub-4 Marathon", adherence: 92, status: "on-track" },
  { name: "Rina Wijaya", plan: "First 10K", adherence: 78, status: "on-track" },
  { name: "Budi Santoso", plan: "Sub-1:45 HM", adherence: 45, status: "at-risk" },
  { name: "Sinta Kusuma", plan: "Base building", adherence: 88, status: "on-track" },
  { name: "Fajar Ali", plan: "Boston Q", adherence: 30, status: "at-risk" },
];

const ini = (n: string) => n.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

function CoachApp() {
  const [tab, setTab] = useState<Tab>("runners");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pending, setPending] = useState([
    { athlete: "Andi Pratama", plan: "Week 8 — Peak", generated: "2h ago" },
    { athlete: "Rina Wijaya", plan: "Week 3 — Build", generated: "5h ago" },
    { athlete: "Sinta Kusuma", plan: "Recovery week", generated: "1d ago" },
  ]);
  const { displayName, initials } = useProfile();

  const open = (d: Detail) => { setDetail(d); document.querySelector("main")?.scrollTo(0, 0); };

  return (
    <div className="min-h-screen w-full bg-[#0A1628] text-foreground">
      <div className="relative mx-auto min-h-screen max-w-[420px] bg-[#0D1E35] pb-24">
        <header className="flex items-center gap-3 border-b border-white/5 px-5 pb-4 pt-6">
          <Link to="/" className="rounded-full p-1 text-muted-foreground hover:text-white" aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <div className="text-xs uppercase tracking-wider text-[#00D4C8]">Coach Console</div>
            <div className="text-lg font-bold">{displayName}</div>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => open({ kind: "notifications" })} className="relative rounded-full p-2 text-muted-foreground hover:text-white" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FF6B4A]" />
            </button>
            <button onClick={() => setSettingsOpen(true)} className="rounded-full p-2 text-muted-foreground hover:text-white" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-[#0A1628]" style={{ background: "var(--gradient-brand)" }}>{initials}</div>
          </div>
        </header>

        {!detail && (
          <>
            <div className="grid grid-cols-3 gap-2 px-5 py-4">
              <Stat label="Runners" value={String(RUNNERS.length)} icon={Users} onClick={() => setTab("runners")} />
              <Stat label="Pending" value={String(pending.length)} icon={Clock} accent="text-amber-300" onClick={() => setTab("review")} />
              <Stat label="Alerts" value="2" icon={AlertTriangle} accent="text-[#FF6B4A]" onClick={() => setTab("squad")} />
            </div>
            <main className="px-5">
              {tab === "runners" && <Runners onOpen={(r) => open({ kind: "runner", runner: r })} />}
              {tab === "review" && (
                <ReviewQueue
                  items={pending}
                  onApprove={(a) => setPending((p) => p.filter((i) => i.athlete !== a))}
                  onOpen={(a) => open({ kind: "thread", name: a })}
                />
              )}
              {tab === "chat" && <CoachChat onOpen={(n) => open({ kind: "thread", name: n })} />}
              {tab === "squad" && <SquadInsights />}
            </main>
          </>
        )}

        {detail && <main className="px-5 py-4"><DetailView detail={detail} onBack={() => setDetail(null)} /></main>}

        <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-[420px] border-t border-white/5 bg-[#0D1E35]/95 backdrop-blur">
          <div className="grid grid-cols-4">
            {([
              ["runners", "Runners", User],
              ["review", "Review", ClipboardList],
              ["chat", "Chat", MessageSquare],
              ["squad", "Squad", BarChart3],
            ] as [Tab, string, any][]).map(([id, label, Icon]) => {
              const on = tab === id && !detail;
              return (
                <button key={id} onClick={() => { setDetail(null); setTab(id); }} className={`flex flex-col items-center gap-1 py-3 text-[10px] ${on ? "text-white" : "text-muted-foreground"}`}>
                  <Icon className={`h-5 w-5 ${on ? "text-[#00D4C8]" : ""}`} />
                  <span className={on ? "font-semibold" : ""}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {settingsOpen && (
          <CoachSettings
            onClose={() => setSettingsOpen(false)}
            onOpenItem={(label) => { setSettingsOpen(false); open({ kind: "settings-item", label }); }}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, accent = "text-[#00D4C8]", onClick }: any) {
  return (
    <button onClick={onClick} className="rounded-2xl border border-white/10 bg-card/60 p-3 text-left active:scale-[.98]">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{value}</div>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </button>
  );
}

function Runners({ onOpen }: { onOpen: (r: Runner) => void }) {
  const [q, setQ] = useState("");
  const list = RUNNERS.filter((r) => r.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search runners" className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      {list.map((a) => (
        <button key={a.name} onClick={() => onOpen(a)} className="w-full rounded-2xl border border-white/10 bg-card/60 p-4 text-left active:scale-[.99]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full text-xs font-bold text-[#0A1628]" style={{ background: "var(--gradient-brand)" }}>{ini(a.name)}</div>
            <div className="flex-1">
              <div className="font-semibold">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.plan}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-white/10">
              <div className={`h-full rounded-full ${a.adherence > 70 ? "bg-[#00D4C8]" : "bg-amber-500"}`} style={{ width: `${a.adherence}%` }} />
            </div>
            <div className="text-xs text-muted-foreground">{a.adherence}%</div>
            {a.status === "at-risk" && <span className="rounded-full bg-[#FF6B4A]/20 px-2 py-0.5 text-[10px] text-[#FF6B4A]">At risk</span>}
          </div>
        </button>
      ))}
      {list.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">No runners found.</div>}
    </div>
  );
}

function ReviewQueue({ items, onApprove, onOpen }: { items: any[]; onApprove: (a: string) => void; onOpen: (a: string) => void }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[#00D4C8]/30 bg-[#00D4C8]/10 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#00D4C8]">AI-Generated Plans Awaiting Review</div>
        <div className="mt-1 text-sm">{items.length} plans need your approval.</div>
      </div>
      {items.map((it) => (
        <div key={it.athlete} className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <button onClick={() => onOpen(it.athlete)} className="flex w-full items-start justify-between text-left">
            <div>
              <div className="font-semibold">{it.athlete}</div>
              <div className="text-xs text-muted-foreground">{it.plan} • {it.generated}</div>
            </div>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">Pending</span>
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => onOpen(it.athlete)} className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold">Message</button>
            <button onClick={() => onApprove(it.athlete)} className="rounded-xl py-2 text-xs font-semibold text-[#0A1628]" style={{ background: "var(--gradient-brand)" }}>
              <CheckCircle2 className="mr-1 inline h-3 w-3" />Approve
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">All caught up — no plans pending.</div>}
    </div>
  );
}

function SquadInsights() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
        <div className="mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#00D4C8]" /><div className="text-sm font-semibold">Squad Volume (last 4 weeks)</div></div>
        <div className="flex h-24 items-end gap-1">
          {[60, 72, 85, 68, 90, 78, 95].map((v, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-[#00D4C8] to-[#EEFF41]" style={{ height: `${v}%` }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Avg Adherence</div>
          <div className="mt-1 text-2xl font-bold">78%</div>
          <div className="text-xs text-[#00D4C8]">+5% vs last month</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Volume</div>
          <div className="mt-1 text-2xl font-bold">1,240 km</div>
          <div className="text-xs text-muted-foreground">{RUNNERS.length} runners</div>
        </div>
      </div>
      <div className="rounded-2xl border border-[#FF6B4A]/30 bg-[#FF6B4A]/10 p-4">
        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[#FF6B4A]" /><div className="text-sm font-semibold">2 runners flagged</div></div>
        <div className="mt-2 text-xs text-muted-foreground">Missed 3+ sessions or elevated HRV drop.</div>
      </div>
    </div>
  );
}

function CoachChat({ onOpen }: { onOpen: (name: string) => void }) {
  const threads = [
    { name: "Andi Pratama", last: "Thanks coach! Feeling great today.", unread: 0 },
    { name: "Rina Wijaya", last: "Should I add stretching?", unread: 2 },
    { name: "Budi Santoso", last: "Missed run — traveling", unread: 1 },
  ];
  return (
    <div className="space-y-2">
      {threads.map((t) => (
        <button key={t.name} onClick={() => onOpen(t.name)} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-card/60 p-3 text-left active:scale-[.99]">
          <div className="grid h-10 w-10 place-items-center rounded-full text-xs font-bold text-[#0A1628]" style={{ background: "var(--gradient-brand)" }}>{ini(t.name)}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{t.name}</div>
            <div className="truncate text-xs text-muted-foreground">{t.last}</div>
          </div>
          {t.unread > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-[#00D4C8] text-[10px] font-bold text-[#0A1628]">{t.unread}</span>}
        </button>
      ))}
    </div>
  );
}

function DetailView({ detail, onBack }: { detail: Detail; onBack: () => void }) {
  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      {detail.kind === "runner" && <RunnerDetail runner={detail.runner} />}
      {detail.kind === "thread" && <ThreadView name={detail.name} />}
      {detail.kind === "notifications" && <Notifications />}
      {detail.kind === "settings-item" && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">{detail.label}</h2>
          <p className="text-sm text-muted-foreground">This section is coming soon for coaches.</p>
        </div>
      )}
    </div>
  );
}

function RunnerDetail({ runner }: { runner: Runner }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-full text-lg font-bold text-[#0A1628]" style={{ background: "var(--gradient-brand)" }}>{ini(runner.name)}</div>
        <div>
          <h2 className="text-xl font-bold">{runner.name}</h2>
          <div className="text-xs text-muted-foreground">{runner.plan}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["Adherence", `${runner.adherence}%`], ["Weekly km", "42"], ["Readiness", "76"]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-white/10 bg-card/60 p-3">
            <div className="text-lg font-bold">{v}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
        <div className="mb-2 text-sm font-semibold">This week</div>
        {[["Mon", "Easy 8K"], ["Wed", "Intervals 6×800m"], ["Fri", "Tempo 10K"], ["Sun", "Long run 22K"]].map(([d, s]) => (
          <div key={d} className="flex items-center justify-between border-b border-white/5 py-2 text-sm last:border-0">
            <span className="text-muted-foreground">{d}</span><span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreadView({ name }: { name: string }) {
  const [msgs, setMsgs] = useState([
    { me: false, text: "Hi coach, my legs feel heavy today." },
    { me: true, text: "Take it easy — swap to a 30 min recovery jog." },
  ]);
  const [text, setText] = useState("");
  function send() {
    const t = text.trim();
    if (!t) return;
    setMsgs((m) => [...m, { me: true, text: t }]);
    setText("");
  }
  return (
    <div className="flex min-h-[60vh] flex-col">
      <h2 className="mb-3 text-lg font-bold">{name}</h2>
      <div className="flex-1 space-y-2">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.me ? "ml-auto bg-[#00D4C8] text-[#0A1628]" : "border border-white/10 bg-card/60"}`}>{m.text}</div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-2">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message runner" className="flex-1 bg-transparent text-sm outline-none" />
        <button onClick={send} className="text-[#00D4C8]" aria-label="Send"><Send className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function Notifications() {
  const items = [
    { t: "Rina Wijaya sent you a message", s: "5m ago" },
    { t: "New AI plan ready for Andi Pratama", s: "2h ago" },
    { t: "Budi Santoso missed 3 sessions", s: "1d ago" },
  ];
  return (
    <div className="space-y-2">
      <h2 className="mb-2 text-xl font-bold">Notifications</h2>
      {items.map((n) => (
        <div key={n.t} className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <div className="text-sm">{n.t}</div>
          <div className="text-xs text-muted-foreground">{n.s}</div>
        </div>
      ))}
    </div>
  );
}

function CoachSettings({ onClose, onOpenItem }: { onClose: () => void; onOpenItem: (label: string) => void }) {
  const { displayName, initials, profile } = useProfile();
  const items = [
    { label: "Coach profile", icon: User },
    { label: "Payouts & wallet", icon: Wallet },
    { label: "Notifications", icon: Bell },
    { label: "Privacy", icon: Shield },
    { label: "Terms of Service", icon: FileText },
    { label: "Help & support", icon: HelpCircle },
  ];
  async function logout() {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") window.location.href = "/";
  }
  return (
    <div className="fixed inset-0 z-[60] flex justify-center bg-black/60" onClick={onClose}>
      <div className="mt-auto w-full max-w-[420px] rounded-t-3xl border-t border-white/10 bg-[#0D1E35] p-5 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full text-sm font-bold text-[#0A1628]" style={{ background: "var(--gradient-brand)" }}>{initials}</div>
          <div className="flex-1">
            <div className="font-semibold">{displayName}</div>
            <div className="text-xs text-muted-foreground">{profile.email || "Coach"}</div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-1">
          {items.map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => onOpenItem(label)} className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left text-sm hover:bg-white/5">
              <Icon className="h-4 w-4 text-[#00D4C8]" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left text-sm text-[#FF6B4A] hover:bg-white/5">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>
    </div>
  );
}
