const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
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