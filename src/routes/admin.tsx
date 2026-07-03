import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Shield, Users, UserCog, DollarSign, BarChart3, ArrowLeft, TrendingUp,
  AlertTriangle, CheckCircle2, Server, Search,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — RUNIQ" },
      { name: "description", content: "Super Admin, Head of Coach, Sales, Analytics." },
    ],
  }),
  component: AdminApp,
});

type Role = "super" | "coach-head" | "sales" | "analytics";

function AdminApp() {
  const [role, setRole] = useState<Role>("super");
  return (
    <div className="min-h-screen w-full bg-[#050816] text-foreground">
      <div className="mx-auto min-h-screen max-w-[1080px] bg-[#0a0f24] pb-16">
        <header className="flex items-center gap-3 border-b border-white/5 px-6 py-4">
          <Link to="/" className="rounded-full p-1 text-muted-foreground hover:text-white"><ArrowLeft className="h-5 w-5" /></Link>
          <Shield className="h-5 w-5 text-indigo-400" />
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">RUNIQ Admin</div>
            <div className="text-base font-bold">Internal Dashboard</div>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs">
            <div className="h-2 w-2 rounded-full bg-emerald-400" /> All systems operational
          </div>
        </header>

        <div className="flex gap-1 border-b border-white/5 px-6 text-sm">
          {([
            ["super", "Super Admin", Shield],
            ["coach-head", "Head of Coach", UserCog],
            ["sales", "Business & Sales", DollarSign],
            ["analytics", "Head of Analytics", BarChart3],
          ] as [Role, string, any][]).map(([r, label, Icon]) => (
            <button key={r} onClick={() => setRole(r)} className={`flex items-center gap-2 px-4 py-3 ${role === r ? "border-b-2 border-indigo-500 font-semibold text-white" : "text-muted-foreground"}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <main className="p-6">
          {role === "super" && <SuperAdmin />}
          {role === "coach-head" && <CoachHead />}
          {role === "sales" && <SalesPanel />}
          {role === "analytics" && <AnalyticsPanel />}
        </main>
      </div>
    </div>
  );
}

function KPI({ label, value, delta, icon: Icon, accent = "text-indigo-300" }: any) {
  return (
    <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {delta && <div className="text-xs text-emerald-300">{delta}</div>}
    </div>
  );
}

function SuperAdmin() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Total users" value="12,483" delta="+312 this week" icon={Users} />
        <KPI label="Active coaches" value="47" delta="+3" icon={UserCog} />
        <KPI label="MRR" value="Rp 340jt" delta="+8.2%" icon={DollarSign} />
        <KPI label="Uptime (30d)" value="99.98%" icon={Server} accent="text-emerald-300" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Recent activity</div>
          <div className="text-xs text-muted-foreground">Last 24h</div>
        </div>
        <ul className="divide-y divide-white/5 text-sm">
          {[
            "New coach onboarded: Rangga Wibowo",
            "Payment failed: user #8321",
            "Plan approval SLA breached (3h)",
            "Feature flag `nutrition-v2` enabled at 25%",
          ].map((line, i) => (
            <li key={i} className="flex items-center gap-2 py-2"><CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" /> {line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CoachHead() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="Coaches" value="47" icon={UserCog} />
        <KPI label="Plans pending" value="83" delta="Target < 100" icon={AlertTriangle} accent="text-amber-300" />
        <KPI label="Avg approval time" value="2.4h" icon={TrendingUp} />
        <KPI label="NPS (coaches)" value="72" icon={CheckCircle2} accent="text-emerald-300" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
        <div className="mb-3 text-sm font-semibold">Coach roster</div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search coaches" className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <div className="mt-3 divide-y divide-white/5 text-sm">
          {[
            { name: "Sarah Mitchell", athletes: 24, rating: 4.9, sla: "1.8h" },
            { name: "Marcus Chen", athletes: 18, rating: 4.7, sla: "3.1h" },
            { name: "Nia Rahmawati", athletes: 12, rating: 4.8, sla: "2.2h" },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-3 py-3">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-[10px] font-bold">{c.name.split(" ").map(w => w[0]).join("")}</div>
              <div className="flex-1">{c.name}</div>
              <div className="text-xs text-muted-foreground">{c.athletes} athletes</div>
              <div className="text-xs text-muted-foreground">★ {c.rating}</div>
              <div className="text-xs text-muted-foreground">SLA {c.sla}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SalesPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="MRR" value="Rp 340jt" delta="+8.2%" icon={DollarSign} />
        <KPI label="New subs (7d)" value="128" delta="+14" icon={TrendingUp} />
        <KPI label="Churn (30d)" value="3.4%" icon={AlertTriangle} accent="text-amber-300" />
        <KPI label="LTV" value="Rp 2.1jt" icon={CheckCircle2} accent="text-emerald-300" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
        <div className="mb-3 text-sm font-semibold">Pipeline — B2B corporate</div>
        <div className="grid grid-cols-4 gap-3 text-xs">
          {[
            ["Lead", 24, "text-blue-300"],
            ["Demo", 12, "text-indigo-300"],
            ["Proposal", 6, "text-amber-300"],
            ["Closed", 3, "text-emerald-300"],
          ].map(([stage, count, color]: any) => (
            <div key={stage} className="rounded-xl bg-white/5 p-3">
              <div className={`text-[10px] uppercase tracking-wider ${color}`}>{stage}</div>
              <div className="mt-1 text-xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPI label="DAU" value="4,120" delta="+3.1%" icon={Users} />
        <KPI label="Session/day" value="6.8" icon={TrendingUp} />
        <KPI label="7d retention" value="62%" icon={CheckCircle2} accent="text-emerald-300" />
        <KPI label="Plans generated" value="1,847" icon={BarChart3} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
        <div className="mb-3 text-sm font-semibold">Weekly active users</div>
        <div className="flex h-40 items-end gap-2">
          {[45, 60, 55, 72, 68, 80, 78, 92, 88, 95, 100, 96].map((v, i) => (
            <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-blue-400" style={{ height: `${v}%` }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Top feature</div>
          <div className="mt-1 text-lg font-semibold">AI Plan Generator</div>
          <div className="text-xs text-muted-foreground">89% of active users</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-card/60 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Drop-off</div>
          <div className="mt-1 text-lg font-semibold">Device connect</div>
          <div className="text-xs text-muted-foreground">32% skip in onboarding</div>
        </div>
      </div>
    </div>
  );
}
