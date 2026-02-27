/**
 * API client for the Browse AI Django backend.
 * Base URL: NEXT_PUBLIC_API_URL (defaults to http://localhost:8000)
 *
 * Handles:
 * - JWT access/refresh token storage in localStorage
 * - Automatic token refresh on 401
 * - Auth headers on every request
 */

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

  // Auto-refresh on 401
  if (res.status === 401 && retry && tokens.refresh) {
    const refreshed = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });

    if (refreshed.ok) {
      const data = await refreshed.json();
      tokens.set(data.access, data.refresh ?? tokens.refresh!);
      return apiFetch(path, options, false); // retry once
    } else {
      tokens.clear(); // refresh token expired — force re-login
    }
  }

  return res;
}

// ── Auth ───────────────────────────────────────────────────────────────
export interface AuthResponse {
  access: string;
  refresh: string;
  user: { id: number; email: string; first_name: string; last_name: string; avatar_url: string };
}

export async function register(email: string, password: string, password2: string, firstName = '', lastName = ''): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ email, password, password2, first_name: firstName, last_name: lastName }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
  const data: AuthResponse = await res.json();
  tokens.set(data.access, data.refresh);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? 'Login failed');
  }
  const data: AuthResponse = await res.json();
  tokens.set(data.access, data.refresh);
  return data;
}

export async function logout(): Promise<void> {
  if (tokens.refresh) {
    await apiFetch('/api/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
  }
  tokens.clear();
}

export async function googleAuth(idToken: string): Promise<AuthResponse> {
  const res = await apiFetch('/api/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? 'Google auth failed');
  }
  const data: AuthResponse = await res.json();
  tokens.set(data.access, data.refresh);
  return data;
}

export async function getMe() {
  const res = await apiFetch('/api/auth/me/');
  if (!res.ok) return null;
  return res.json();
}

// ── Products ───────────────────────────────────────────────────────────
export async function getProducts(q?: string) {
  const url = q ? `/api/products/?q=${encodeURIComponent(q)}` : '/api/products/';
  const res = await apiFetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function getProduct(id: string) {
  const res = await apiFetch(`/api/products/${id}/`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function searchProducts(query: string, history: { sender: string; text: string }[]) {
  const res = await apiFetch('/api/products/search/', {
    method: 'POST',
    body: JSON.stringify({ query, history }),
  });
  if (!res.ok) throw new Error('Search failed');
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
