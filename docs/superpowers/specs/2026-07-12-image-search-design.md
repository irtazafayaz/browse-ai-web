# Image Search — Design Spec

**Date:** 2026-07-12
**Status:** Approved (pending spec review)

## Goal

Let users search the catalog by uploading a photo, in addition to the existing text search. The backend + AI already expose an image-search endpoint; this spec covers wiring it into the web frontend, following the established Neo-Brutalism design system.

## Context (what already exists)

- **API client:** `searchByImage(file: File, page = 1): Promise<PaginatedProducts>` in `src/lib/api.ts` — POSTs `multipart/form-data` (`image`, `page`) to `/api/products/image-search/`, handles the 401→refresh retry, and returns the **same** `PaginatedProducts` shape (`products`, `total`, `has_next`) as text search.
- **Results page scaffolding (unwired):**
  - `SearchPill` renders a greyed-out camera button (`title="Image search (coming soon)"`) bound to `onCameraClick`, currently `showComingSoonToast`.
  - A hidden `<input type="file" accept="image/*">` (`fileInputRef`) exists in `results/page.tsx` whose `onChange` is a no-op.
  - Results render from `rawProducts` state via `fetchText(q, filters, page, reset)` → `searchProducts`; infinite-scroll load-more re-calls `fetchText`.
- **Homepage:** `HeroSearchCard` (text-only) → `onSubmit` navigates to `/results?q=...`. No image entry today.

Because the image endpoint returns the identical result shape, image results reuse the existing `MasonryGrid`, sort, empty-state, and load-more UI — no new results-rendering UI is required.

## Decisions (locked)

| Question | Decision |
|---|---|
| Entry points | **Homepage hero + results page** |
| Result display | **Uploaded-image thumbnail chip + clear**, in place of the text query |
| Extras | **All four**: load-more pagination, client-side validation, drag-and-drop, mobile camera capture |
| Homepage→results file handoff | **In-memory module store** (Approach A) |
| Capture mode | **`accept="image/*"`** (native camera+gallery sheet on mobile), not forced `capture` |

## Architecture

### 1. Cross-navigation handoff — `src/lib/pendingImageSearch.ts` (new)

A tiny in-memory module singleton to hand a `File` from the homepage to the results page across client-side (SPA) navigation, since files cannot be encoded in a URL.

```ts
let pending: File | null = null;
export function setPendingImageSearch(file: File) { pending = file; }
export function consumePendingImageSearch(): File | null {
  const f = pending; pending = null; return f;   // one-shot read
}
```

- **What it does:** holds at most one pending image-search file.
- **How it's used:** homepage sets it, then `router.push('/results?img=1')`; results consumes it once on mount.
- **Depends on:** nothing.
- **Trade-off:** survives SPA navigation (same JS runtime) but not a hard refresh — acceptable; the user simply re-picks. Chosen over sessionStorage (megabyte base64 serialization) and React context (re-renders for a one-shot handoff).

### 2. Entry points

- **`HeroSearchCard.tsx` (homepage):** add a camera button mirroring the results `SearchPill` camera, plus a hidden `accept="image/*"` file input. On select → validate → `setPendingImageSearch(file)` → `onImageSearch()` prop, which the homepage wires to `router.push('/results?img=1')`.
- **`SearchPill.tsx` (results):** un-grey the camera button, drop the "coming soon" title, and keep `onCameraClick` — now bound to opening the existing hidden `fileInputRef`. Also renders the **active-image chip** when in image mode (see §4).
- **`results/page.tsx`:** wire the hidden file input's `onChange` to the image handler; consume `pendingImageSearch` on mount when `?img=1`.

### 3. Results-page image-search flow (core) — `results/page.tsx`

New state:
- `imageFile: File | null` — kept so load-more can fetch page 2+.
- `imagePreview: string | null` — `URL.createObjectURL(file)` for the chip; revoked on clear/replace.
- `searchMode: 'text' | 'image'`.

New `fetchImage(file, pageNum, reset)` mirrors `fetchText` but calls `searchByImage(file, pageNum)` and sets `rawProducts` / `total` / `hasNext` / `page` identically.

