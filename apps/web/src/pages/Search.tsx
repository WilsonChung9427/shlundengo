import { useState } from "react";
import { Link } from "react-router";
import { searchPokemon } from "../lib/api";
import type { SearchResults } from "../types/pokemon";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await searchPokemon(query);
      if (Array.isArray(res.data)) {
        // Dex-number search returns a plain array
        setResults({ formMatches: [], nameMatches: res.data });
      } else {
        setResults(res.data);
      }
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search Pokémon</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, Dex number, or Mega..."
          className="flex-1 px-4 py-2 rounded bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-slate-400"
        />
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-500 font-semibold"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-slate-400">Searching...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {results && (
        <div className="space-y-3">
          {results.nameMatches.length === 0 && results.formMatches.length === 0 && (
            <p className="text-slate-400">No results found.</p>
          )}

          {results.nameMatches.map((p) => (
            <Link
              key={p.id}
              to={`/pokemon/${p.slug}`}
              className="block px-4 py-3 rounded bg-slate-800 hover:bg-slate-700"
            >
              #{p.pokedex_number} {p.name}
            </Link>
          ))}

          {results.formMatches.map((f) => (
            <Link
              key={f.id}
              to={`/pokemon/${f.pokemon.slug}`}
              className="block px-4 py-3 rounded bg-slate-800 hover:bg-slate-700"
            >
              #{f.pokemon.pokedex_number} {f.pokemon.name} — {f.form_name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;