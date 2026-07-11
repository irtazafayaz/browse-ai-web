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
