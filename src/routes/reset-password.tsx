import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Activity, Lock, Eye, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — RUNIQ" },
      { name: "description", content: "Set a new password for your RUNIQ account" },
    ],
  }),
  component: ResetPasswordPage,
});

function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl shadow-brand"
      style={{ width: size, height: size, background: "var(--gradient-brand)" }}
    >
      <Activity className="text-white" size={size * 0.55} strokeWidth={2.5} />
    </div>
  );
}

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      setRecovery(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password.trim() || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error: supaError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (supaError) {
      setError(supaError.message);
    } else {
      setUpdated(true);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#050816] text-foreground">
      <div className="mx-auto flex max-w-[420px] flex-col">
        <div className="relative min-h-screen overflow-hidden bg-[#0a0f24] px-6 pt-20">
          <div className="flex flex-col items-center">
            <Logo size={64} />
            <h1 className="mt-4 text-3xl font-black tracking-wider text-gradient-brand">
              New Password
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Set a new password for your account
            </p>
          </div>

          {!recovery && !updated && (
            <div className="mt-12 text-center text-sm text-muted-foreground">
              Invalid or expired reset link. Please request a new one.
            </div>
          )}

          {updated ? (
            <div className="mt-12 flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
                <Check size={28} className="text-green-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your password has been updated successfully.
              </p>
              <Link to="/" className="text-sm font-semibold text-[#3b82f6]">
                Go to login
              </Link>
            </div>
          ) : recovery ? (
            <form onSubmit={handleSubmit} className="mt-12 space-y-5">
              <div>
                <label className="text-sm font-medium">New Password</label>
                <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <Lock size={18} className="text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}>
                    <Eye size={18} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-4 font-semibold text-white shadow-brand disabled:opacity-40"
              >
                {loading ? "Updating..." : "Update Password"} <ArrowRight size={18} />
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
