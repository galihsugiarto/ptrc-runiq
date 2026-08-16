# 🏃 RUNIQ — AI Coding Guidelines & Architecture Standard
## Dual-Engine Workflow: Claude (Chief Architect) + DeepSeek/Cursor (UI Developer)

> **WAJIB DIBACA SEBELUM MENYENTUH KODE APAPUN.**
> File ini adalah sumber kebenaran tunggal untuk arsitektur RUNIQ.
> Jika ada konflik antara file ini dan kode yang ada, ikuti file ini.

---

## 1. STACK — BACA BAIK-BAIK

```
Runtime:       Bun (BUKAN npm/yarn — selalu gunakan: bun install)
Framework:     TanStack Start (BUKAN Next.js — jangan import dari next/*)
Styling:       Tailwind CSS v4
UI Components: Shadcn/ui (import dari @/components/ui/*)
Icons:         Lucide React
Database:      Supabase (PostgreSQL + pgvector + RLS)
Auth:          Supabase Auth
AI:            Anthropic Claude API (via /api/ai-notes.js — Vercel serverless)
Deploy:        Vercel (build: bun run build, install: bun install)
Repo:          github.com/galihsugiarto/ptrc-runiq
```

**⚠️ CRITICAL:** Ini BUKAN Next.js. Jangan gunakan:
- `next/navigation`, `next/image`, `next/link`, `next/router`
- `getServerSideProps`, `getStaticProps`
- App Router conventions (`page.tsx`, `layout.tsx` di folder pages)

---

## 2. STRUKTUR FILE — JANGAN DIUBAH TANPA IZIN CLAUDE

```
src/
├── routes/
│   ├── index.tsx        ← MAIN APP — semua screen athlete (3000+ lines)
│   ├── onboarding.tsx   ← Onboarding flow (athlete + coach)
│   ├── coach.tsx        ← Coach console
│   ├── admin.tsx        ← Admin dashboard (4 roles)
│   └── __root.tsx       ← Root layout — JANGAN DISENTUH
├── assets/
│   └── logo-runiq.png   ← Logo resmi — JANGAN diganti
├── styles.css           ← CSS variables & brand colors
└── integrations/
    └── supabase/
        └── client.ts    ← Supabase client — JANGAN diedit manual

api/
├── ai-notes.js          ← Claude API proxy
├── lark-bot.js          ← Lark bot integration
└── strava/
    └── callback.js      ← Strava OAuth callback

public/
└── logo-runiq.png       ← Logo untuk PWA/favicon
```

---

## 3. BRAND COLORS — WAJIB KONSISTEN

```
CYAN (Primary):     #00D4C8  ← tombol CTA, highlight, active states
LIME (Accent):      #EEFF41  ← secondary accent, badges sukses
NAVY (Background):  #0A1628  ← main background
NAVY-2 (Surface):   #0D1E35  ← card/surface background
NAVY-3 (Elevated):  #0F2040  ← elevated cards, modals
CORAL (Error/Rest): #FF6B4A  ← rest day, missed session, error
WHITE (Text):       #F8FAFC  ← primary text
MUTED (Text):       #6B7099  ← secondary/muted text
BORDER:             rgba(0,212,200,0.15) ← subtle borders
```

**Gradient brand:**
```css
background: linear-gradient(135deg, #00D4C8 0%, #00BFA5 100%);
/* Tailwind: bg-gradient-brand (sudah didefinisikan di styles.css) */
```

**❌ DILARANG menggunakan warna lama:**
- `#3b82f6` (blue) — sudah diganti cyan
- `#7c3aed` (purple) — sudah diganti cyan
- `#a855f7` (light purple) — sudah diganti

---

## 4. LAYOUT MOBILE-FIRST — ATURAN WAJIB

```tsx
// ✅ Container utama app
<div className="mx-auto flex max-w-[420px] flex-col min-h-screen">

// ✅ TopBar — fixed, tidak ikut scroll
<header className="fixed top-0 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2
                   flex items-center justify-between border-b border-white/5
                   bg-[#0D1E35] px-5 py-4">

// ✅ TabBar — fixed bottom, dibatasi lebar
<nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2
                border-t border-white/5 bg-[#0D1E35]/95 backdrop-blur">

// ✅ Main content — scrollable dengan padding untuk header+footer
<main className="flex-1 overflow-y-auto pb-28 pt-[70px]">
```

