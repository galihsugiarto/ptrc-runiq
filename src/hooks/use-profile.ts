import { useEffect, useState } from "react";
import { fetchProfile, type ProfileRow } from "@/lib/profile";

export function initialsOf(name?: string | null) {
  const n = (name || "").trim();
  if (!n) return "RQ";
  return n
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "RQ";
}

/** Live profile for the signed-in user (falls back to localStorage). */
export function useProfile() {
  const [profile, setProfile] = useState<ProfileRow>({});
  useEffect(() => {
    let alive = true;
    fetchProfile()
      .then((p) => { if (alive) setProfile(p || {}); })
      .catch(() => {});
    const onFocus = () => { fetchProfile().then((p) => setProfile(p || {})).catch(() => {}); };
    if (typeof window !== "undefined") window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      if (typeof window !== "undefined") window.removeEventListener("focus", onFocus);
    };
  }, []);

  const name = profile.full_name?.trim() || "";
  return { profile, name, displayName: name || "Runner", initials: initialsOf(name) };
}
