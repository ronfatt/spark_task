import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'sparkone_supabase_url';
const STORAGE_ANON_KEY = 'sparkone_supabase_anon_key';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  let url = '';
  let anonKey = '';

  try {
    url = (import.meta.env.VITE_SUPABASE_URL as string) || '';
    anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  } catch {
    // ignore
  }

  if ((!url || url.includes('your-project-id')) && typeof window !== 'undefined') {
    const localUrl = localStorage.getItem(STORAGE_URL_KEY);
    const localKey = localStorage.getItem(STORAGE_ANON_KEY);
    if (localUrl && localKey) {
      url = localUrl;
      anonKey = localKey;
    }
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    !url.includes('your-project-id') &&
    anonKey.length > 10
  );
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!clientInstance) {
    const { url, anonKey } = getSupabaseConfig();
    clientInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
}

export const supabase = getSupabaseClient();
