const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();
}

// TypeScript types for API responses
export interface Pack {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  grade?: string;
  color?: string;
  image_url?: string;
}

export interface VocabItem {
  id: string;
  pack_id: string;
  label: string;
  say?: string;
  icon?: string;
  image_url?: string;
  order: number;
}

// API functions
export async function getPacks(): Promise<Pack[]> {
  return api("/packs");
}

export async function getVocabItems(packId?: string): Promise<VocabItem[]> {
  const query = packId ? `?pack_id=${packId}` : "";
  return api(`/vocab${query}`);
}
