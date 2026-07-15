import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Target, Activity, Watch, UserCheck, ChevronRight, ArrowLeft, Languages } from "lucide-react";
import { mockConnect, isConnected, type Provider } from "./index";
import { upsertProfile } from "@/lib/profile";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get Started — RUNIQ" },
      { name: "description", content: "Language, goal, baseline, devices and coach." },
    ],
  }),
  component: Onboarding,
});

type Step = 0 | 1 | 2 | 3 | 4;
const STEPS = ["Language", "Goal", "Baseline", "Devices", "Coach"] as const;

function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState<string>("en");
  const [goal, setGoal] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [race, setRace] = useState<string>("");
  const [freq, setFreq] = useState<number>(3);
  const [pace, setPace] = useState<string>("");
  const [fitness, setFitness] = useState<string>("");
  const [coach, setCoach] = useState<string>("");

  const next = () => (step < 4 ? setStep((s) => (s + 1) as Step) : finish());
  const back = () => (step > 0 ? setStep((s) => (s - 1) as Step) : nav({ to: "/" }));

  async function finish() {
    setSaving(true);
    localStorage.setItem("runiq.onboarding.done", "1");
    const payload = {
      language,
      goal,
      race_distance: race || null,
      weekly_distance_km: distance ? Number(distance) : null,
      runs_per_week: freq,
      pace_5k: pace || null,
      fitness_level: fitness || null,
      coach_id: coach || null,
      onboarded: true,
    };
    await upsertProfile(payload);
    setSaving(false);
    nav({ to: "/" });
  }

  return (
    <div className="min-h-screen w-full bg-[#050816] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[420px] flex-col bg-[#0a0f24] px-5 pb-24 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={back} className="rounded-full p-1 text-muted-foreground hover:text-white"><ArrowLeft className="h-5 w-5" /></button>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Step {step + 1} of 5</div>
        </div>

        <div className="mb-6 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-gradient-to-r from-indigo-500 to-blue-500" : "bg-white/10"}`} />
          ))}
        </div>

        <h1 className="mb-1 text-2xl font-bold">{[
          "Choose your language",
          "What's your goal?",
          "Baseline fitness",
          "Connect your devices",
          "Choose a coach",
        ][step]}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{[
          "You can change this later in Settings.",
          "We'll shape your plan around this.",
          "Helps us calibrate paces and volume.",
          "Sync runs automatically from your watch or phone.",
          "Human-approved plans — you can change later.",
        ][step]}</p>

        {step === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Choose Language</div>
              <div className="text-sm text-muted-foreground">Pilih bahasa / Select language</div>
            </div>
            <div className="flex gap-6">
              <button
                onClick={() => setLanguage("en")}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all ${language === "en" ? "border-[#3b82f6] bg-[#3b82f6]/15" : "border-white/10 bg-white/5"}`}
              >
                <span className="text-5xl">🇬🇧</span>
                <span className="text-sm font-semibold">English</span>
              </button>
              <button
                onClick={() => setLanguage("id")}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-6 transition-all ${language === "id" ? "border-[#3b82f6] bg-[#3b82f6]/15" : "border-white/10 bg-white/5"}`}
              >
                <span className="text-5xl">🇮🇩</span>
                <span className="text-sm font-semibold">Bahasa</span>
              </button>
            </div>
          </div>
        )}


        {step === 1 && (
          <div className="space-y-3">
            {[
              { id: "race", label: "Train for a race", icon: Target },
              { id: "fitness", label: "Build general fitness", icon: Activity },
              { id: "weight", label: "Lose weight", icon: UserCheck },
              { id: "return", label: "Return to running", icon: Watch },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setGoal(o.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${goal === o.id ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-card/60"}`}
              >
                <o.icon className="h-5 w-5 text-indigo-400" />
                <span className="font-medium">{o.label}</span>
                {goal === o.id && <Check className="ml-auto h-5 w-5 text-indigo-400" />}
              </button>
            ))}
            {goal === "race" && (
              <div className="mt-3 space-y-2">
                <label className="text-xs text-muted-foreground">Race distance</label>
                <div className="grid grid-cols-4 gap-2">
                  {["5K", "10K", "21K", "42K"].map((d) => (
                    <button key={d} onClick={() => setRace(d)} className={`rounded-xl border py-2 text-sm ${race === d ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-card/60"}`}>{d}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">Fitness level</label>
              <div className="grid grid-cols-3 gap-2">
                {["beginner", "intermediate", "advanced"].map((l) => (
                  <button key={l} onClick={() => setFitness(l)} className={`rounded-xl border py-2 text-sm capitalize ${fitness === l ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-card/60"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">Current weekly distance (km)</label>
              <input value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="e.g. 25" className="w-full rounded-xl border border-white/10 bg-card/60 px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">Runs per week</label>
              <div className="grid grid-cols-6 gap-2">
                {[2, 3, 4, 5, 6, 7].map((n) => (
                  <button key={n} onClick={() => setFreq(n)} className={`rounded-xl border py-2 text-sm ${freq === n ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-card/60"}`}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted-foreground">Comfortable 5K pace (min/km)</label>
              <input value={pace} onChange={(e) => setPace(e.target.value)} placeholder="e.g. 5:45" className="w-full rounded-xl border border-white/10 bg-card/60 px-4 py-3 text-sm" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            {(
              [
                ["strava", "Strava"],
                ["garmin", "Garmin"],
                ["apple-health", "Apple Health"],
                ["google-fit", "Google Fit / Android"],
                ["huawei-health", "Huawei Health"],
                ["myfitnesspal", "MyFitnessPal"],
                ["whoop", "Whoop"],
              ] as [Provider, string][]
            ).map(([id, label]) => {
              const on = isConnected(id);
              return (
                <button key={id} onClick={() => { mockConnect(id, label); setTimeout(() => setStep((s) => s), 500); }} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-card/60 p-4 text-left">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/5"><Watch className="h-4 w-4" /></div>
                  <span className="font-medium">{label}</span>
                  <span className={`ml-auto rounded-full px-3 py-1 text-xs ${on ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-muted-foreground"}`}>{on ? "Connected" : "Connect"}</span>
                </button>
              );
            })}
            <p className="pt-2 text-xs text-muted-foreground">You can skip and connect later from Settings.</p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            {[
              { id: "sarah", name: "Sarah Mitchell", specialty: "Marathon Specialist", price: "Rp 350.000/bulan" },
              { id: "marcus", name: "Marcus Chen", specialty: "Speed & Track", price: "Rp 500.000/bulan" },
              { id: "ai", name: "AI Coach only", specialty: "Auto-generated plans", price: "Termasuk RUNIQ Pro (Rp 35.000/bulan)" },
              { id: "skip", name: "Skip for now", specialty: "Decide later from Settings", price: "—" },
            ].map((c) => (
              <button key={c.id} onClick={() => setCoach(c.id)} className={`w-full rounded-2xl border p-4 text-left ${coach === c.id ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-card/60"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.specialty}</div>
                  </div>
                  <div className="text-xs font-semibold text-indigo-300">{c.price}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-6">
          <button
            onClick={next}
            disabled={saving || (step === 1 && !goal) || (step === 4 && !coach)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold shadow-lg disabled:opacity-40"
          >
            {saving ? "Saving…" : step === 4 ? "Finish" : "Continue"} <ChevronRight className="h-4 w-4" />
          </button>
          {step === 3 && (
            <Link to="/onboarding" onClick={() => setStep(4)} className="mt-3 block text-center text-xs text-muted-foreground">Skip for now</Link>
          )}
        </div>
      </div>
    </div>
  );
}
