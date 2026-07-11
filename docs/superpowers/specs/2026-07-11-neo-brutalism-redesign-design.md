# Neo-Brutalism Redesign — Design Spec

## Context

Browse AI is an AI-powered fashion discovery site ("Shop with words, not filters"). The
current visual language is soft editorial: Playfair Display / Cormorant Garamond serif
type, a muted sage-green/cream palette, glassmorphism, soft blurred shadows, ambient
floating orbs, cursor glow, and expo/spring-eased scroll reveals — spread across ~30
components and 8 pages (home, results, product detail, blog + slug, about, faq, privacy,
terms).

Goal: replace this with a full, raw Neo-Brutalist visual language across the entire
site, while keeping the sage-green brand color recognizable (pushed to a bolder,
saturated version) rather than discarding brand identity entirely.

## Scope

Full site — every page and component gets restyled. This is one cohesive design-system
pivot (not independent subsystems), executed in dependency-ordered phases so shared
primitives are only built once.

## Foundations

### Color tokens (replace `:root` in `globals.css`)

```css
--bg:          #FDF8EC   /* warm cream base */
--surface:     #FFFFFF
--ink:         #111111   /* near-black — all text + all borders */
--accent:      #3F8F46   /* saturated grass-sage — primary brand/CTA */
--accent-dark: #245E29   /* pressed/shadow state of accent */
--accent-soft: #CFEAC9   /* light fill for tags/backgrounds */
--pop:         #FF4FA3   /* hot pink — clash accent for high-emphasis CTAs/badges */
--warn:        #F5C518   /* acid yellow — discount tags, alerts */
```

All existing hardcoded hex usages in components (`#7A9E74`, `#0F0F0E`, `#4D7A47`, etc.)
get migrated to these tokens as part of each component's pass.

### Typography

Retire Playfair Display / Cormorant Garamond. Replace with (via `next/font/google` in
`layout.tsx`):

- **Archivo Black** — display headlines (hero, section titles, big numbers)
- **Space Grotesk** (400/500/700) — body copy, UI text, nav
- **Space Mono** (400/700) — labels, tags, prices, badges, nav chrome (uppercase,
  letter-spaced — brutalist-web convention)

### Shape

- Border: `3px solid var(--ink)` universal on cards, buttons, inputs, nav, modals,
  section dividers.
- Corner radius: `0` everywhere, **except** icon-only circular buttons which stay true
  circles (`border-radius: 50%`). No radius values in between.

### Shadows & motion

- Hard offset shadow, no blur: `4px 4px 0 var(--ink)` at rest.
- Hover: shadow grows to `7px 7px 0 var(--ink)`, element translates `-2px, -2px`.
- Active/press: element translates fully into the shadow (`4px, 4px`), shadow collapses
  to `0 0 0 var(--ink)` — physical "push button" feedback.
- Durations drop from the current 300–950ms expo/spring curves to 120–180ms
  `ease-out`/linear — snappy and mechanical, not smooth.
- Card hover replaces the current 3D mouse-tilt (`rotateX`/`rotateY` via framer-motion)
  with a fixed small rotation (±1°) + hard shadow lift.
- **Removed entirely:** `.glass` / `.glass-dark` (glassmorphism), `.animate-pulse-glow`,
  `AmbientOrbs`, `CursorGlow` — these are inherently soft/blurred effects incompatible
  with the aesthetic.
- **Kept, re-tuned:** word/char/line scroll-reveal utilities (`WordReveal`,
  `CharReveal`, `ScrollHeading`), `PageEnterTransition`, `ScrollProgressBar`, `CardTilt`
  (repurposed to the fixed-rotation hover), marquee ticker (`MarqueeBrands` — already a
  brutalist-compatible device, restyled as a thick-bordered strip with mono uppercase
  text).

## Component patterns

- **Buttons** — rectangular, thick border, bold uppercase mono label, hard-shadow push
  interaction. Fill by hierarchy: `--ink` primary, `--accent` brand action, `--pop`
  high-emphasis CTA (e.g. main search/submit).
