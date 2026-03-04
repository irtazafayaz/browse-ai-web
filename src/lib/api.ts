/**
 * API client for the Browse AI Django backend.
 * Base URL: NEXT_PUBLIC_API_URL (defaults to http://localhost:8000)
 *
 * Handles:
 * - JWT access/refresh token storage in localStorage
 * - Automatic token refresh on 401
 * - Auth headers on every request
 */

import { PaginatedProducts } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Token helpers ──────────────────────────────────────────────────────
export const tokens = {
  get access()  { return typeof window !== 'undefined' ? localStorage.getItem('access_token')  : null; },
  get refresh() { return typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null; },
  set(access: string, refresh: string) {
    localStorage.setItem('access_token',  access);
    localStorage.setItem('refresh_token', refresh);
  },
  clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// ── Token refresh lock — prevents concurrent refresh races ─────────────
let _refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const refresh = tokens.refresh;
    if (!refresh) return false;
    try {
      const res = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) { tokens.clear(); return false; }
      const data = await res.json();
      if (!data.access) { tokens.clear(); return false; }
      tokens.set(data.access, data.refresh ?? refresh);
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Safe JSON parse helper ─────────────────────────────────────────────
async function safeJson<T>(res: Response): Promise<T | null> {
  try { return await res.json() as T; } catch { return null; }
}

// ── Core fetch wrapper ─────────────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (tokens.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry && tokens.refresh) {
    const refreshed = await refreshTokens();
    if (refreshed) return apiFetch(path, options, false);
  }

  return res;
}

// ── Auth ───────────────────────────────────────────────────────────────
export interface AuthResponse {
  access: string;
  refresh: string;
  user: { id: number; email: string; first_name: string; last_name: string; avatar_url: string };
}

function parseDrfError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;
  const e = err as Record<string, unknown>;
  if (typeof e.detail === 'string') return e.detail;
  const msgs: string[] = [];
  for (const val of Object.values(e)) {
    if (Array.isArray(val)) val.forEach(v => typeof v === 'string' && msgs.push(v));
    else if (typeof val === 'string') msgs.push(val);
  }
  return msgs.length ? msgs.join(' ') : fallback;
}

export async function register(email: string, password: string, password2: string, firstName = '', lastName = ''): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ email, password, password2, first_name: firstName, last_name: lastName }),
  });
  const body = await safeJson<Record<string, unknown>>(res);
  if (!res.ok) throw new Error(parseDrfError(body, 'Registration failed.'));
  const data = body as unknown as AuthResponse;
  if (!data?.access || !data?.refresh) throw new Error('Invalid response from server.');
  tokens.set(data.access, data.refresh);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const body = await safeJson<Record<string, unknown>>(res);
  if (!res.ok) throw new Error(parseDrfError(body, 'Login failed. Check your credentials.'));
  const data = body as unknown as AuthResponse;
  if (!data?.access || !data?.refresh) throw new Error('Invalid response from server.');
  tokens.set(data.access, data.refresh);
  return data;
}

export async function logout(): Promise<void> {
  const refresh = tokens.refresh;
  tokens.clear();
  if (refresh) {
    apiFetch('/api/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }
}

export async function googleAuth(accessToken: string): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ access_token: accessToken }),
  });
  const body = await safeJson<Record<string, unknown>>(res);
  if (!res.ok) throw new Error(parseDrfError(body, 'Google sign-in failed.'));
  const data = body as unknown as AuthResponse;
  if (!data?.access || !data?.refresh) throw new Error('Invalid response from server.');
  tokens.set(data.access, data.refresh);
  return data;
}

export async function getMe() {
  const res = await apiFetch('/api/auth/me/');
  if (!res.ok) return null;
  return res.json();
}

// ── Products ───────────────────────────────────────────────────────────

export interface ProductsParams {
  q?: string;
  page?: number;
  page_size?: number;
  brand?: string;
  min_price?: number;
  max_price?: number;
  tags?: string[];
}

export async function getProducts(params: ProductsParams = {}): Promise<PaginatedProducts> {
  const qs = new URLSearchParams();
  if (params.q)                       qs.set('q',         params.q);
  if (params.page)                    qs.set('page',      String(params.page));
  if (params.page_size)               qs.set('page_size', String(params.page_size));
  if (params.brand)                   qs.set('brand',     params.brand);
  if (params.min_price != null)       qs.set('min_price', String(params.min_price));
  if (params.max_price != null)       qs.set('max_price', String(params.max_price));
  if (params.tags?.length)            qs.set('tags',      params.tags.join(','));

  const query = qs.toString();
  const res = await apiFetch(`/api/products/${query ? '?' + query : ''}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProduct(id: string) {
  const res = await apiFetch(`/api/products/${id}/`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

/** Image-based product search. Sends a multipart form with an image file. */
export async function searchByImage(file: File, page = 1): Promise<PaginatedProducts> {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('page', String(page));

  // Don't use apiFetch here — it forces Content-Type: application/json which breaks multipart.
  // Build auth header manually instead.
  const headers: Record<string, string> = {};
  if (tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`;

  const res = await fetch(`${BASE_URL}/api/products/image-search/`, {
    method: 'POST',
    headers,
    body: formData,
  });

  // Retry once on 401
  if (res.status === 401 && tokens.refresh) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const headers2: Record<string, string> = {};
      if (tokens.access) headers2['Authorization'] = `Bearer ${tokens.access}`;
      const formData2 = new FormData();
      formData2.append('image', file);
      formData2.append('page', String(page));
      const res2 = await fetch(`${BASE_URL}/api/products/image-search/`, {
        method: 'POST',
        headers: headers2,
        body: formData2,
      });
      if (!res2.ok) throw new Error('Image search failed');
      return res2.json();
    }
  }

  if (!res.ok) throw new Error('Image search failed');
  return res.json();
}

export async function toggleBookmark(productId: string) {
  const res = await apiFetch(`/api/products/${productId}/bookmark/`, { method: 'POST' });
  if (!res.ok) throw new Error('Bookmark failed');
  return res.json();
}

export async function getBookmarks() {
  const res = await apiFetch('/api/products/bookmarks/');
  if (!res.ok) throw new Error('Failed to fetch bookmarks');
  return res.json();
}

export async function getBrands(): Promise<string[]> {
  const res = await apiFetch('/api/products/brands/');
  if (!res.ok) return [];
  return res.json();
}

export async function getEdits(): Promise<{ label: string; imageUrl: string; tag: string }[]> {
  const res = await apiFetch('/api/products/edits/');
  if (!res.ok) return [];
  return res.json();
}

export async function getPrompts(): Promise<string[]> {
  const res = await apiFetch('/api/products/prompts/');
  if (!res.ok) return [];
  return res.json();
}
