# Neo-Brutalism Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current soft-editorial visual language (serif type, sage/cream palette, glassmorphism, soft shadows, expo-eased motion) with a full, raw Neo-Brutalist design system across every page and component of the Browse AI site, while keeping the sage-green brand color recognizable in a bolder form.

**Architecture:** No test suite exists in this repo (pure Next.js/React frontend, no Jest/Vitest/Playwright configured). Verification per task is therefore: (1) a `grep` gate proving zero leftover old-palette hex values / soft-shadow patterns / glass classes remain in the touched files, and (2) a browser check of the affected page via the dev server (screenshot + `read_page`), which stands in for the "run tests" step throughout this plan.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, framer-motion, lucide-react, TypeScript. No component library — all styling is Tailwind utility classes plus inline `style={{}}` objects with hardcoded hex values.

## Global Constraints

- Every task's changes must compile with zero TypeScript/ESLint errors (`npm run lint`).
- No new dependencies — Neo-Brutalism is achieved with existing Tailwind v4 + CSS custom properties + framer-motion, no new packages.
- Third-party brand colors (Google's `#4285F4`/`#34A853`/`#FBBC05`/`#EA4335` "G" logo colors in `AuthModal.tsx`) are **never** touched — they are fixed regardless of site theme.
- `BrandCard.tsx`'s per-brand color palette (a distinct hue per fashion brand, ~12 brand colors) is **kept** as a deliberate color-coded system — see Task 5 for its specific (non-generic) conversion rule.
- Corner radius is `0` everywhere **except** true circular icon-only buttons/avatars (single icon, `aspect-square`, no text), which keep `rounded-full`.
- All shadows become hard, unblurred, offset shadows: `Npx Npx 0 var(--ink)` — never `blur`/`rgba(...,0.NN)` soft shadows.
- All `backdrop-filter`/`backdropFilter`/`.glass`/`.glass-dark` usage is removed — replaced with solid `var(--surface)` (light) or solid `var(--ink)` (dark) fills.

### Design tokens (defined in Task 1, referenced by every later task)

```
--bg:          #FDF8EC   /* warm cream base */
--surface:     #FFFFFF
--ink:         #111111   /* near-black — all text + all borders */
--ink-muted:   #4A4A4A   /* secondary/meta text — consolidates the old scattered greys */
--accent:      #3F8F46   /* saturated grass-sage — primary brand/CTA */
--accent-dark: #245E29   /* pressed/shadow state of accent, and BrandCard dark variants */
--accent-soft: #CFEAC9   /* light fill for tags/backgrounds */
--pop:         #FF4FA3   /* hot pink — high-emphasis CTA/badge clash accent */
--warn:        #F5C518   /* acid yellow — discount tags, "AI"/highlight accents */
--error:       #E8412C   /* form validation error state (was soft #E57373 in AuthModal) */
```

`--ink-muted` and `--error` are small, necessary extensions of the 7-token palette approved in the design spec (text hierarchy and form-error state weren't enumerated there but are required to implement it).

### Hex → token conversion map

Apply verbatim in every task below. "Old hex(es) found" lists come from a full-repo grep done during planning; a file may contain a subset.

| Old hex(es) | New value |
|---|---|
| `#0F0F0E`, `#1A1A1A`, `#111110`, `#2A2A2A` | `var(--ink)` |
| `#6B6B6B`, `#58574F`, `#4A4A4A`, `#555555`, `#555`, `#4B4B4B`, `#3A3A3A`, `#666`, `#888`, `#8B8B8B`, `#9B9B9B`, `#9B9B94`, `#AAAAAA`, `#BBBBBB`, `#CCCCCC`, `#C0BDB6` | `var(--ink-muted)` |
| `#7A9E74` | `var(--accent)` |
| `#4D7A47`, `#28663E` (generic, non-BrandCard uses) | `var(--accent-dark)` |
| `#EEF4EE`, `#E2F0E6`, `#E6EEE3`, `#a8c4a4`, `#b4cbb0`, `#c8d8c5` | `var(--accent-soft)` |
| `#FAFAF8`, `#F5EDD8` | `var(--bg)` |
| `#FFFFFF`, `#ffffff` | `var(--surface)` |
| `#E8E0D4`, `#D4C4A8`, `#EDE9E1`, `#D0CCC4`, `#F2EDE4`, `#C4A882`, `#F0EDE8`, `#E6E2DA`, `#E0DDD6`, `#EDE8E0`, `#EAE5DC`, `#8B7355`, `#DDD5C6`, `#9B8877`, `#EDEAE4` | Decorative/background instances (dividers, fallback-image gradients, prose rules) → `var(--bg)`. Instances functioning as an "AI/assistant" accent highlight (ChatPanel bot avatar ring, EditCard header icon tint, FilterDrawer "AI suggested" tag) → `var(--warn)`. |
| `#E57373` | `var(--error)` |
| `#34A853`, `#4285F4`, `#EA4335`, `#FBBC05` (AuthModal Google icon only) | **Do not change** |

### Shape/shadow/motion formulas

- **Border:** `border: 3px solid var(--ink)` on cards/buttons/inputs/modals/nav; `border: 2px solid var(--ink)` on small chips/tags/badges.
- **Radius:** replace every `rounded-2xl` / `rounded-xl` / `rounded-3xl` / `rounded-sm` / `rounded-bl` / `rounded-br` with no radius class (sharp). Replace `rounded-full` with no radius class **unless** the element is a true icon-only circle (bookmark button, avatar, close button) — those keep `rounded-full`.
- **Shadow (large: cards, modals, hero elements):** rest `4px 4px 0 var(--ink)` → hover `7px 7px 0 var(--ink)` + `translate(-2px,-2px)` → active `0 0 0 var(--ink)` + `translate(4px,4px)`. Transition: `box-shadow 150ms ease-out, transform 150ms ease-out`.
- **Shadow (small: badges, chips, icon buttons):** rest `2px 2px 0 var(--ink)` → hover `4px 4px 0 var(--ink)` + `translate(-1px,-1px)` → active `0 0 0 var(--ink)` + `translate(2px,2px)`.
- **Shadow (extra-large: hero search card, primary CTA):** rest `6px 6px 0 var(--ink)` → hover `9px 9px 0 var(--ink)` + `translate(-3px,-3px)`.
- **Easing:** any `cubic-bezier(0.19,1,0.22,1)`, `cubic-bezier(0.165,0.84,0.44,1)`, or `cubic-bezier(0.25,1,0.5,1)` used for hover/press micro-interactions → `ease-out`, duration ≤150ms. Scroll-entrance reveals (word/char/line reveal, page-enter) keep their translateY mechanic but switch to `cubic-bezier(0.4,0,0.2,1)` and cut duration by ~30% (e.g. 0.95s → 0.65s, 0.9s → 0.6s). Elastic "pop" curves (`cubic-bezier(0.34,1.56,0.64,1)` — icon-pop, pill-activate, scale-in, bookmark-pop) are already snappy/short and are **kept as-is**, capped at 250ms if longer.
- **3D tilt removal:** `ProductCard.tsx`'s mouse-tracked `rotateX`/`rotateY`/`transformPerspective` (via `useMotionValue`/`useTransform`/`useSpring`) is removed and replaced with a fixed alternating rotation (`-1deg` for even grid index, `+1deg` for odd) applied on hover alongside the hard-shadow lift. `CardTilt.tsx` (the reusable wrapper) is retuned the same way.
- **Glass removal:** `rgba(255,255,255,0.68)` + `backdrop-filter: blur(18px)` panels (`.glass`) → solid `var(--surface)` + `border-brutal` + `shadow-brutal`. `rgba(17,17,16,0.88)` + blur (`.glass-dark`) → solid `var(--ink)` fill.
- **Deleted files:** `src/components/ui/AmbientOrbs.tsx`, `src/components/ui/CursorGlow.tsx` (soft glow/blur effects have no brutalist equivalent — dropped, not replaced).

---

## Task 1: Foundations — tokens, fonts, utility classes

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: CSS custom properties `--bg`, `--surface`, `--ink`, `--ink-muted`, `--accent`, `--accent-dark`, `--accent-soft`, `--pop`, `--warn`, `--error` (consumed by every later task). Utility classes `.border-brutal`, `.border-brutal-thin`, `.shadow-brutal` / `.shadow-brutal-sm` / `.shadow-brutal-lg`, `.card-brutal`, `.tag-brutal`, `.btn-brutal` / `.btn-brutal-accent` / `.btn-brutal-pop`, `.font-display`, `.font-mono-brutal` (all consumed by every later task). Font CSS variables `--font-archivo-black`, `--font-space-grotesk`, `--font-space-mono` (produced by `layout.tsx`, consumed by `globals.css` and any component setting `fontFamily` inline).

- [ ] **Step 1: Replace the `:root` token block in `globals.css`**

Replace lines 3–14 (the old `:root { --background: ...; }` block) with:

```css
:root {
  --bg: #FDF8EC;
  --surface: #FFFFFF;
  --ink: #111111;
  --ink-muted: #4A4A4A;
  --accent: #3F8F46;
  --accent-dark: #245E29;
  --accent-soft: #CFEAC9;
  --pop: #FF4FA3;
  --warn: #F5C518;
  --error: #E8412C;
}
```

- [ ] **Step 2: Update the `body` base styles**

Replace the existing `body { ... }` block with:

```css
body {
  background-color: var(--bg);
  color: var(--ink);
  font-family: var(--font-space-grotesk), 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

::selection { background: var(--pop); color: var(--surface); }
```

(This replaces the old `::selection { background: #7A9E74; color: white; }` rule — search for it and update in place rather than duplicating.)

- [ ] **Step 3: Remove soft-effect utility classes no longer used by any component**

Delete these blocks entirely from `globals.css` (their keyframes and any code referencing them are removed in later tasks — `AmbientOrbs.tsx` deletion in Task 3, `page.tsx` glass/pulse-glow usage rewritten in Task 4):

- `@keyframes float` + `.animate-float` / `.animate-float-delayed` / `.animate-float-slow`
- `.glass` and `.glass-dark`
- `@keyframes pulseGlow` + `.animate-pulse-glow`
- `.btn-fancy` and its `::before`/`span`/`:hover` rules
- `.btn-dual` and its `.txt-a`/`.txt-b` rules
- `.gradient-text` (and its dependency on `@keyframes shimmer` — check `@keyframes shimmer` isn't used elsewhere first; it is also used by `@keyframes skeletonShimmer`'s sibling rule `.animate-img-shimmer`/skeleton comments, so keep `@keyframes shimmer` only if still referenced — it is not, `skeletonShimmer` is its own separate `@keyframes`, so `shimmer` can be deleted alongside `gradient-text`)
- `.font-cormorant` (superseded by `.font-display`/`.font-mono-brutal` below)

- [ ] **Step 4: Retune `.underline-slide` to a snappy duration**

Find:
```css
.underline-slide::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
```
Replace the `transition` line with:
```css
  transition: transform 0.15s ease-out;
```

- [ ] **Step 5: Retune scroll-entrance keyframe durations**

In the `.word-reveal`, `.char-reveal`, `.line-reveal`, and `.eyebrow-in` rules, replace `var(--ease-expo)` usage and durations per the Global Constraints formula:

```css
.word-reveal {
  display: inline-block;
  animation: wordReveal 0.65s cubic-bezier(0.4,0,0.2,1) both;
  will-change: transform;
}
.char-reveal {
  display: inline-block;
  animation: charReveal 0.7s cubic-bezier(0.4,0,0.2,1) both;
  will-change: transform;
}
.line-reveal {
  display: inline-block;
  animation: lineReveal 0.6s cubic-bezier(0.4,0,0.2,1) both;
  will-change: transform;
}
.eyebrow-in {
  animation: eyebrowIn 0.5s cubic-bezier(0.4,0,0.2,1) both;
}
```

- [ ] **Step 6: Add the brutalist utility classes**

Append to the end of `globals.css`:

```css
/* ─── Brutalist type ─── */
.font-display {
  font-family: var(--font-archivo-black), 'Arial Black', sans-serif;
}
.font-mono-brutal {
  font-family: var(--font-space-mono), 'Courier New', monospace;
}

/* ─── Brutalist border ─── */
.border-brutal { border: 3px solid var(--ink); }
.border-brutal-thin { border: 2px solid var(--ink); }

/* ─── Brutalist hard shadow (rest / hover / active) ─── */
.shadow-brutal {
  box-shadow: 4px 4px 0 var(--ink);
  transition: box-shadow 150ms ease-out, transform 150ms ease-out;
}
.shadow-brutal:hover { box-shadow: 7px 7px 0 var(--ink); transform: translate(-2px, -2px); }
.shadow-brutal:active { box-shadow: 0 0 0 var(--ink); transform: translate(4px, 4px); }

.shadow-brutal-sm {
  box-shadow: 2px 2px 0 var(--ink);
  transition: box-shadow 150ms ease-out, transform 150ms ease-out;
}
.shadow-brutal-sm:hover { box-shadow: 4px 4px 0 var(--ink); transform: translate(-1px, -1px); }
.shadow-brutal-sm:active { box-shadow: 0 0 0 var(--ink); transform: translate(2px, 2px); }

.shadow-brutal-lg {
  box-shadow: 6px 6px 0 var(--ink);
  transition: box-shadow 150ms ease-out, transform 150ms ease-out;
}
.shadow-brutal-lg:hover { box-shadow: 9px 9px 0 var(--ink); transform: translate(-3px, -3px); }

/* ─── Brutalist card ─── */
.card-brutal {
  background: var(--surface);
  border: 3px solid var(--ink);
  border-radius: 0;
  box-shadow: 4px 4px 0 var(--ink);
  transition: box-shadow 150ms ease-out, transform 150ms ease-out;
}
.card-brutal:hover { box-shadow: 7px 7px 0 var(--ink); transform: translate(-2px, -3px) rotate(-1deg); }

/* ─── Brutalist tag/badge ─── */
.tag-brutal {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: 2px solid var(--ink);
  background: var(--surface);
  font-family: var(--font-space-mono), monospace;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 0;
}

/* ─── Brutalist button ─── */
.btn-brutal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--ink);
  border-radius: 0;
  background: var(--ink);
  color: var(--surface);
  font-family: var(--font-space-mono), monospace;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  box-shadow: 4px 4px 0 var(--ink);
  transition: box-shadow 120ms ease-out, transform 120ms ease-out, background 120ms ease-out;
  cursor: pointer;
}
.btn-brutal:hover { box-shadow: 6px 6px 0 var(--ink); transform: translate(-2px, -2px); }
.btn-brutal:active { box-shadow: 0 0 0 var(--ink); transform: translate(4px, 4px); }
.btn-brutal-accent { background: var(--accent); color: var(--surface); }
.btn-brutal-pop { background: var(--pop); color: var(--ink); }
```

- [ ] **Step 7: Swap fonts in `layout.tsx`**

Replace the full file content with:

```tsx
import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/Providers";

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-archivo-black',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Browse AI — Shop with words, not filters",
  description: "AI-powered fashion discovery. Describe what you want in plain English and find it across 500+ brands instantly.",
  keywords: ["fashion", "AI shopping", "style discovery", "clothing", "outfit finder"],
  openGraph: {
    title: "Browse AI — Shop with words, not filters",
    description: "AI-powered fashion discovery across 500+ brands.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`antialiased ${archivoBlack.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Verify — lint and build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds (some pages will still visually use old hex values — that's fine, later tasks fix those files; this step only proves globals.css/layout.tsx changes don't break the build).

- [ ] **Step 9: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: establish Neo-Brutalist design tokens, fonts, and utility classes"
```

---

## Task 2: Core chrome — PageShell, Logo, SearchBar

**Files:**
- Modify: `src/components/PageShell.tsx`
- Modify: `src/components/Logo.tsx`
- Modify: `src/components/SearchBar.tsx`

**Interfaces:**
- Consumes: tokens/utility classes from Task 1 (`var(--ink)`, `var(--bg)`, `var(--accent)`, `.border-brutal`, `.shadow-brutal`, `.btn-brutal`, `.underline-slide`, `.font-mono-brutal`).
- Produces: no new interfaces — these are leaf UI components consumed by every page via existing imports (unchanged prop signatures).

- [ ] **Step 1: Convert `PageShell.tsx`**

Read the file first (106 lines — a nav/header + footer wrapper). Apply:
- Hex map: `#0F0F0E`/`#7A9E74`/`#FAFAF8`/`#FFFFFF`/`#6B6B6B` → `var(--ink)`/`var(--accent)`/`var(--bg)`/`var(--surface)`/`var(--ink-muted)` per the Global Constraints table.
- Remove the `backdrop-filter`/`.glass` panel on the sticky nav bar; replace with solid `var(--surface)` background + `border-bottom: 3px solid var(--ink)` (no shadow needed on the nav itself — the hard border is the separator).
- Convert `rounded-full` nav CTA button(s) to sharp `.btn-brutal` (or `.btn-brutal-accent` if it's the primary action).
- Nav link hover: apply the existing `.underline-slide` class (already retuned to 150ms in Task 1) instead of any soft opacity/color transition.

- [ ] **Step 2: Convert `Logo.tsx`**

Read the file (26 lines). Replace any serif/italic font styling with `.font-display` (Archivo Black) for the wordmark. If the logo uses an SVG mark with soft colors, flatten fills to `var(--ink)` / `var(--accent)`.

- [ ] **Step 3: Convert `SearchBar.tsx`**

Read the file. Apply:
- Hex map: `#1A1A1A` → `var(--ink)`, `#333` → `var(--ink)`, `#8B8B8B`/`#9B9B9B` → `var(--ink-muted)`.
- `rounded-full` input container → sharp, `.border-brutal`, add `.shadow-brutal-sm`.
- Focus state: instead of a soft glow ring, grow the hard shadow (`.shadow-brutal-sm:hover`-equivalent applied via a `focus-within` variant — add a scoped rule in this component's inline styles or a new `.input-brutal:focus-within { box-shadow: 4px 4px 0 var(--ink); }` utility appended to `globals.css` if not already covered by `.shadow-brutal-sm`).
- Submit/search icon button → circular icon-only button, keeps `rounded-full` per the icon-circle exception, gets `.border-brutal-thin` + `.shadow-brutal-sm`.

- [ ] **Step 4: Verify — grep gate**

Run: `grep -E "#(0F0F0E|1A1A1A|7A9E74|FAFAF8|FFFFFF|6B6B6B|8B8B8B|9B9B9B|333)" src/components/PageShell.tsx src/components/Logo.tsx src/components/SearchBar.tsx`
Expected: no matches (all old hex values migrated to tokens).

Run: `grep -n "backdrop-filter\|backdropFilter" src/components/PageShell.tsx`
Expected: no matches.

- [ ] **Step 5: Verify — browser check**

Start the dev server, navigate to `/`, and confirm the nav bar shows a solid cream background with a thick black bottom border (no blur), the logo renders in the new display font, and the search bar has a thick black border with a hard offset shadow.

- [ ] **Step 6: Commit**

```bash
git add src/components/PageShell.tsx src/components/Logo.tsx src/components/SearchBar.tsx
git commit -m "feat: convert nav chrome (PageShell, Logo, SearchBar) to Neo-Brutalism"
```

---

## Task 3: Homepage decorative `ui/*` components

**Files:**
- Delete: `src/components/ui/AmbientOrbs.tsx`
- Delete: `src/components/ui/CursorGlow.tsx`
- Modify: `src/components/ui/CardTilt.tsx`
- Modify: `src/components/ui/PageEnterTransition.tsx`
- Modify: `src/components/ui/ScrollHeading.tsx`
- Modify: `src/components/ui/ScrollProgressBar.tsx`
- Modify: `src/components/ui/StatItem.tsx`
- Modify: `src/components/ui/WordReveal.tsx`
- Modify: `src/components/ui/CharReveal.tsx`

**Interfaces:**
- Consumes: Task 1 tokens/formulas (easing/duration formula, tilt-removal formula).
- Produces: `CardTilt` now exports a `{ children, rotate? }` signature with fixed alternating rotation instead of mouse-tracked 3D tilt. Confirmed unused by `ProductCard.tsx`/`BrandCard.tsx` (both implement their own inline hover logic, converted separately in Task 5/Task 4) — kept as a converted, ready-to-use shared primitive for any future card component, not wired into an existing call site by this plan.

- [ ] **Step 1: Delete the two soft-glow components**

```bash
git rm src/components/ui/AmbientOrbs.tsx src/components/ui/CursorGlow.tsx
```

- [ ] **Step 2: Convert `CardTilt.tsx`**

This file is confirmed unused (no imports anywhere in `src/`, verified by grep during planning) — `ProductCard.tsx` and `BrandCard.tsx` each implement their own inline mouse-tracking instead of importing it. Convert it now anyway so it's ready as a shared primitive, using a `rotate` prop that defaults to `-1` (its current full content and exact `{ children: React.ReactNode }`-only signature were read during planning):

```tsx
"use client";

export default function CardTilt({
  children,
  rotate = -1,
}: {
  children: React.ReactNode;
  rotate?: number;
}) {
  return (
    <div
      style={{
        transition: "transform 0.15s ease-out",
        willChange: "transform",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = `rotate(${rotate}deg) translateY(-3px)`; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "rotate(0deg) translateY(0)"; }}
    >
      {children}
    </div>
  );
}
```

This drops the `useRef`/`useState`/`onMove`/`onLeave` mouse-position tracking and the `perspective(900px) rotateX/rotateY` 3D transform entirely, replacing it with the fixed-rotation formula from Global Constraints.

- [ ] **Step 3: Convert `PageEnterTransition.tsx`**

Read the file. Replace its `cubic-bezier` easing with `cubic-bezier(0.4,0,0.2,1)` per the Global Constraints formula, and reduce its duration by ~30%.

- [ ] **Step 4: Convert `ScrollHeading.tsx`**

Read the file. Apply hex map (`#0F0F0E` → `var(--ink)`, `#7A9E74` → `var(--accent)`, `#ffffff` → `var(--surface)`) and retune its two `cubic-bezier` usages per the formula. If it renders headline text, apply `.font-display`.

- [ ] **Step 5: Convert `ScrollProgressBar.tsx`**

Read the file. Apply hex map (`#4D7A47` → `var(--accent-dark)`, `#7A9E74` → `var(--accent)`). If it has rounded ends, make them sharp (a brutalist progress bar is a flat rectangle with a thick border).

- [ ] **Step 6: Convert `StatItem.tsx`**

Read the file. Apply hex map (`#0F0F0E` → `var(--ink)`, `#7A9E74` → `var(--accent)`) and retune its two `cubic-bezier` usages. Big stat numbers get `.font-display`.

- [ ] **Step 7: Convert `WordReveal.tsx` / `CharReveal.tsx`**

These consume the `.word-reveal`/`.char-reveal` CSS classes already retuned in Task 1 Step 5 — no changes needed here unless the component files themselves hardcode a duration/easing inline (read both files to confirm; if they do, apply the same `cubic-bezier(0.4,0,0.2,1)` / shortened-duration formula inline).

- [ ] **Step 8: Verify — grep gate**

Run: `grep -rE "#(0F0F0E|7A9E74|4D7A47|ffffff)" src/components/ui/`
Expected: no matches.

Run: `grep -rn "AmbientOrbs\|CursorGlow" src/`
Expected: no matches anywhere yet except `src/app/page.tsx` (fixed in Task 4) — confirm the two deleted files themselves no longer exist.

- [ ] **Step 9: Commit**

```bash
git add -A src/components/ui/
git commit -m "feat: convert homepage decorative ui/* components to Neo-Brutalism, remove ambient glow effects"
```

---

## Task 4: Homepage — page.tsx, HeroSearchCard, MarqueeBrands, BrandCard

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/HeroSearchCard.tsx`
- Modify: `src/components/MarqueeBrands.tsx`
- Modify: `src/components/BrandCard.tsx`

**Interfaces:**
- Consumes: Task 1 tokens/classes. (`BrandCard.tsx` does not import `CardTilt` — confirmed during planning; it has its own inline magnetic-hover logic, converted directly in Step 4 below.)

- [ ] **Step 1: Convert `page.tsx`**

Read the file (417 lines). Key fixes:
- Remove the `AmbientOrbs`/`CursorGlow` imports and JSX usages (deleted in Task 3).
- Line ~196: `<div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 animate-pulse-glow">` → replace with a sharp, bordered badge: `<div className="inline-flex items-center gap-2 border-brutal shadow-brutal-sm px-4 py-2" style={{ background: 'var(--surface)' }}>` (drop `rounded-full` and `animate-pulse-glow`, both removed in Task 1/3).
- Line ~162: `className="btn-dual text-[11px] font-black tracking-wide uppercase"` → replace with `.btn-brutal` (or `.btn-brutal-pop` if it's the primary hero CTA) and drop the now-deleted `.btn-dual` dual-text-slide markup (the `<span className="txt-a">`/`<span className="txt-b">` wrapper — collapse to a single label span).
- Hex map across the file: `#0F0F0E`/`#111110` → `var(--ink)`; `#58574F`/`#666`/`#9B9B94`/`#AAAAAA` → `var(--ink-muted)`; `#7A9E74` → `var(--accent)`; `#E6E2DA` → `var(--bg)`; `#FAFAF8` → `var(--bg)`.
- `rounded-2xl`/`rounded-full` on section containers/cards → sharp, add `.card-brutal` where a bordered card container is implied.
- The two `cubic-bezier` usages → retune per the Global Constraints formula.

- [ ] **Step 2: Convert `HeroSearchCard.tsx`**

Read the file (214 lines). Apply hex map (`#0F0F0E`→`var(--ink)`, `#555555`/`#58574F`/`#9B9B9B`/`#AAAAAA`/`#BBBBBB`/`#CCCCCC`→`var(--ink-muted)`, `#7A9E74`→`var(--accent)`, `#EEE9E0`→`var(--bg)`). Convert `rounded-3xl`/`rounded-xl`/`rounded-full` (except true icon circles) to sharp + `.card-brutal`/`.shadow-brutal-lg` (this is the hero focal element, use the large shadow scale). Retune its `cubic-bezier` usage.

- [ ] **Step 3: Convert `MarqueeBrands.tsx`**

Read the file. Apply hex map (`#1A1A1A`→`var(--ink)`, `#555555`/`#666`/`#888`/`#8B8B8B`/`#CCCCCC`→`var(--ink-muted)`). Wrap the scrolling ticker strip in `border-brutal` top and bottom (a bordered strip is a classic brutalist ticker-tape look). Apply `.font-mono-brutal` + uppercase to the ticker text. `rounded-full` chips inside → sharp `.tag-brutal`.

- [ ] **Step 4: Convert `BrandCard.tsx` (special case — keep per-brand color coding)**

Read the file (131 lines — full content confirmed during planning, no `CardTilt` import; it has its own inline magnetic mouse-tracking hover, not 3D tilt). Concrete changes:

1. **`BRAND_STYLE` map (lines 4–18) — swap `bg`/`text` per entry.** Today `bg` holds a pale pastel (e.g. `#E6EEE3`) that's unused in the render except as the monogram-letter color, and `text` holds an already-bold jewel-tone (e.g. `#3D6138`) that's defined but never read anywhere. Swap them so the bold tone becomes the visible color and the pastel becomes the (still-unused) secondary field:

```tsx
export const BRAND_STYLE: Record<
  string,
  { bg: string; text: string; mono: string; tag: string }
> = {
  "Sana Safinaz":    { bg: "#3D6138", text: "#E6EEE3", mono: "SS",  tag: "Luxury Pret" },
  "Alkaram Studio":  { bg: "#7A5540", text: "#F0E8DF", mono: "AS",  tag: "Lawn & Casuals" },
  "Gul Ahmed":       { bg: "#8A6010", text: "#F5EDD8", mono: "GA",  tag: "Heritage Fabrics" },
  "Nishat Linen":    { bg: "#25527A", text: "#DDE7F0", mono: "NL",  tag: "Premium Basics" },
  "Maria B":         { bg: "#7A3535", text: "#F0E2E2", mono: "MB",  tag: "Luxury Formal" },
  Limelight:         { bg: "#28663E", text: "#E2F0E6", mono: "LL",  tag: "Everyday Pret" },
  Generation:        { bg: "#8B3E12", text: "#F0E6DE", mono: "GN",  tag: "Sustainable Fashion" },
  "Bonanza Satrangi":{ bg: "#652A7A", text: "#EDE2F0", mono: "BS",  tag: "Colorful Pret" },
  ONE:               { bg: "#2A2A2A", text: "#E8E8E8", mono: "ONE", tag: "Contemporary" },
  Engine:            { bg: "#1E3575", text: "#DDE2F0", mono: "ENG", tag: "Urban Fashion" },
};
```
And the fallback at line ~36: `{ bg: "#6B5540", text: "#EDE8E0", mono: brand.name[0], tag: "Fashion Brand" }`.

2. **Monogram box (lines 75–93) — becomes the bold per-brand color block.** Change the box `background` from the hardcoded `"#0F0F0E"` to `style.bg` (now the bold tone), add `border: "3px solid var(--ink)"`, drop the soft `boxShadow` (the outer card carries the shadow instead — see point 4). Change the letter `color` from `style.bg` to `"var(--surface)"` (white letters on the now-bold color block). Replace the monogram `fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic"` with `.font-display`, drop `fontStyle`.

3. **Remove magnetic mouse-tracking.** Delete the `mag` state, `onMouseMove` handler, and its `getBoundingClientRect`-based `translate(${mag.x}px, ...)` — this is a soft "follow the cursor" effect with no brutalist equivalent. Keep the existing `hovered` boolean (still needed for the "Show results" reveal) but drive the button's hover lift with a fixed transform instead: `transform: hovered ? "translate(-2px, -2px)" : "translate(0, 0)"`.

4. **Outer button container (lines 60–73).** Replace the rest/hover background (`"#E8E3DC"`/`"#EDEAE4"`) with `"var(--surface)"` rest / `"var(--accent-soft)"` hover. Replace the soft `rgba(0,0,0,...)` border with a constant `border: "3px solid var(--ink)"` (brutalist borders are always-on, not hover-only). Replace the soft blurred `boxShadow` with the hard-offset formula: rest `"2px 2px 0 var(--ink)"`, hover `"4px 4px 0 var(--ink)"` (small-card shadow scale, per Global Constraints). Remove `rounded-2xl` from the `className`. Retune the `cubic-bezier(0.165,0.84,0.44,1)` transition to `ease-out`, shorten `0.35s` → `0.15s`.

5. **Brand name / tag text (lines 96–107).** `#0F0F0E` → `var(--ink)`; `#7A9E74` → `var(--accent)`, add `.font-mono-brutal` to the tag span (it's already `uppercase`).

6. **"Show results →" pill (lines 117–125).** Drop `rounded-full`, apply `.tag-brutal` in its place; `background: "#7A9E74"` → `"var(--accent)"`; `color: "#ffffff"` → `"var(--surface)"`.

7. **Non-brand hexes** (`#0F0F0E`, `#ffffff`) not covered above still map to `var(--ink)`/`var(--surface)` per the standard table.

- [ ] **Step 5: Verify — grep gate**

Run: `grep -rE "#(0F0F0E|111110|58574F|666|9B9B94|AAAAAA|E6E2DA|FAFAF8|555555|9B9B9B|BBBBBB|CCCCCC|EEE9E0|888|8B8B8B)" src/app/page.tsx src/components/HeroSearchCard.tsx src/components/MarqueeBrands.tsx`
Expected: no matches.

Run: `grep -n "AmbientOrbs\|CursorGlow\|btn-dual\|animate-pulse-glow\|className=\"glass" src/app/page.tsx`
Expected: no matches.

- [ ] **Step 6: Verify — browser check**

Start the dev server, navigate to `/`, screenshot the full page. Confirm: no soft glow/blur anywhere, hero search card has a thick border + hard offset shadow, brand tiles are bold flat colors with black borders, marquee ticker has a bordered strip look, all headline text uses the new display font.

- [ ] **Step 7: Commit**

```bash
git add src/app/page.tsx src/components/HeroSearchCard.tsx src/components/MarqueeBrands.tsx src/components/BrandCard.tsx
git commit -m "feat: convert homepage (hero, brand tiles, marquee) to Neo-Brutalism"
```

---

## Task 5: Shopping flow, pass 1 — ProductCard, MasonryGrid, GenderToggle

**Files:**
- Modify: `src/components/ProductCard.tsx`
- Modify: `src/components/MasonryGrid.tsx`
- Modify: `src/components/GenderToggle.tsx`

**Interfaces:**
- Consumes: Task 1 tokens/classes. (`ProductCard.tsx` does not import `CardTilt` — it builds its own tilt inline via `useMotionValue`/`useTransform`/`useSpring`, removed directly in Step 1 below.)

- [ ] **Step 1: Convert `ProductCard.tsx`**

Read the file (288 lines, already reviewed during design — full content known). Concrete changes:

Remove the mouse-tracked 3D tilt (lines ~51–73: `mouseX`, `mouseY`, `rotateY`, `rotateX` via `useMotionValue`/`useTransform`/`useSpring`, and the `handleMouseMove` handler). Replace with a `rotate` prop threaded from the parent grid (see Task 5 Step 2) or a fixed `-1deg`:

```tsx
export default function ProductCard({
  product,
  onBookmark,
  onMoreLikeThis: _m,
  onQuickView,
  size: _s = "normal",
  rotate = -1,
}: Props & { rotate?: number }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [bookmarkPop, setBookmarkPop] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const handleMouseEnter = () => setHovered(true);
  const handleMouseLeave = () => setHovered(false);
  // ...
```

Update the root `motion.div` to drop `onMouseMove`/`rotateX`/`rotateY`/`transformPerspective` and instead use `whileHover`:

```tsx
    <motion.div
      className="group relative flex flex-col cursor-pointer"
      onClick={() => { /* unchanged */ }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ rotate, y: -3 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
```

Image zone container — replace the soft-shadow style object:
```tsx
      <div
        className="relative overflow-hidden border-brutal"
        style={{
          aspectRatio: ASPECT,
          borderRadius: 0,
          boxShadow: hovered ? "7px 7px 0 var(--ink)" : "4px 4px 0 var(--ink)",
          transition: "box-shadow 150ms ease-out",
        }}
      >
```

`DiscountBadge` — sharp mono tag instead of rounded pill:
```tsx
function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span className="tag-brutal" style={{ background: "var(--warn)", color: "var(--ink)" }}>
      -{pct}%
    </span>
  );
}
```

Bookmark button — keep circular (true icon-only circle exception) but add a hard border/shadow:
```tsx
        <button
          onClick={handleBookmark}
          aria-label={product.isBookmarked ? "Remove bookmark" : "Bookmark"}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center border-brutal-thin"
          style={{
            background: product.isBookmarked ? "var(--accent)" : "var(--surface)",
            transform: bookmarkPop ? "scale(1.4)" : hovered || product.isBookmarked ? "scale(1)" : "scale(0.82)",
            opacity: hovered || product.isBookmarked ? 1 : 0,
            transition: "transform 0.2s ease-out, opacity 0.15s ease-out, background 0.15s ease-out",
            boxShadow: "2px 2px 0 var(--ink)",
          }}
        >
          {product.isBookmarked ? (
            <BookmarkCheck size={13} style={{ color: "var(--surface)" }} />
          ) : (
            <Bookmark size={13} style={{ color: "var(--ink)" }} />
          )}
        </button>
```

Quick-view button — `.btn-brutal`:
```tsx
              <motion.button
                onClick={handleQuickView}
                whileTap={{ scale: 0.93 }}
                className="btn-brutal flex items-center gap-1.5 text-[9px] px-3 py-1.5 whitespace-nowrap"
              >
                <Zap size={9} style={{ color: "var(--warn)" }} />
                Quick view
              </motion.button>
```

Info strip — brand label gets `.font-mono-brutal`, price gets `.font-display`:
```tsx
      <div className="px-1 pt-2 pb-0.5">
        <span className="font-mono-brutal block text-[8px] tracking-[0.18em] uppercase truncate" style={{ color: "var(--accent)" }}>
          {product.brand}
        </span>
        <span className="block text-[11.5px] font-semibold leading-snug line-clamp-2 mt-0.5" style={{ color: "var(--ink)", letterSpacing: "-0.01em" }}>
          {product.name}
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-display text-[12.5px]" style={{ color: "var(--ink)" }}>
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[10.5px] line-through font-medium" style={{ color: "var(--ink-muted)" }}>
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
```

Fallback/shimmer blocks — flatten the gradient to a solid fill:
```tsx
            style={{ background: "var(--accent-soft)" }}
```
for the `showFallback` block (was a `linear-gradient(145deg, #F0EDE8 ...)`), and the icon wrapper drops `backdrop-filter: blur(8px)`/translucent white in favor of `background: "var(--surface)", border: "2px solid var(--ink)"`.

- [ ] **Step 2: Convert `MasonryGrid.tsx`**

Read the file (237 lines). Apply hex map (`#1A1A1A`→`var(--ink)`, `#8B8B8B`→`var(--ink-muted)`, `#E4DDD3`/`#EDE9E1`→`var(--bg)`), sharp corners (`rounded-2xl`/`rounded-xl` → none). If this component maps over products and renders `<ProductCard>`, pass an alternating `rotate={index % 2 === 0 ? -1 : 1}` prop (consuming the new prop added in Step 1) so cards tilt in alternating directions across the grid.

- [ ] **Step 3: Convert `GenderToggle.tsx`**

Read the file. Apply hex map (`#1A1A1A`→`var(--ink)`, `#6B6B6B`→`var(--ink-muted)`, `#ECE9E3`→`var(--bg)`). `rounded-full` toggle pill → sharp two-state segmented control: `.border-brutal-thin`, active segment = solid `var(--ink)` fill with `var(--surface)` text (solid color-fill flip per the design spec's toggle pattern), inactive segment = `var(--surface)` fill with `var(--ink)` text.

- [ ] **Step 4: Verify — grep gate**

Run: `grep -n "useMotionValue\|useTransform\|transformPerspective" src/components/ProductCard.tsx`
Expected: no matches (3D tilt fully removed).

Run: `grep -rE "#(1A1A1A|8B8B8B|E4DDD3|EDE9E1|ECE9E3|6B6B6B)" src/components/ProductCard.tsx src/components/MasonryGrid.tsx src/components/GenderToggle.tsx`
Expected: no matches.

- [ ] **Step 5: Verify — browser check**

Navigate to `/results` (or wherever `MasonryGrid`/`ProductCard` render), confirm product cards show thick borders, hard offset shadows, alternating tilt on hover, sharp discount tags, and the gender toggle shows a solid color-fill flip between states.

- [ ] **Step 6: Commit**

```bash
git add src/components/ProductCard.tsx src/components/MasonryGrid.tsx src/components/GenderToggle.tsx
git commit -m "feat: convert product grid (ProductCard, MasonryGrid, GenderToggle) to Neo-Brutalism"
```

---

## Task 6: Shopping flow, pass 2 — results page, FilterBar, ActiveFilterChips, FilterDrawer, SearchPill

**Files:**
- Modify: `src/app/results/page.tsx`
- Modify: `src/components/results/FilterBar.tsx`
- Modify: `src/components/results/ActiveFilterChips.tsx`
- Modify: `src/components/FilterDrawer.tsx`
- Modify: `src/components/results/SearchPill.tsx`

**Interfaces:**
- Consumes: Task 1 tokens/classes.

- [ ] **Step 1: Convert `results/page.tsx`**

Read the file. Hex map: `#0F0F0E`/`#1A1A1A`→`var(--ink)`; `#58574F`/`#9B9B9B`/`#BBBBBB`/`#CCCCCC`→`var(--ink-muted)`; `#7A9E74`→`var(--accent)`; `#D4C4A8`/`#E8E0D4`→`var(--bg)` (decorative) or `var(--warn)` (if it's a highlighted "AI" element — read context); `#FAFAF8`→`var(--bg)`. Remove the one `backdrop-filter`/glass usage, replace with solid `.card-brutal` panel. `rounded-full` → sharp except true icon circles.

- [ ] **Step 2: Convert `results/FilterBar.tsx`**

Read the file. Hex map: `#6B6B6B`/`#9B9B9B`→`var(--ink-muted)`; `#7A9E74`→`var(--accent)`; `#EAE5DC`/`#EDE9E1`→`var(--bg)`. `rounded-full` filter buttons → sharp `.tag-brutal`-style toggle buttons, active state = solid `var(--ink)` fill flip.

- [ ] **Step 3: Convert `results/ActiveFilterChips.tsx`**

Read the file. Hex map: `#1A1A1A`→`var(--ink)`, `#7A9E74`→`var(--accent)`. `rounded-full` chip → sharp `.tag-brutal` with a small "×" remove icon, `.shadow-brutal-sm`.

- [ ] **Step 4: Convert `FilterDrawer.tsx`**

Read the file. Hex map: `#1A1A1A`→`var(--ink)`; `#4B4B4B`/`#6B6B6B`/`#AAAAAA`→`var(--ink-muted)`; `#C4A882`/`#D4C4A8`/`#E8E0D4`/`#EDE9E1`/`#F2EDE4`→`var(--bg)` (decorative) or `var(--warn)` (the "AI suggested" highlight tag specifically, per the Global Constraints warm-tone rule — identify this element on read). `rounded-full` → sharp; the drawer panel itself gets `border-brutal` on its leading edge instead of a soft shadow.

- [ ] **Step 5: Convert `results/SearchPill.tsx`**

Read the file. Hex map: `#7A9E74`→`var(--accent)`, `#9DC498`→`var(--accent-soft)`. Remove `backdrop-filter` (2 occurrences) → solid `.card-brutal` panel. `rounded-2xl`/`rounded-full`/`rounded-xl` → sharp. Retune its one `cubic-bezier` usage per the formula. The "breathe" glow animation (`pillBreathe` keyframe in `globals.css`, referenced via `.animate-pill-breathe`) is a soft pulsing shadow — replace its keyframe in `globals.css` with a hard-shadow variant:

```css
@keyframes pillBreathe {
  0%, 100% { box-shadow: 4px 4px 0 var(--ink); }
  50%       { box-shadow: 6px 6px 0 var(--ink); }
}
```

- [ ] **Step 6: Verify — grep gate**

Run: `grep -rE "#(0F0F0E|1A1A1A|58574F|9B9B9B|BBBBBB|CCCCCC|7A9E74|D4C4A8|E8E0D4|FAFAF8|6B6B6B|EAE5DC|EDE9E1|4B4B4B|AAAAAA|C4A882|F2EDE4|9DC498)" src/app/results/page.tsx src/components/results/FilterBar.tsx src/components/results/ActiveFilterChips.tsx src/components/FilterDrawer.tsx src/components/results/SearchPill.tsx`
Expected: no matches.

Run: `grep -n "backdrop-filter\|backdropFilter" src/app/results/page.tsx src/components/results/SearchPill.tsx`
Expected: no matches.

- [ ] **Step 7: Verify — browser check**

Navigate to `/results`, apply a filter, confirm: filter bar buttons and active-filter chips are sharp bordered tags with a solid fill-flip on active state, the filter drawer has a hard leading border, and the search pill shows a hard-shadow breathe pulse instead of a soft glow.

- [ ] **Step 8: Commit**

```bash
git add src/app/results/page.tsx src/components/results/FilterBar.tsx src/components/results/ActiveFilterChips.tsx src/components/FilterDrawer.tsx src/components/results/SearchPill.tsx src/app/globals.css
git commit -m "feat: convert results page filtering UI to Neo-Brutalism"
```

---

## Task 7: Shopping flow, pass 3 — QuickViewModal, ComingSoonToast, ChatPanel, EditCard

**Files:**
- Modify: `src/components/results/QuickViewModal.tsx`
- Modify: `src/components/results/ComingSoonToast.tsx`
- Modify: `src/components/ChatPanel.tsx`
- Modify: `src/components/EditCard.tsx`

**Interfaces:**
- Consumes: Task 1 tokens/classes.

- [ ] **Step 1: Convert `results/QuickViewModal.tsx`**

Read the file. Hex map: `#1A1A1A`→`var(--ink)`; `#7A9E74`→`var(--accent)`; `#9B8877`/`#DDD5C6`/`#EDE8E0`/`#FAFAF8`→`var(--bg)`. Remove all 5 `backdrop-filter` occurrences: the modal panel itself → solid `var(--surface)` + `.border-brutal` + `.shadow-brutal-lg`; the dim overlay behind it → solid `rgba(17,17,17,0.6)` (no blur, per the design spec's modal pattern). `rounded-*` → sharp.

- [ ] **Step 2: Convert `results/ComingSoonToast.tsx`**

Read the file. Hex map: `#1A1A1A`→`var(--ink)`. `rounded-full` → sharp `border-brutal` block. Its entrance animation currently fades/slides in (`animate-scroll-top-in` or similar, elastic-pop curve — keep per Global Constraints "pop curves kept") — but the spec calls for the toast to "snap in" via translate only, no opacity fade: if the current animation includes an opacity transition, drop the opacity keyframe steps and keep only the transform steps.

- [ ] **Step 3: Convert `ChatPanel.tsx`**

Read the file. Hex map: `#1A1A1A`→`var(--ink)`; `#6B6B6B`/`#8B8B8B`/`#AAAAAA`/`#CCCCCC`→`var(--ink-muted)`; `#8B7355`/`#C4A882`/`#D4C4A8`→`var(--warn)` (this is the "AI assistant" accent tint — bot avatar ring/header icon — per the Global Constraints warm-tone rule); `#E0DDD6`/`#F2EDE4`→`var(--bg)`. Message bubbles: replace `rounded-2xl`/`rounded-bl`/`rounded-br`/`rounded-xl` asymmetric bubble shapes with uniform sharp rectangles (`border-radius: 0`), keep left/right alignment to distinguish sender, add `.border-brutal-thin` + `.shadow-brutal-sm` per bubble. Remove the 3 `backdrop-filter` occurrences (panel background, input bar) → solid fills.

- [ ] **Step 4: Convert `EditCard.tsx`**

Read the file. Hex map: `#7A9E74`→`var(--accent)`. `rounded-2xl`/`rounded-full`/`rounded-xl` → sharp, `.card-brutal`. Retune its `cubic-bezier` usage.

- [ ] **Step 5: Verify — grep gate**

Run: `grep -rE "#(1A1A1A|7A9E74|9B8877|DDD5C6|EDE8E0|FAFAF8|6B6B6B|8B8B8B|AAAAAA|CCCCCC|8B7355|C4A882|D4C4A8|E0DDD6|F2EDE4)" src/components/results/QuickViewModal.tsx src/components/results/ComingSoonToast.tsx src/components/ChatPanel.tsx src/components/EditCard.tsx`
Expected: no matches.

Run: `grep -n "backdrop-filter\|backdropFilter" src/components/results/QuickViewModal.tsx src/components/ChatPanel.tsx`
Expected: no matches.

- [ ] **Step 6: Verify — browser check**

Open the chat panel and send a message; open a product quick-view modal; trigger the "coming soon" toast. Confirm all three show thick borders, hard shadows, solid (non-blurred) overlays, and sharp-cornered message bubbles.

- [ ] **Step 7: Commit**

```bash
git add src/components/results/QuickViewModal.tsx src/components/results/ComingSoonToast.tsx src/components/ChatPanel.tsx src/components/EditCard.tsx
git commit -m "feat: convert chat, quick-view, and edit-card UI to Neo-Brutalism"
```

---

## Task 8: Product detail page

**Files:**
- Modify: `src/app/product/[id]/page.tsx`

**Interfaces:**
- Consumes: Task 1 tokens/classes.

- [ ] **Step 1: Convert `product/[id]/page.tsx`**

Read the file. Hex map: `#0F0F0E`/`#1A1A1A`→`var(--ink)`; `#58574F`/`#6B6B6B`/`#9B9B9B`/`#AAAAAA`/`#BBBBBB`/`#C0BDB6`/`#CCCCCC`→`var(--ink-muted)`; `#4D7A47`→`var(--accent-dark)`; `#7A9E74`→`var(--accent)`; `#D0CCC4`/`#E8E0D4`/`#EEF4EE`/`#FAFAF8`→`var(--bg)`. Remove the one `backdrop-filter` occurrence → solid fill. Convert `rounded-full`/`rounded-sm` → sharp except true icon circles. Retune all 6 `cubic-bezier` usages per the formula. The italic-serif price/title styling (`fontFamily: 'var(--font-cormorant), Georgia, serif', fontStyle: 'italic'` at line ~317) → replace with `.font-display` (Archivo Black), drop `fontStyle: 'italic'`.

- [ ] **Step 2: Verify — grep gate**

Run: `grep -E "#(0F0F0E|1A1A1A|58574F|6B6B6B|9B9B9B|AAAAAA|BBBBBB|C0BDB6|CCCCCC|4D7A47|7A9E74|D0CCC4|E8E0D4|EEF4EE|FAFAF8)" src/app/product/\[id\]/page.tsx`
Expected: no matches.

Run: `grep -n "font-cormorant\|var(--font-cormorant)" src/app/product/\[id\]/page.tsx`
Expected: no matches.

- [ ] **Step 3: Verify — browser check**

Navigate to a product detail page (`/product/<any-id>` from mock data), confirm the layout uses the new display font for the title/price, thick borders on the image/info panels, and hard offset shadows.

- [ ] **Step 4: Commit**

```bash
git add "src/app/product/[id]/page.tsx"
git commit -m "feat: convert product detail page to Neo-Brutalism"
```

---

## Task 9: Content pages — about, blog, blog/[slug], faq, privacy, terms

**Files:**
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/blog/page.tsx`
- Modify: `src/app/blog/[slug]/page.tsx`
- Modify: `src/app/faq/page.tsx`
- Modify: `src/app/privacy/page.tsx`
- Modify: `src/app/terms/page.tsx`

**Interfaces:**
- Consumes: Task 1 tokens/classes.

- [ ] **Step 1: Convert `about/page.tsx`**

Read the file. Hex map: `#0F0F0E`→`var(--ink)`; `#6B6B6B`→`var(--ink-muted)`; `#7A9E74`→`var(--accent)`; `#FFFFFF`→`var(--surface)`. `rounded-2xl`/`rounded-full` → sharp, `.card-brutal` on any content blocks/stat cards.

- [ ] **Step 2: Convert `blog/page.tsx`**

Read the file. Hex map: `#0F0F0E`→`var(--ink)`; `#6B6B6B`/`#AAAAAA`→`var(--ink-muted)`; `#7A9E74`→`var(--accent)`; `#E0DDD6`→`var(--bg)`; `#FFFFFF`→`var(--surface)`. Blog post preview cards → `.card-brutal`, tags → `.tag-brutal`.

- [ ] **Step 3: Convert `blog/[slug]/page.tsx`**

Read the file. Hex map: `#0F0F0E`→`var(--ink)`; `#3A3A3A`/`#6B6B6B`/`#AAAAAA`→`var(--ink-muted)`; `#4D7A47`→`var(--accent-dark)`; `#7A9E74`→`var(--accent)`; `#E0DDD6`→`var(--bg)`; `#EEF4EE`→`var(--accent-soft)`; `#FFFFFF`→`var(--surface)`. `rounded-2xl`/`rounded-full`/`rounded-xl` → sharp. The `.prose-custom h2` inline `<style>` block using `var(--font-cormorant)` italic serif → replace with `.font-display`, drop italic.

- [ ] **Step 4: Convert `faq/page.tsx`**

Read the file. Hex map: `#0F0F0E`→`var(--ink)`; `#4D7A47`→`var(--accent-dark)`; `#6B6B6B`→`var(--ink-muted)`; `#7A9E74`→`var(--accent)`; `#EEF4EE`→`var(--accent-soft)`; `#FFFFFF`→`var(--surface)`. FAQ accordion items → `.border-brutal-thin` between items instead of soft dividers; expand/collapse icon stays simple, no rounded pill background.

- [ ] **Step 5: Convert `privacy/page.tsx`**

Read the file. Hex map: `#0F0F0E`→`var(--ink)`; `#4A4A4A`→`var(--ink-muted)`; `#7A9E74`→`var(--accent)`; `#AAAAAA`→`var(--ink-muted)`. The `.legal-prose h2` inline `<style>` using `var(--font-cormorant)` italic → `.font-display`, drop italic.

- [ ] **Step 6: Convert `terms/page.tsx`**

Read the file. Same pattern as Step 5 (hex map identical: `#0F0F0E`/`#4A4A4A`/`#7A9E74`/`#AAAAAA`), same `.legal-prose h2` font swap.

- [ ] **Step 7: Verify — grep gate**

Run: `grep -rE "#(0F0F0E|6B6B6B|7A9E74|FFFFFF|AAAAAA|E0DDD6|3A3A3A|4D7A47|EEF4EE|4A4A4A)" src/app/about/page.tsx src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx" src/app/faq/page.tsx src/app/privacy/page.tsx src/app/terms/page.tsx`
Expected: no matches.

Run: `grep -rn "font-cormorant" src/app/`
Expected: no matches.

- [ ] **Step 8: Verify — browser check**

Spot-check `/about`, `/blog`, a `/blog/<slug>` post, `/faq`, `/privacy`, `/terms`. Confirm consistent thick-border cards, sharp corners, display/mono type, no leftover italic serif headings.

- [ ] **Step 9: Commit**

```bash
git add src/app/about/page.tsx src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx" src/app/faq/page.tsx src/app/privacy/page.tsx src/app/terms/page.tsx
git commit -m "feat: convert content pages (about, blog, faq, privacy, terms) to Neo-Brutalism"
```

---

## Task 10: Auth — AuthModal

**Files:**
- Modify: `src/components/AuthModal.tsx`

**Interfaces:**
- Consumes: Task 1 tokens/classes.

- [ ] **Step 1: Convert `AuthModal.tsx`**

Read the file. Hex map: `#1A1A1A`→`var(--ink)`; `#555`/`#6B6B6B`/`#9B9B9B`/`#AAAAAA`→`var(--ink-muted)`; `#C4A882`/`#D0CCC4`/`#D4C4A8`/`#E8E0D4`/`#ECEAE5`/`#EDE9E1`/`#F2EDE4`/`#FAFAF8`→`var(--bg)`; `#E57373`→`var(--error)` (form validation error text/border). **Do not touch** `#34A853`/`#4285F4`/`#EA4335`/`#FBBC05` (Google "G" logo brand colors). Remove both `backdrop-filter` occurrences (modal overlay → solid `rgba(17,17,17,0.6)`; modal panel → solid `var(--surface)` + `.border-brutal` + `.shadow-brutal-lg`). `rounded-full` → sharp except any true icon-only circular buttons (e.g. close button).

- [ ] **Step 2: Verify — grep gate**

Run: `grep -E "#(1A1A1A|555|6B6B6B|9B9B9B|AAAAAA|C4A882|D0CCC4|D4C4A8|E8E0D4|ECEAE5|EDE9E1|F2EDE4|FAFAF8|E57373)" src/components/AuthModal.tsx`
Expected: no matches.

Run: `grep -E "#(34A853|4285F4|EA4335|FBBC05)" src/components/AuthModal.tsx`
Expected: matches found (confirms Google brand colors were correctly left untouched).

Run: `grep -n "backdrop-filter\|backdropFilter" src/components/AuthModal.tsx`
Expected: no matches.

- [ ] **Step 3: Verify — browser check**

Open the auth modal (from the nav or wherever it's triggered), confirm a solid bordered panel with hard shadow over a solid dim overlay, and that the "Sign in with Google" button icon still shows Google's real brand colors.

- [ ] **Step 4: Commit**

```bash
git add src/components/AuthModal.tsx
git commit -m "feat: convert AuthModal to Neo-Brutalism"
```

---

## Task 11: Final QA sweep

**Files:**
- None modified directly — this task verifies the prior 10 tasks and fixes any stragglers found.

- [ ] **Step 1: Repo-wide leftover-hex grep**

Run:
```bash
grep -rE "#(0F0F0E|1A1A1A|111110|2A2A2A|6B6B6B|58574F|4A4A4A|555555|4B4B4B|3A3A3A|8B8B8B|9B9B9B|9B9B94|AAAAAA|BBBBBB|CCCCCC|C0BDB6|7A9E74|4D7A47|EEF4EE|E2F0E6|E6EEE3|FAFAF8|F5EDD8|E8E0D4|D4C4A8|EDE9E1|D0CCC4|F2EDE4|C4A882|F0EDE8|E6E2DA|E0DDD6|EDE8E0|EAE5DC|8B7355|DDD5C6|9B8877|E57373)" src/
```
Expected: no matches (excluding `BrandCard.tsx`'s intentionally-kept per-brand palette and `AuthModal.tsx`'s Google brand colors — if either appears, confirm it's one of those two sanctioned exceptions, not a straggler).

- [ ] **Step 2: Repo-wide soft-effect class grep**

Run:
```bash
grep -rn "backdrop-filter\|backdropFilter\|className=\"glass\|glass-dark\|Playfair\|Cormorant\|font-cormorant" src/
```
Expected: no matches.

Run:
```bash
grep -rn "AmbientOrbs\|CursorGlow" src/
```
Expected: no matches.

- [ ] **Step 3: Repo-wide rounded-corner audit**

Run:
```bash
grep -rn "rounded-2xl\|rounded-xl\|rounded-3xl\|rounded-sm\|rounded-bl\|rounded-br" src/
```
Expected: no matches (every non-circle radius should have been flattened to sharp across Tasks 2–10).

- [ ] **Step 4: Lint and build**

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 5: Full-site browser walkthrough**

Start the dev server and visit every route: `/`, `/results`, `/product/<id>`, `/about`, `/blog`, `/blog/<slug>`, `/faq`, `/privacy`, `/terms`, plus opening the auth modal, a quick-view modal, the filter drawer, and the chat panel. Screenshot each. Confirm visual consistency: cream background, black borders and hard offset shadows everywhere, Archivo Black display headlines, Space Grotesk body, Space Mono labels/tags, no glassmorphism, no soft blurred shadows, no rounded corners except true icon circles, sharp mechanical hover/press interactions.

Resize to mobile width (375px) and repeat a spot-check on `/`, `/results`, and `/product/<id>` to confirm the brutalist layout holds up responsively (borders/shadows don't get clipped, text doesn't overflow bordered containers).

- [ ] **Step 6: Fix any stragglers found in Steps 1–5**

If any leftover old-palette hex, soft shadow, glassmorphism, or unintended rounded corner is found, fix it directly in the offending file (not a new task — this is the sweep's purpose) and re-run the relevant grep from Step 1–3 to confirm.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: final Neo-Brutalism QA sweep — fix stragglers"
```

(Skip this commit if Step 6 found nothing to fix.)
