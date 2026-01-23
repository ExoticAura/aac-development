const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export async function api(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  return res.json();

}
