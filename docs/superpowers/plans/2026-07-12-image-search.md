# Image Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users search the catalog by uploading a photo, from both the homepage hero and the results page, reusing the existing product grid.

**Architecture:** The `searchByImage(file, page)` API client already returns the same `PaginatedProducts` shape as text search, so image results flow into the existing `MasonryGrid`/sort/load-more with no new results UI. A tiny in-memory module store hands the picked `File` from the homepage to the results page across SPA navigation. The results page gains an `imageFile`/`imagePreview`/`searchMode` state layer alongside the existing text-search state.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind v4, framer-motion, lucide-react, TypeScript.

**Spec:** `docs/superpowers/specs/2026-07-12-image-search-design.md`

## Global Constraints

- **No test suite exists** in this repo (no Jest/Vitest/Playwright). Per-task verification is therefore: (1) `npx eslint src` stays at the pre-existing **27-problem baseline** (no new problems introduced by the task), (2) `npm run build` compiles with no type errors, and (3) a described behavioral check. `npm run lint` from the repo root is misleading (it traverses the gitignored nested worktree copies); always use `npx eslint src`.
- **No new dependencies.**
- **Neo-Brutalism design system:** all new UI uses tokens (`var(--ink)`, `var(--surface)`, `var(--accent)`, `var(--accent-soft)`, `var(--warn)`, `var(--ink-muted)`), `border-brutal` (3px) / `border-brutal-thin` (2px), hard offset shadows `Npx Npx 0 var(--ink)` (never blurred), sharp corners (`border-radius: 0`) except true icon-only circles, hover/press easing `ease-out` ≤150ms.
- **Image constraints:** accept `image/*` only; max **10 MB**. `accept="image/*"` on file inputs (no forced `capture`).
- Work happens on the `dev` branch (no worktree). Commit after each task with the exact message shown.

---

## Task 1: Image-search lib helpers (store + validation)

**Files:**
- Create: `src/lib/pendingImageSearch.ts`

**Interfaces:**
- Produces: `setPendingImageSearch(file: File): void`, `consumePendingImageSearch(): File | null`, `validateImageFile(file: File): string | null`, `MAX_IMAGE_BYTES: number` — consumed by Tasks 4 and 7.

- [ ] **Step 1: Create the module**

Create `src/lib/pendingImageSearch.ts`:

```ts
/**
 * One-shot, in-memory handoff of an image-search File from the homepage to the
 * results page across client-side navigation. Files cannot be encoded in a URL,
 * and this avoids serializing megabytes into sessionStorage. Lost on hard refresh
 * (acceptable — the user simply re-picks the image).
 */
let pending: File | null = null;

export function setPendingImageSearch(file: File): void {
  pending = file;
}

export function consumePendingImageSearch(): File | null {
  const f = pending;
  pending = null; // one-shot read
  return f;
}

/** Max accepted image size for image search. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Validate a candidate image-search file.
 * Returns an error message string if invalid, or null if the file is acceptable.
 */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Please choose an image file.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be under 10 MB.";
  return null;
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npx eslint src 2>&1 | grep -E "problems? \(" | tail -1`
Expected: `✖ 27 problems (22 errors, 5 warnings)` (unchanged baseline).

Run: `npm run build 2>&1 | grep -E "Compiled successfully|Failed|Type error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/pendingImageSearch.ts
git commit -m "feat: add image-search handoff store and file validation helper"
```

---

## Task 2: Parameterize ComingSoonToast with a message