`runImageSearch(file)` (shared by picker, drag-drop, and homepage handoff):
1. validate (§6); on failure show error toast and abort.
2. revoke any prior `imagePreview`; set `imageFile`, `imagePreview = createObjectURL(file)`, `searchMode = 'image'`; clear text `query`/`inputValue`.
3. `fetchImage(file, 1, true)`.

Load-more: the existing infinite-scroll effect branches on `searchMode` — image mode calls `fetchImage(imageFile, page + 1, false)`; text mode unchanged.

Clearing image mode (explicit): revoke `imagePreview`; null `imageFile`/`imagePreview`; set `searchMode = 'text'`. If a non-empty text `query` was active before the image search, restore it and re-run `fetchText`; otherwise clear `rawProducts` to the empty state.

### 4. Active-image chip

In image mode, the results header/`SearchPill` shows a small brutalist chip: a thumbnail (`imagePreview`) + the file name (truncated) + an ✕. `border-brutal-thin` + `shadow-brutal-sm`, sharp corners. ✕ → clear image mode (§3). Replaces the text-query display while in image mode.

### 5. Drag-and-drop

Wrap the results `main` in `onDragOver` / `onDragLeave` / `onDrop` handlers. On drag-enter, show a full-area brutalist overlay ("Drop image to search", dashed `border-brutal`, `var(--accent-soft)` wash). On drop → `runImageSearch(droppedFile)`. Guard against non-file drags.

### 6. Validation & errors

`validateImage(file): string | null` (returns an error message or null):
- `file.type` must start with `image/`.
- `file.size` ≤ **10 MB**.

On failure, surface a brutalist **error toast**. Mechanism (explicit): generalize the existing toast state on `results/page.tsx` — currently `showComingSoonToast()` drives `ComingSoonToast` — into `showToast(message: string)`, and give `ComingSoonToast` an optional `message` prop (default preserves its current copy). Validation errors call `showToast(validationMessage)`. Network failures and zero results reuse the existing text-search empty state.

### 7. Mobile capture

File inputs use `accept="image/*"`, which surfaces the native camera + gallery chooser on mobile (satisfies "camera capture" without locking out gallery). No forced `capture` attribute.

## Data flow

```
Homepage: pick file → validate → setPendingImageSearch(file) → push(/results?img=1)
                                                                     │
Results mount: ?img=1 → consumePendingImageSearch() ────────────────┘
                          │
Results camera / drag-drop → runImageSearch(file)
                          │  validate → set imageFile/preview/mode=image → fetchImage(file,1,true)
                          ▼
              searchByImage(file,page) → { products, total, has_next }
                          ▼
        rawProducts state → MasonryGrid (existing) ; chip shows preview
                          ▼
        scroll to end (image mode) → fetchImage(imageFile, page+1, false)
```

## Components / interfaces summary

| Unit | Purpose | Depends on |
|---|---|---|
| `pendingImageSearch.ts` (new) | one-shot File handoff homepage→results | — |
| `HeroSearchCard` (mod) | homepage image entry: camera btn + hidden input + `onImageSearch` prop | pendingImageSearch, validate |
| `page.tsx` (mod) | wire `onImageSearch` → `push(/results?img=1)` | HeroSearchCard |
| `SearchPill` (mod) | live camera button; render active-image chip | — (props from results) |
| `results/page.tsx` (mod) | `fetchImage`, `runImageSearch`, image state, load-more branch, drag-drop, `?img=1` consume, validation, error toast | searchByImage, pendingImageSearch |

## Verification (no test suite in repo)

- `npm run build` compiles; `npx eslint src` stays at the 27-problem baseline (no new issues).
- Manual/behavioral: camera opens picker; selecting an image swaps the grid to image results; chip appears with thumbnail + ✕; ✕ returns to text mode; drag-drop triggers search; oversized/non-image file shows the error toast; load-more fetches page 2 in image mode; homepage camera navigates and runs the search on `/results`.
- Visual: all new controls match the Neo-Brutalism system (thick borders, hard offset shadows, sharp corners, tokens only).

## Out of scope (v1)

Image cropping/editing, multi-image search, saved/-history image searches, forced camera-only capture, server-side interpreted-query display.
