import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users, MessageSquare, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, ArrowLeft, Search, BarChart3, ClipboardList, User,
} from "lucide-react";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Coach Console — RUNIQ" },
      { name: "description", content: "Review AI plans, message runners, monitor squad progress." },
    ],
  }),
  component: CoachApp,
});

type Tab = "runners" | "review" | "chat" | "squad";

function CoachApp() {
  const [tab, setTab] = useState<Tab>("runners");
  return (
    <div className="min-h-screen w-full bg-[#050816] text-foreground">
      <div className="relative mx-auto min-h-screen max-w-[420px] bg-[#0a0f24] pb-24">
        <header className="flex items-center gap-3 px-5 pb-4 pt-6">
          <Link to="/" className="rounded-full p-1 text-muted-foreground hover:text-white"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-300">Coach Console</div>
            <div className="text-lg font-bold">Sarah Mitchell</div>
          </div>
          <div className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold">SM</div>
        </header>

        <div className="grid grid-cols-3 gap-2 px-5 pb-4">
          <Stat label="Runners" value="24" icon={Users} />
          <Stat label="Pending" value="6" icon={Clock} accent="text-amber-300" />
          <Stat label="Alerts" value="2" icon={AlertTriangle} accent="text-rose-300" />
        </div>

        <main className="px-5">
          {tab === "runners" && <Runners />}
          {tab === "review" && <ReviewQueue />}
          {tab === "chat" && <CoachChat />}
          {tab === "squad" && <SquadInsights />}
        </main>

        {/* Bottom navigation */}
        <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-[420px] border-t border-white/10 bg-[#0a0f24]/95 backdrop-blur">
          <div className="grid grid-cols-4">
            {([
              ["runners", "Runners", User],
              ["review", "Review", ClipboardList],
              ["chat", "Chat", MessageSquare],
              ["squad", "Squad", BarChart3],
            ] as [Tab, string, any][]).map(([id, label, Icon]) => {
              const on = tab === id;
              return (
                <button key={id} onClick={() => setTab(id)} className={`flex flex-col items-center gap-1 py-3 text-[10px] ${on ? "text-white" : "text-muted-foreground"}`}>
                  <Icon className={`h-5 w-5 ${on ? "text-indigo-400" : ""}`} />
                  <span className={on ? "font-semibold" : ""}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, accent = "text-indigo-300" }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 p-3">
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{value}</div>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function Runners() {
  const list = [
    { name: "Andi Pratama", plan: "Sub-4 Marathon", adherence: 92, status: "on-track" },
    { name: "Rina Wijaya", plan: "First 10K", adherence: 78, status: "on-track" },
    { name: "Budi Santoso", plan: "Sub-1:45 HM", adherence: 45, status: "at-risk" },
    { name: "Sinta Kusuma", plan: "Base building", adherence: 88, status: "on-track" },
    { name: "Fajar Ali", plan: "Boston Q", adherence: 30, status: "at-risk" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input placeholder="Search runners" className="flex-1 bg-transparent text-sm outline-none" />
      </div>
      {list.map((a) => (
        <div key={a.name} className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold">{a.name.split(" ").map(w => w[0]).join("")}</div>
            <div className="flex-1">
              <div className="font-semibold">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.plan}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-white/10">
              <div className={`h-full rounded-full ${a.adherence > 70 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${a.adherence}%` }} />
            </div>
            <div className="text-xs text-muted-foreground">{a.adherence}%</div>
            {a.status === "at-risk" && <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-300">At risk</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewQueue() {
  const items = [
    { athlete: "Andi Pratama", plan: "Week 8 — Peak", generated: "2h ago" },
    { athlete: "Rina Wijaya", plan: "Week 3 — Build", generated: "5h ago" },
    { athlete: "Sinta Kusuma", plan: "Recovery week", generated: "1d ago" },
  ];
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300">AI-Generated Plans Awaiting Review</div>
        <div className="mt-1 text-sm">{items.length} plans need your approval.</div>
      </div>
      {items.map((it) => (
        <div key={it.athlete} className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{it.athlete}</div>
              <div className="text-xs text-muted-foreground">{it.plan} • {it.generated}</div>
            </div>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">Pending</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold">Edit</button>
            <button className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2 text-xs font-semibold text-white"><CheckCircle2 className="mr-1 inline h-3 w-3" />Approve</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SquadInsights() {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
        <div className="mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-indigo-300" /><div className="text-sm font-semibold">Squad Volume (last 4 weeks)</div></div>
        <div className="flex h-24 items-end gap-1">
          {[60, 72, 85, 68, 90, 78, 95].map((v, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-blue-400" style={{ height: `${v}%` }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Avg Adherence</div>
          <div className="mt-1 text-2xl font-bold">78%</div>
          <div className="text-xs text-emerald-300">+5% vs last month</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Volume</div>
          <div className="mt-1 text-2xl font-bold">1,240 km</div>
          <div className="text-xs text-muted-foreground">24 runners</div>
        </div>
      </div>
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-rose-300" /><div className="text-sm font-semibold">2 runners flagged</div></div>
        <div className="mt-2 text-xs text-muted-foreground">Missed 3+ sessions or elevated HRV drop.</div>
      </div>
    </div>
  );
}

function CoachChat() {
  const threads = [
    { name: "Andi Pratama", last: "Thanks coach! Feeling great today.", unread: 0 },
    { name: "Rina Wijaya", last: "Should I add stretching?", unread: 2 },
    { name: "Budi Santoso", last: "Missed run — traveling", unread: 1 },
  ];
  return (
    <div className="space-y-2">
      {threads.map((t) => (
        <div key={t.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card/60 p-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-xs font-bold">{t.name.split(" ").map(w => w[0]).join("")}</div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{t.name}</div>
            <div className="truncate text-xs text-muted-foreground">{t.last}</div>
          </div>
          {t.unread > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-500 text-[10px] font-bold">{t.unread}</span>}
        </div>
      ))}
    </div>
  );
}