**Files:**
- Modify: `src/components/results/ComingSoonToast.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `ComingSoonToast` now accepts an optional `message?: string` prop (default `"Coming soon"`). Consumed by Task 4.

- [ ] **Step 1: Add the `message` prop**

Replace the component signature and the rendered label. Change the function line:

```tsx
export default function ComingSoonToast({ visible }: { visible: boolean }) {
```
to:
```tsx
export default function ComingSoonToast({
  visible,
  message = "Coming soon",
}: {
  visible: boolean;
  message?: string;
}) {
```

And change the label line:
```tsx
          <span style={{ fontSize: 15 }}>🚀</span>
          Coming soon
```
to:
```tsx
          <span style={{ fontSize: 15 }}>🚀</span>
          {message}
```

- [ ] **Step 2: Verify lint + build**

Run: `npx eslint src 2>&1 | grep -E "problems? \(" | tail -1`
Expected: baseline unchanged (`✖ 27 problems`).

Run: `npm run build 2>&1 | grep -E "Compiled successfully|Failed|Type error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add src/components/results/ComingSoonToast.tsx
git commit -m "feat: allow ComingSoonToast to display a custom message"
```

---

## Task 3: Activate the SearchPill camera button

**Files:**
- Modify: `src/components/results/SearchPill.tsx`

**Interfaces:**
- Consumes: existing `onCameraClick: () => void` prop (unchanged signature; the results page will rebind it in Task 4 to open the file picker).
- Produces: camera button is now visually active (not greyed) and labelled for image search.

- [ ] **Step 1: Un-grey the camera button**

Replace the camera button block (currently lines ~69–77):

```tsx
          <button
            type="button"
            onClick={onCameraClick}
            title="Image search (coming soon)"
            className="shrink-0 active:scale-90"
            style={{ marginRight: 14, lineHeight: 0 }}
          >
            <Camera size={16} style={{ color: "rgba(255,255,255,0.28)" }} />
          </button>
```

with:

```tsx
          <button
            type="button"
            onClick={onCameraClick}
            title="Search by image"
            aria-label="Search by image"
            className="shrink-0 active:scale-90 transition-opacity duration-150 ease-out hover:opacity-100"
            style={{ marginRight: 14, lineHeight: 0, opacity: 0.85 }}
          >
            <Camera size={16} style={{ color: "var(--accent)" }} />
          </button>
```

- [ ] **Step 2: Verify lint + build**

Run: `npx eslint src 2>&1 | grep -E "problems? \(" | tail -1`
Expected: baseline unchanged.

Run: `npm run build 2>&1 | grep -E "Compiled successfully|Failed|Type error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Commit**

```bash
git add src/components/results/SearchPill.tsx
git commit -m "feat: activate SearchPill camera button for image search"
```

---

## Task 4: Results-page image-search engine

**Files:**
- Modify: `src/app/results/page.tsx`

**Interfaces:**
- Consumes: `searchByImage` from `@/lib/api`; `validateImageFile` from `@/lib/pendingImageSearch`; `ComingSoonToast` `message` prop (Task 2); `SearchPill` `onCameraClick` (Task 3).
- Produces: `runImageSearch(file: File)` and image-search state (`imageFile`, `imagePreview`, `searchMode`) — consumed by Tasks 5, 6, 7.

- [ ] **Step 1: Import the API + validator**

At the top of `src/app/results/page.tsx`, the existing import is:
```tsx
import { searchProducts, toggleBookmark } from "@/lib/api";
```
Change it to:
```tsx
import { searchProducts, searchByImage, toggleBookmark } from "@/lib/api";
import { validateImageFile } from "@/lib/pendingImageSearch";
```

- [ ] **Step 2: Add image-search state**

Immediately after the existing `const [loadingMore, setLoadingMore] = useState(false);` line, add:

```tsx
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"text" | "image">("text");
  const [toastMsg, setToastMsg] = useState("Coming soon");
```

Also add a ref (next to the existing `fileInputRef`/`sentinelRef` refs) to remember the text query that was active before an image search, so clearing can restore it:

```tsx
  const preImageQueryRef = useRef("");
```

- [ ] **Step 3: Generalize the toast helper**

Replace the existing helper:
```tsx
  const showComingSoonToast = () => {
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 2200);
  };
```
with:
```tsx
  const showToast = (message = "Coming soon") => {
    setToastMsg(message);
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 2200);
  };
```

Then update the FilterBar caller (search the file for `onComingSoon={showComingSoonToast}`) to `onComingSoon={() => showToast()}`.

- [ ] **Step 4: Add `fetchImage` (mirrors `fetchText`)**

Immediately after the existing `fetchText` `useCallback` block (ends with `[],\n  );`), add:

```tsx
  const fetchImage = useCallback(
    async (file: File, pageNum: number, reset: boolean) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      try {
        const r = await searchByImage(file, pageNum);
        setTotal(r.total);
        setPage(pageNum);
        setHasNext(r.has_next);
        if (reset) setRawProducts(r.products);
        else setRawProducts((prev) => [...prev, ...r.products]);
      } catch {
        if (reset) {
          setRawProducts([]);
          setTotal(0);
          setHasNext(false);
        }
      } finally {
        if (reset) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [],
  );
```

- [ ] **Step 5: Add `runImageSearch`, `exitImageMode`, and the file-picker handler**

Immediately after `fetchImage`, add:

```tsx
  // Leave image mode WITHOUT touching the text query (so callers can restore it).
  const exitImageMode = () => {
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setImageFile(null);
    setSearchMode("text");
  };

  const runImageSearch = useCallback(
    (file: File) => {
      const err = validateImageFile(file);
      if (err) {
        showToast(err);
        return;
      }
      preImageQueryRef.current = query; // remember the text query for restore-on-clear
      setImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      setImageFile(file);
      setSearchMode("image");
      setInputValue("");
      setQuery(""); // clearing query means any later text search is a detected change
      fetchImage(file, 1, true);
    },
    // showToast is stable enough; fetchImage is memoized. `query` is included so the
    // restore ref captures the current text query (avoids a stale closure).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchImage, query],
  );

  const openImagePicker = () => fileInputRef.current?.click();

  const onImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) runImageSearch(file);
  };
```

Then wire the existing text-search entry points to leave image mode first (otherwise the mode gate added in Step 9 would block them). Update three handlers:

In `handleTextSearch`, after `if (!t) return;` add `exitImageMode();`:
```tsx
  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = inputValue.trim();
    if (!t) return;
    exitImageMode();
    setQuery(t);
    router.replace(`/results?q=${encodeURIComponent(t)}`, { scroll: false });
  };
```

In `handleTrendingSelect`, add `exitImageMode();` at the top:
```tsx
  const handleTrendingSelect = (q: string) => {
    exitImageMode();
    setInputValue(q);
    setQuery(q);
    router.replace(`/results?q=${encodeURIComponent(q)}`, { scroll: false });
  };
```

In `clearAll`, add `exitImageMode();` at the top:
```tsx
  const clearAll = () => {
    exitImageMode();
    setInputValue("");
    setQuery("");
    setRawProducts([]);
    setTotal(0);
    setHasNext(false);
    router.replace("/results", { scroll: false });
  };
```

- [ ] **Step 6: Wire the hidden file input and camera button**

Replace the existing hidden file input:
```tsx
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          e.target.value = "";
        }}
      />
```
with:
```tsx
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImageInputChange}
      />
```

In `searchPillProps`, change `onCameraClick: showComingSoonToast,` to `onCameraClick: openImagePicker,`.

- [ ] **Step 7: Branch the load-more observer on search mode**

In the IntersectionObserver `useEffect`, replace the body call:
```tsx
        if (entry.isIntersecting && hasNext && !loadingMore && !loading) {
          fetchText(query, filters, page + 1, false);
        }
```
with:
```tsx
        if (entry.isIntersecting && hasNext && !loadingMore && !loading) {
          if (searchMode === "image" && imageFile) {
            fetchImage(imageFile, page + 1, false);
          } else {
            fetchText(query, filters, page + 1, false);
          }
        }
```
and add `searchMode`, `imageFile`, `fetchImage` to that effect's dependency array (which currently ends `..., query, filters, fetchText]`), making it `..., query, filters, fetchText, searchMode, imageFile, fetchImage]`.

- [ ] **Step 8: Pass the message to ComingSoonToast**

Find the `<ComingSoonToast visible={comingSoon} />` render and change it to:
```tsx
      <ComingSoonToast visible={comingSoon} message={toastMsg} />
```

- [ ] **Step 9: Guard the text-search effect against image mode**

In the query/filters change `useEffect`, the block currently runs `fetchText` when `query` changes. To prevent it from firing during image mode (when `query` is cleared to `""`), confirm the existing `else` branch (which clears results when `!query`) does not wipe image results: wrap the effect body's start with an early return. Replace:
```tsx
    if (qChanged || fChanged) {
      if (query) fetchText(query, filters, 1, true);
      else {
        setRawProducts([]);
        setTotal(0);
        setHasNext(false);
      }
    }
```
with:
```tsx
    if (searchMode === "image") return; // image results are driven by runImageSearch
    if (qChanged || fChanged) {
      if (query) fetchText(query, filters, 1, true);
      else {
        setRawProducts([]);
        setTotal(0);
        setHasNext(false);
      }
    }
```
and add `searchMode` to that effect's dependency array.

- [ ] **Step 10: Verify lint + build**

Run: `npx eslint src 2>&1 | grep -E "problems? \(" | tail -1`
Expected: baseline unchanged (`✖ 27 problems`).

Run: `npm run build 2>&1 | grep -E "Compiled successfully|Failed|Type error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 11: Behavioral check**

Start the dev server (`npm run dev`), open `/results?q=lawn`, click the camera icon in the search pill, choose a JPG/PNG → the grid should replace text results with image-search results and `total` should update. Choose a non-image or a >10 MB file → the brutalist toast shows the validation message and no search runs.

- [ ] **Step 12: Commit**

```bash
git add src/app/results/page.tsx
git commit -m "feat: wire image search on results page (picker, fetch, load-more, validation)"
```

---

## Task 5: Active-image chip + clear

**Files:**
- Modify: `src/app/results/page.tsx`

**Interfaces:**
- Consumes: `imagePreview`, `imageFile`, `searchMode` state (Task 4); `exitImageMode()` (Task 4).
- Produces: `clearImageSearch()` — returns the page to text mode, restoring the prior text query if there was one.

- [ ] **Step 1: Add `clearImageSearch`**

Immediately after `onImageInputChange` (from Task 4 Step 5), add. `runImageSearch` stashed the prior text query in `preImageQueryRef` and cleared `query` to `""`; restoring a non-empty value here is a detected change, so the query/filters effect re-runs the text search on its own:

```tsx
  const clearImageSearch = () => {
    const restore = preImageQueryRef.current;
    exitImageMode();
    if (restore) {
      setInputValue(restore);
      setQuery(restore); // "" -> restore is a change; the query effect refetches
    } else {
      setInputValue("");
      setQuery("");
      setRawProducts([]);
      setTotal(0);
      setHasNext(false);
    }
  };
```

- [ ] **Step 2: Render the chip in the header (replacing the query text in image mode)**

In the sticky `<header>`, the center block currently is:
```tsx
        <div className="flex-1 flex justify-center px-2 min-w-0">
          <span
            className="text-[12px] truncate max-w-[160px] font-mono-brutal"
            style={{ color: "var(--ink-muted)" }}
          >
            {query}
          </span>
        </div>
```
Replace it with:
```tsx
        <div className="flex-1 flex justify-center px-2 min-w-0">
          {searchMode === "image" && imagePreview ? (
            <div
              className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 border-brutal-thin"
              style={{ background: "var(--surface)", boxShadow: "2px 2px 0 var(--ink)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Search image"
                className="w-5 h-5 object-cover"
                style={{ border: "1px solid var(--ink)" }}
              />
              <span
                className="text-[10px] font-mono-brutal uppercase tracking-wide"
                style={{ color: "var(--ink)" }}
              >
                Image
              </span>
              <button
                type="button"
                onClick={clearImageSearch}
                aria-label="Clear image search"
                className="w-4 h-4 flex items-center justify-center active:scale-90"
                style={{ color: "var(--ink)" }}
              >
                <X size={11} />
              </button>
            </div>
          ) : (
            <span
              className="text-[12px] truncate max-w-[160px] font-mono-brutal"
              style={{ color: "var(--ink-muted)" }}
            >
              {query}
            </span>
          )}
        </div>
```

- [ ] **Step 3: Import `X`**

The lucide-react import is currently:
```tsx
import { ArrowLeft, BookmarkCheck, ArrowUp } from "lucide-react";
```
Change it to add `X`:
```tsx
import { ArrowLeft, BookmarkCheck, ArrowUp, X } from "lucide-react";
```

- [ ] **Step 4: Verify lint + build**

Run: `npx eslint src 2>&1 | grep -E "problems? \(" | tail -1`
Expected: baseline unchanged.

Run: `npm run build 2>&1 | grep -E "Compiled successfully|Failed|Type error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Behavioral check**

On `/results`, run an image search → the header shows a bordered chip with the image thumbnail, an "Image" label, and an ✕. Click ✕ → returns to text mode: if a text query was previously active it re-runs; otherwise the grid clears to the empty state.

- [ ] **Step 6: Commit**

```bash
git add src/app/results/page.tsx
git commit -m "feat: show active image-search chip with clear on results page"
```

---

## Task 6: Drag-and-drop upload on results

**Files:**
- Modify: `src/app/results/page.tsx`

**Interfaces:**
- Consumes: `runImageSearch` (Task 4).
- Produces: none (self-contained UI).

- [ ] **Step 1: Add drag state and handlers**

After `clearImageSearch` (Task 5 Step 1), add:

```tsx
  const [dragging, setDragging] = useState(false);

  const onDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes("Files")) {
      e.preventDefault();
      setDragging(true);
    }
  };
  const onDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) setDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) runImageSearch(file);
  };
```

- [ ] **Step 2: Attach handlers to the page root and render the overlay**

The component's returned root is:
```tsx
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
```
Change the root `<div>` to attach drag handlers and render an overlay:
```tsx
    <div
      style={{ minHeight: "100dvh", background: "var(--bg)" }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {dragging && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          style={{ background: "color-mix(in srgb, var(--accent-soft) 88%, transparent)" }}
        >
          <div
            className="flex items-center gap-3 px-6 py-4 border-brutal"
            style={{
              background: "var(--surface)",
              boxShadow: "6px 6px 0 var(--ink)",
              borderStyle: "dashed",
            }}
          >
            <ImageIcon size={18} style={{ color: "var(--accent)" }} />
            <span className="font-display text-sm" style={{ color: "var(--ink)" }}>
              Drop image to search
            </span>
          </div>
        </div>
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
```

- [ ] **Step 3: Import the icon**

After Task 5 Step 3 the lucide-react import is:
```tsx
import { ArrowLeft, BookmarkCheck, ArrowUp, X } from "lucide-react";
```
Change it to add `Image as ImageIcon` (aliased so it never collides with `next/image`):
```tsx
import { ArrowLeft, BookmarkCheck, ArrowUp, X, Image as ImageIcon } from "lucide-react";
```

- [ ] **Step 4: Verify lint + build**

Run: `npx eslint src 2>&1 | grep -E "problems? \(" | tail -1`
Expected: baseline unchanged.

Run: `npm run build 2>&1 | grep -E "Compiled successfully|Failed|Type error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Behavioral check**

On `/results`, drag an image file over the page → a dashed brutalist "Drop image to search" overlay appears; drop it → an image search runs (same as the picker). Dragging non-file content does not trigger the overlay.

- [ ] **Step 6: Commit**

```bash
git add src/app/results/page.tsx
git commit -m "feat: add drag-and-drop image upload on results page"
```

---

## Task 7: Homepage image entry + handoff

**Files:**
- Modify: `src/components/HeroSearchCard.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/results/page.tsx`

**Interfaces:**
- Consumes: `setPendingImageSearch`, `consumePendingImageSearch`, `validateImageFile` (Task 1); `runImageSearch` (Task 4).
- Produces: homepage `HeroSearchCard` gains `onImageSelected?: (file: File) => void`.

- [ ] **Step 1: Add the camera entry to `HeroSearchCard`**

In `src/components/HeroSearchCard.tsx`:

Change the imports line:
```tsx
import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
```
to:
```tsx
import { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight, Camera } from "lucide-react";
import { validateImageFile } from "@/lib/pendingImageSearch";
```

Change the component signature:
```tsx
export default function HeroSearchCard({ onSubmit }: { onSubmit: (q: string) => void }) {
```
to:
```tsx
export default function HeroSearchCard({
  onSubmit,
  onImageSelected,
}: {
  onSubmit: (q: string) => void;
  onImageSelected?: (file: File) => void;
}) {
```

After the existing `const textareaRef = useRef<HTMLTextAreaElement>(null);` line, add:
```tsx
  const imageInputRef = useRef<HTMLInputElement>(null);
```

Reuse the existing `comingSoon` toast for validation errors: after `showComingSoon`, add:
```tsx
  const [toastText, setToastText] = useState("Men's collection coming soon");
  const flashToast = (text: string) => {
    setToastText(text);
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 2200);
  };
  const onHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      flashToast(err);
      return;
    }
    onImageSelected?.(file);
  };
```

Update the existing Men's-toggle handler to route through `flashToast` (so both messages share one toast). Change:
```tsx
                onClick={() => g === "Men" ? showComingSoon() : undefined}
```
to:
```tsx
                onClick={() => g === "Men" ? flashToast("Men's collection coming soon") : undefined}
```
and change the toast body text from the hardcoded label:
```tsx
                <span style={{ fontSize: 13 }}>🚀</span>
                Men&apos;s collection coming soon
```
to:
```tsx
                <span style={{ fontSize: 13 }}>🚀</span>
                {toastText}
```
(The now-unused `showComingSoon` function may be deleted; `flashToast` replaces it.)

Add a secondary "search by image" action + hidden input. Immediately BEFORE the closing `</div>` of the card (right after the "Find my style" `</button>`), add:
```tsx
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onHeroImageChange}
      />
      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 border-brutal-thin text-[10px] font-black uppercase tracking-widest transition-all duration-150 ease-out hover:bg-[var(--accent-soft)] active:scale-[0.99]"
        style={{ background: "var(--surface)", color: "var(--ink)" }}
      >
        <Camera size={13} style={{ color: "var(--accent)" }} />
        Search with a photo
      </button>
```

- [ ] **Step 2: Wire the homepage handler in `page.tsx`**

In `src/app/page.tsx`, add the import near the other imports:
```tsx
import { setPendingImageSearch } from "@/lib/pendingImageSearch";
```

After the existing `handleSearch` definition:
```tsx
  const handleSearch = (text: string) =>
    router.push(`/results?q=${encodeURIComponent(text)}`);
```
add:
```tsx
  const handleImageSelected = (file: File) => {
    setPendingImageSearch(file);
    router.push("/results?img=1");
  };
```

Change the hero usage:
```tsx
              <HeroSearchCard onSubmit={handleSearch} />
```
to:
```tsx
              <HeroSearchCard onSubmit={handleSearch} onImageSelected={handleImageSelected} />
```

- [ ] **Step 3: Consume the handoff on the results page**

In `src/app/results/page.tsx`, add the import:
```tsx
import { validateImageFile, consumePendingImageSearch } from "@/lib/pendingImageSearch";
```
(replace the Task 4 import that only pulled `validateImageFile`).

The results page already has an initial-mount effect that runs the text search:
```tsx
    mountedRef.current = true;
    if (initialQuery) fetchText(initialQuery, {}, 1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```
Replace its body with a branch that consumes a pending image when `?img=1` is present:
```tsx
    mountedRef.current = true;
    if (searchParams.get("img") === "1") {
      const pending = consumePendingImageSearch();
      if (pending) {
        runImageSearch(pending);
        router.replace("/results", { scroll: false });
      }
    } else if (initialQuery) {
      fetchText(initialQuery, {}, 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

- [ ] **Step 4: Verify lint + build**

Run: `npx eslint src 2>&1 | grep -E "problems? \(" | tail -1`
Expected: baseline unchanged (`✖ 27 problems`).

Run: `npm run build 2>&1 | grep -E "Compiled successfully|Failed|Type error"`
Expected: `✓ Compiled successfully`.

- [ ] **Step 5: Behavioral check**

On the homepage, click "Search with a photo", choose an image → the app navigates to `/results` and runs the image search (grid + chip appear), and the URL is cleaned to `/results`. Choose an invalid file on the homepage → the hero toast shows the validation message and no navigation happens. A hard refresh of `/results?img=1` (no pending file) falls back gracefully to the empty results state.

- [ ] **Step 6: Commit**

```bash
git add src/components/HeroSearchCard.tsx src/app/page.tsx src/app/results/page.tsx
git commit -m "feat: add homepage image-search entry and results handoff"
```

---

## Task 8: Final verification sweep

**Files:** none modified (verifies Tasks 1–7).

- [ ] **Step 1: Full lint + build**

Run: `npx eslint src 2>&1 | grep -E "problems? \(" | tail -1`
Expected: `✖ 27 problems (22 errors, 5 warnings)` (baseline; zero new).

Run: `npm run build 2>&1 | grep -E "Compiled successfully|Failed|Type error"`
Expected: `✓ Compiled successfully`, all routes generate.

- [ ] **Step 2: No leftover stubs**

Run: `grep -rn "coming soon" src/components/results/SearchPill.tsx`
Expected: no match (the camera is no longer "coming soon").

Run: `grep -rn "showComingSoonToast" src/app/results/page.tsx`
Expected: no match (renamed to `showToast`).

- [ ] **Step 3: End-to-end behavioral walkthrough**

With `npm run dev`: (a) results-page camera → picker → image results + chip; (b) chip ✕ → back to text/empty; (c) drag-drop image → results; (d) invalid file (both entries) → validation toast; (e) load-more scroll in image mode fetches page 2; (f) homepage "Search with a photo" → navigates and searches. Confirm all new UI is brutalist (thick borders, hard shadows, sharp corners).

- [ ] **Step 4: Commit (only if Step 2/3 required fixes)**

```bash
git add -A
git commit -m "chore: image search final QA fixes"
```
(Skip if nothing needed fixing.)