**Rules:**
- Mobile max-width: `max-w-[420px]` (bukan `max-w-md`)
- Semua `fixed` element WAJIB pakai `left-1/2 -translate-x-1/2 max-w-[420px]`
- Jangan pakai `overflow-hidden` di container utama
- Scroll reset saat ganti screen: `document.querySelector("main")?.scrollTo(0, 0)`

---

## 5. SSR SAFETY — CRITICAL, JANGAN DIABAIKAN

TanStack Start menjalankan kode di **server sebelum browser**. Ini menyebabkan crash jika akses browser APIs di luar useEffect.

```typescript
// ✅ BENAR
useEffect(() => {
  if (typeof window === "undefined") return;
  localStorage.getItem("key");
  window.location.href = "...";
  navigator.geolocation.getCurrentPosition(...);
}, []);

// ❌ SALAH — akan crash di server
const val = localStorage.getItem("key");
window.location.href = "...";
confirm("Are you sure?");
```

**APIs yang WAJIB di-guard:**
`localStorage` · `sessionStorage` · `window.*` · `navigator.*` · `confirm()` · `alert()` · `document.*`

**Subscription Supabase Auth WAJIB di-cleanup:**
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...);
  return () => subscription.unsubscribe(); // ← WAJIB
}, []);
```

---

## 6. SUPABASE — ATURAN DATABASE

### Tables yang sudah ada:
```
profiles          ← user data (athlete & coach), role, city, subscription_tier
daily_metrics     ← HRV, sleep, training_load, readiness_score (per hari)
training_plans    ← plan mingguan (status: pending_review | approved | active)
training_sessions ← sesi individual per plan
activities        ← aktivitas selesai (dari Strava/Garmin/manual)
messages          ← pesan coach-athlete (conversation_id based)
oauth_tokens      ← token Strava/Garmin/Apple (unique per user+provider)
coach_athletes    ← relasi coach-athlete (status, package, price)
```

### Rules wajib:
```typescript
// ✅ Selalu import dari sini
import { supabase } from "@/integrations/supabase/client";

// ✅ Selalu handle error
const { data, error } = await supabase.from("profiles").select("*").eq("id", userId);
if (error) { console.error(error); return; }

// ❌ JANGAN buat client baru
import { createClient } from "@supabase/supabase-js"; // DILARANG di frontend

// ❌ JANGAN bypass RLS
// service_role key hanya boleh di server/Edge Functions
```

### RLS aktif di semua tabel:
- User hanya akses data milik sendiri (`user_id = auth.uid()`)
- Coach bisa akses data athlete mereka
- Admin menggunakan Edge Functions dengan service_role

---

## 7. KOMPONEN — JANGAN BUAT ULANG YANG SUDAH ADA

### Komponen yang sudah ada di `index.tsx`:
```
AvatarC({ initials, color, size })     ← avatar dengan initials
TopBar({ onNotifications, onAvatar, onSettings })
TabBar({ screen, setScreen })
LiveMap({ active })                    ← GPS map saat recording
CoachPackageSelector({ price, coachFirstName })
FindFriendView()
FindCommunityView()
EditProfileView()
OnboardingAdjustView()
SubscriptionView()
ConnectAppsView()
```

### Pattern komponen baru:
```tsx
// ✅ Komponen baru: selalu functional, TypeScript, Tailwind
function NewComponent({ prop }: { prop: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0D1E35] p-4">
      {prop}
    </div>
  );
}
```

---

## 8. GIT WORKFLOW — DUAL ENGINE

### Pembagian tugas:

| Tugas | Engine | Branch |
|---|---|---|
| Arsitektur baru, Supabase schema, Edge Functions | **Claude** | `main` |
| Breaking error, SSR crash, logic kompleks | **Claude** | `main` |
| UI baru, styling, layout, komponen form/card | **DeepSeek** | `ui/nama-fitur` |
| Bug fix tampilan, warna, spacing | **DeepSeek** | `fix/nama-bug` |

### Rules DeepSeek WAJIB ikuti:
```bash
# 1. Selalu mulai dari branch baru
git checkout -b ui/nama-fitur

# 2. Atomic commits dengan pesan jelas
git commit -m "fix(ui): restrict TabBar width on desktop"
git commit -m "feat(ui): add coach profile card component"

# 3. JANGAN langsung push ke main
# Buat PR → Claude review → merge

