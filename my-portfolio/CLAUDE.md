# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Next.js dev server on http://localhost:3000
npm run build    # production build (also the fastest full type-check)
npm run start    # serve the production build
npm run lint     # ESLint (flat config, extends next/core-web-vitals + next/typescript)
npx tsc --noEmit # standalone type-check without building
```

There is no test runner configured.

## Big picture

Next.js 16 App Router (React 19, Tailwind v4 via `@tailwindcss/postcss`, TypeScript strict). Import alias `@/*` maps to the repo root. This one project hosts **three independent surfaces** that share nothing but the framework:

1. **`app/(main)/`** — Karan Bedi's portfolio. Route group with its own `layout.tsx` (Navbar + centered `<main>` + footer), zinc/amber dark theme. Each page is a thin wrapper that renders one component from `components/sections/`. Static resume/project data lives in `data/content.ts` (`skills`, `projects`, `leadership`). Nav routes are listed in `components/layout/Navbar.tsx`.
2. **`app/tanisha/`** — a separate person's portfolio with its own inline layout and slate/cyan theme. Independent of `(main)`; don't factor shared components across the two.
3. **`app/planner/`** — a private personal-productivity app (`robots: noindex`). This is where nearly all the logic is — see below.

The root `app/layout.tsx` only sets `<html>`/`<body>` and global CSS; each surface's real chrome is in its own layout.

### Content-from-filesystem API routes

Three GET routes read Markdown from `public/` at request time (`fs.readdirSync` on `process.cwd()`), so content is added by dropping `.md` files, not by editing code:

- `app/api/vault/route.ts` → `public/code-vault/<category>/*.md` (category folders are hardcoded in the route; note mixed casing like `LinkedLists`, `Heaps`).
- `app/api/automotive/route.ts` → `public/carcontent/*.md`, parsing title/excerpt/reading-time from the file body.
- The markdown itself is fetched client-side from `/code-vault/...` / `/carcontent/...` (static public assets) and rendered with `react-markdown` + `remark-gfm`.

### Risk demo

`components/sections/RiskDemoSection.tsx` POSTs to `${NEXT_PUBLIC_RISK_API_URL}/predict` — an external ML service (deployed separately on Railway). The URL is baked in `next.config.ts` with a hardcoded default; override via `.env.local` (see `.env.local.example`). The UI degrades gracefully when the var is unset.

## The planner (`components/planner/`)

A single-user "psycho-cybernetic" daily planner. Architecture, from the inside out:

- **State shape**: `types.ts`. One big `PlannerState` object; `days` is a map keyed by IST date string.
- **Persistence & migrations**: `store.ts`. `localStorage` key `planner_state_v1`, `STATE_VERSION = 3`. `normalizeLoaded()` runs versioned migrations (`migrateV1toV2` → `migrateV2toV3`) then a defensive `hydrateMissing()`; every migration preserves lived user data (xp, streak, days) and only default-fills new fields. **When you add a field to `PlannerState`, add it to `createDefaultState`, the `fillV*Fields` helpers, and `hydrateMissing`, and bump `STATE_VERSION` with a new migrate hop if the shape changes.**
- **Reducer**: `reducer.ts`. Pure. All mutations go through the `Action` union. `PlannerBoard.tsx` is the only `useReducer` host and wires everything together.
- **The servo loop**: `servo.ts`. Pure functions, no I/O, no React. `runDailyTick()` runs once per IST day boundary (idempotent via `lastEvalDate`): finalizes past-day "alignment" scores, updates per-title stats, applies streak grace/reset, applies small capped auto-nudges to block durations, recomputes per-goal weights, and logs every adjustment to a nudge feed. The constants at the top of the file are the servo's gains — small, capped, rate-limited by design.
- **Time**: everything is IST (`Asia/Kolkata`) via helpers in `util.ts` (`istDateString`, `istNowMinutes`, …). Never use raw `Date` for calendar logic here.
- **Claude coaching bridge**: `claudeBridge.ts`. `buildTodayCard()` produces a prompt the user pastes into claude.ai; `parseTomorrow()` strictly extracts the LAST fenced ```` ```planner ```` block from the reply and validates it into a `TomorrowPatch`. The strict parser exists so a pasted full conversation resolves to the final plan, not an example.
- **Optional cloud sync**: `sync.ts` (client) ↔ `app/api/planner/sync/route.ts` + `app/api/planner/event/route.ts` ↔ `lib/plannerSync.ts` (server). Backing store is Upstash Redis over its REST API — **no SDK, plain `fetch`**, matching the repo's zero-extra-deps convention. localStorage stays authoritative; sync is a document-level, rev-gated CAS layer on top (Lua `EVAL` for atomic compare-and-set; higher server rev wins, stale writes get 409 → client pulls and adopts). Every server helper degrades to a clear "not configured" 503 when env vars are absent.

### Planner env vars (all optional; sync/sensors disabled without them)

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis REST creds.
- `PLANNER_SYNC_KEY` — shared secret; clients pass it as `x-planner-key` header or `?key=`. Compared constant-time (SHA-256 + `timingSafeEqual`).

The `/api/planner/event` route is a "real-life sensor" endpoint: iPhone Shortcuts POST a distraction event, the evening routine GETs the accumulated list and DELETEs to clear.

## Conventions

- Zero-extra-dependency bias: prefer `fetch` and platform APIs over adding SDKs.
- Planner logic files (`servo.ts`, `reducer.ts`, migration helpers in `store.ts`) are pure and must stay that way — I/O and React state live in `PlannerBoard.tsx` and `sync.ts`.
- API routes that touch Upstash set `runtime = "nodejs"` and `dynamic = "force-dynamic"`.
