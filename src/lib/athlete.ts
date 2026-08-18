// Real athlete data (activities, daily metrics, planned sessions) from Lovable Cloud.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ActivityRow = {
  id: string;
  title: string;
  source: string;
  started_at: string;
  distance_km: number;
  duration_sec: number;
  avg_pace: string | null;
  avg_hr: number | null;
  feel: string | null;
  notes: string | null;
};

export type MetricRow = {
  id: string;
  metric_date: string;
  hrv_ms: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  training_load: number | null;
  readiness_score: number | null;
};

export type SessionRow = {
  id: string;
  session_date: string;
  session_type: string;
  distance_km: number | null;
  duration_min: number | null;
  zone: string | null;
  description: string | null;
  completed: boolean;
};

async function uid() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - day);
  return x;
}

export function fmtDuration(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

export function paceOf(distanceKm: number, durationSec: number) {
  if (!distanceKm || !durationSec) return "—";
  const secPerKm = durationSec / distanceKm;
  return `${Math.floor(secPerKm / 60)}:${String(Math.round(secPerKm % 60)).padStart(2, "0")}/km`;
}

/** Live athlete data for the signed-in user. Empty arrays when nothing is logged yet. */
export function useAthleteData() {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const id = await uid();
    if (!id) { setLoading(false); return; }
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
    const weekStart = startOfWeek();
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    const [a, m, s] = await Promise.all([
      (supabase as any).from("activities").select("*").eq("user_id", id).gte("started_at", since).order("started_at", { ascending: false }),
      (supabase as any).from("daily_metrics").select("*").eq("user_id", id).order("metric_date", { ascending: false }).limit(28),
      (supabase as any).from("training_sessions").select("*").eq("user_id", id).gte("session_date", iso(weekStart)).lt("session_date", iso(weekEnd)).order("session_date"),
    ]);
    setActivities((a.data as ActivityRow[]) || []);
    setMetrics((m.data as MetricRow[]) || []);
    setSessions((s.data as SessionRow[]) || []);
    setLoading(false);
  }

  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  return { activities, metrics, sessions, loading, reload: load };
}

export async function logActivity(a: {
  title: string; source?: string; started_at?: string; distance_km: number; duration_sec: number;
  avg_hr?: number | null; feel?: string | null; notes?: string | null;
}) {
  const id = await uid();
  if (!id) return { ok: false, error: "Not signed in" };
  const { error } = await (supabase as any).from("activities").insert({
    user_id: id,
    title: a.title,
    source: a.source ?? "RUNIQ Record",
    started_at: a.started_at ?? new Date().toISOString(),
    distance_km: a.distance_km,
    duration_sec: a.duration_sec,
    avg_pace: paceOf(a.distance_km, a.duration_sec),
    avg_hr: a.avg_hr ?? null,
    feel: a.feel ?? null,
    notes: a.notes ?? null,
  });
  return { ok: !error, error: error?.message };
}