- **Cards** (`ProductCard`, `BrandCard`, `EditCard`) — thick border + hard shadow, sharp
  corners, hover = lift + fixed ±1° rotation. Discount/brand badges become rectangular
  mono tags with a border, replacing rounded pills.
- **Inputs / search bar** (`SearchBar`, `HeroSearchCard`, `results/SearchPill`) — thick
  border, sharp corners, shadow appears/grows on focus instead of a soft glow ring.
- **Nav / chrome** (`PageShell`, `Logo`) — bold `border-bottom`, blocky wordmark logo,
  mono uppercase nav links with a hard underline snap on hover (replacing the smooth
  `.underline-slide` transition timing with a snappier one).
- **Modals** (`AuthModal`, `results/QuickViewModal`) — thick border + hard shadow, solid
  dim overlay (`rgba(17,17,17,0.6)`) instead of `backdrop-filter: blur`.
- **Tags/toggles** (`results/ActiveFilterChips`, `GenderToggle`, `results/SearchPill`,
  `results/FilterBar`) — rectangular, thick border, active state = solid color-fill flip
  rather than a soft highlight/opacity change.
- **Toast** (`results/ComingSoonToast`) — bordered block that snaps in (translate, no
  opacity fade).
- **Chat** (`ChatPanel`) — message bubbles get thick borders + hard shadow instead of
  soft rounded bubbles; keep the existing scroll behavior.

## Rollout plan (implementation order)

1. **Foundations** — `globals.css` tokens/fonts/utility classes (`.border-brutal`,
   `.shadow-brutal`, `.btn-press`, `.tag-brutal`), `layout.tsx` font swap
   (Archivo Black / Space Grotesk / Space Mono replacing Playfair/Cormorant).
2. **Core chrome** — `PageShell`, `Logo`, `SearchBar`, shared button/tag utility
   classes reused by everything downstream.
3. **Homepage** — `app/page.tsx`, `HeroSearchCard`, `MarqueeBrands`, `BrandCard`,
   `StatItem`, and the `ui/*` decorative set (retire `AmbientOrbs` & `CursorGlow`;
   re-tune `CardTilt`, `ScrollHeading`, `WordReveal`, `CharReveal`,
   `PageEnterTransition`, `ScrollProgressBar`).
4. **Shopping flow** — `app/results/page.tsx`, `results/FilterBar`,
   `results/ActiveFilterChips`, `FilterDrawer`, `results/SearchPill`, `ProductCard`,
   `MasonryGrid`, `results/QuickViewModal`, `results/ComingSoonToast`, `ChatPanel`,
   `EditCard`, `GenderToggle`, `app/product/[id]/page.tsx`.
5. **Content pages** — `app/about`, `app/blog` (+ `[slug]`), `app/faq`,
   `app/privacy`, `app/terms`.
6. **Auth** — `AuthModal`.
7. **QA pass** — browser verification at desktop + mobile widths; sweep for
   leftover soft-shadow/glassmorphism/hardcoded old-palette hex values.

## Testing / verification

No visual regression tooling exists in this repo, so verification is manual via the dev
server browser preview at each phase boundary:

- After phase 1–2: confirm fonts load, tokens apply, nav/buttons show hard-shadow
  press interaction.
- After phase 3: homepage visually reviewed end-to-end (desktop + mobile widths).
- After phase 4: results page + product detail flow reviewed, including
  filter/chat/quick-view interactions.
- After phase 5–6: remaining pages + auth modal spot-checked.
- Final sweep: `grep` for leftover old hex values (`#7A9E74`, `#4D7A47`, `#FAFAF8`,
  `Playfair`, `Cormorant`, `glass`) to confirm no stragglers remain.

## Out of scope

- No dark mode (none exists today; not being added).
- No changes to data/logic (`lib/aiService.ts`, `lib/api.ts`, `lib/mockData.ts`,
  `lib/types.ts`, `AuthContext.tsx`) — purely visual/styling pass.
- No new pages or features — restyling existing surface only.