# 4. Install selalu pakai bun
bun install  # bukan npm install
```

### File yang TIDAK BOLEH disentuh DeepSeek tanpa izin Claude:
- `src/routes/__root.tsx`
- `src/integrations/supabase/client.ts`
- `vercel.json`
- `vite.config.ts`
- `api/*.js` (semua serverless functions)
- `CLAUDE.md` (file ini)

---

## 9. ATOMIC COMMITS — STANDAR PESAN

```
feat(scope):  fitur baru
fix(scope):   bug fix
style(scope): perubahan tampilan/CSS saja
refactor:     refactor tanpa perubahan behavior
chore:        update dependency, config
docs:         update dokumentasi

Contoh:
feat(coach): add coach onboarding step 1 form
fix(ui): restore scroll position on tab change
style(brand): update primary color to cyan #00D4C8
fix(ssr): guard window access in useEffect
```

---

## 10. ENVIRONMENT VARIABLES

```bash
# Vercel Production (sudah diset)
VITE_SUPABASE_URL=https://dpurgddoeprqixhdnupa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role — server only]
ANTHROPIC_API_KEY=[claude api key]
STRAVA_CLIENT_SECRET=[strava secret]
VITE_STRAVA_CLIENT_ID=266921
LARK_APP_ID=cli_aaec7cd20078de15
LARK_APP_SECRET=[lark secret]

# Local dev — buat .env.local (JANGAN commit ke Git)
```

**⚠️ JANGAN PERNAH commit credentials ke Git. GitHub akan auto-reject.**

---

## 11. ESKALASI — KAPAN HARUS PANGGIL CLAUDE

DeepSeek WAJIB berhenti dan eskalasi ke Claude jika menemukan:

| Situasi | Action |
|---|---|
| SSR crash / "window is not defined" | Stop → Claude |
| Supabase RLS error / auth error | Stop → Claude |
| Build error di Vercel | Stop → Claude |
| Perlu schema tabel baru | Stop → Claude |
| Perlu Edge Function baru | Stop → Claude |
| Breaking change yang affect > 1 file utama | Stop → Claude |
| Error yang tidak bisa di-fix dalam 3 percobaan | Stop → Claude |

---

## 12. ISSUE TRACKER (STATUS TERKINI)

| No | Issue | Status |
|---|---|---|
| 3 | Nama user masih dummy | 🟢 Selesai (profil real dari Supabase/local) |
| 6b | Map fullscreen saat recording | 🟢 Selesai |
| 8a | Brand colors | 🟢 Selesai |
| 8b | CSS tokens | 🟢 Selesai |
| 8c | Logo RUNIQ | 🟢 Selesai |
| 9 | Calendar colors | 🟢 Selesai |
| 10 | Scroll reset saat pindah tab | 🟢 Selesai |
| 1b-1f | Coach onboarding flow | 🟢 Selesai |
| 7 | Sticky header + fixed TabBar | 🟢 Selesai |
| 14 | Login real (Supabase signInWithPassword) — email/password asal ditolak | 🟢 Selesai |
| 15 | Signup real ke Supabase Auth (name, gender, dob, role tersimpan di profiles) | 🟢 Selesai |
| 16 | Role routing: akun coach diarahkan ke /coach, bukan menu athlete | 🟢 Selesai |
| 17 | Data dummy "Andi Pratama" di Settings diganti data profil asli | 🟢 Selesai |
| 18 | Coach console interaktif (tab, detail runner, chat kirim pesan, approve plan, settings + logout, notifikasi) | 🟢 Selesai |
| 19 | Coach console pakai brand color cyan/navy (bukan indigo/purple lama) | 🟢 Selesai |
| 20 | Nama coach di header diambil dari profil asli (bukan "Sarah Mitchell") | 🟢 Selesai |

**DeepSeek JANGAN sentuh issue yang statusnya 🟡 In Progress (Claude).**

---

## 13. KONTEKS PRODUK

**RUNIQ** = AI-powered running coaching marketplace Indonesia.
- Two-sided platform: Athlete ↔ Coach
- AI (Claude) generate plan → Coach approve → Athlete lihat
- Legal entity: CV Garuda Dharma Aksara, Jakarta
- Live URL: ptrc-runiq.vercel.app
- Tagline: "Push. Pace. Progress."

**Ekosistem PTRC:**
Running Keliling (community runs) · Bogor City Half Marathon 2027 · The Runners High (podcast) · RUNIQ (app) · Apparel line

---

*Maintained by: Claude (Chief Architect)*
*Last updated: July 2026*
*Version: 2.0 (merged from Claude draft + DeepSeek draft)*
