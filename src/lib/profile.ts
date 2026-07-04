// Basic CRUD for profiles + wallets. Falls back to localStorage when the
// user is not authenticated so the flow keeps working before auth is wired.
import { supabase } from "@/integrations/supabase/client";

export type ProfileRow = {
  user_id?: string;
  full_name?: string | null;
  email?: string | null;
  language?: string | null;
  goal?: string | null;
  race_distance?: string | null;
  weekly_distance_km?: number | null;
  runs_per_week?: number | null;
  pace_5k?: string | null;
  fitness_level?: string | null;
  coach_id?: string | null;
  avatar_url?: string | null;
  onboarded?: boolean;
};

const LS_KEY = "runiq.profile.local";

export function getLocalProfile(): ProfileRow {
  if (typeof localStorage === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
}
export function setLocalProfile(p: ProfileRow) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify({ ...getLocalProfile(), ...p }));
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchProfile(): Promise<ProfileRow> {
  const uid = await getCurrentUserId();
  if (!uid) return getLocalProfile();
  const { data, error } = await (supabase as any)
    .from("profiles").select("*").eq("user_id", uid).maybeSingle();
  if (error || !data) return getLocalProfile();
  return data as ProfileRow;
}

export async function upsertProfile(patch: ProfileRow): Promise<{ ok: boolean; remote: boolean; error?: string }> {
  setLocalProfile(patch);
  const uid = await getCurrentUserId();
  if (!uid) return { ok: true, remote: false };
  const { error } = await (supabase as any)
    .from("profiles")
    .upsert({ user_id: uid, ...patch }, { onConflict: "user_id" });
  if (error) return { ok: false, remote: true, error: error.message };
  return { ok: true, remote: true };
}

// Wallets
export type WalletRow = {
  id?: string;
  provider: string; // midtrans | xendit | googlepay | paypal | card
  method?: string | null; // qris | gopay | shopeepay | ovo | dana | card | paypal
  label?: string | null;
  account_ref?: string | null;
  is_default?: boolean;
};

const WL_KEY = "runiq.wallets.local";
export function getLocalWallets(): WalletRow[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(WL_KEY) || "[]"); } catch { return []; }
}
export function setLocalWallets(w: WalletRow[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(WL_KEY, JSON.stringify(w));
}

export async function listWallets(): Promise<WalletRow[]> {
  const uid = await getCurrentUserId();
  if (!uid) return getLocalWallets();
  const { data } = await (supabase as any).from("wallets").select("*").eq("user_id", uid).order("created_at");
  return (data as WalletRow[]) || [];
}

export async function addWallet(w: WalletRow): Promise<void> {
  const uid = await getCurrentUserId();
  if (!uid) {
    const list = getLocalWallets();
    list.push({ ...w, id: crypto.randomUUID() });
    setLocalWallets(list);
    return;
  }
  await (supabase as any).from("wallets").insert({ user_id: uid, ...w });
}

export async function removeWallet(id: string): Promise<void> {
  const uid = await getCurrentUserId();
  if (!uid) { setLocalWallets(getLocalWallets().filter(w => w.id !== id)); return; }
  await (supabase as any).from("wallets").delete().eq("id", id);
}
