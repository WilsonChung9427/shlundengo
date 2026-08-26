const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
import type { PokemonDetail, Family, SearchResults } from "../types/pokemon";

export function searchPokemon(query: string) {
  return apiFetch<{ data: SearchResults | [] }>(
    `/api/pokemon/search?q=${encodeURIComponent(query)}`
  );
}

export function getPokemon(slug: string) {
  return apiFetch<{ data: PokemonDetail }>(`/api/pokemon/${slug}`);
}

export function getFamily(slug: string) {
  return apiFetch<{ data: Family }>(`/api/families/${slug}`);
}

export interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
}

export async function getMe(): Promise<{ data: DiscordUser } | null> {
  const res = await fetch(`${API_URL}/api/me`, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to fetch current user.");
  return res.json();
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}