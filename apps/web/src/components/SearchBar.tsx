import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { searchPokemon } from "../lib/api";
import type { SearchResults } from "../types/pokemon";

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface SearchBarProps {
  initialQuery?: string;
  onSubmitNavigateToResults?: boolean;
}

function SearchBar({ initialQuery = "", onSubmitNavigateToResults = false }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedQuery = useDebounced(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  async function runSearch(q: string) {
    if (q.trim().length === 0) {
      setResults(null);
      return;
    }
    try {
      const res = await searchPokemon(q);
      if (Array.isArray(res.data)) {
        setResults({ formMatches: [], nameMatches: res.data });
      } else {
        setResults(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length === 0) return;
    setShowDropdown(false);
    if (onSubmitNavigateToResults) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      runSearch(query);
    }
  }

  const hasDropdownResults =
    results && (results.nameMatches.length > 0 || results.formMatches.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search by name, Dex number, or Mega..."
          className="flex-1 px-4 py-3 rounded bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-slate-400"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-500 font-semibold"
        >
          Search
        </button>
      </form>

      {showDropdown && hasDropdownResults && (
        <div className="absolute z-10 mt-1 w-full max-h-80 overflow-y-auto bg-slate-800 border border-slate-600 rounded shadow-lg text-left">
          {results!.nameMatches.map((p) => (
            <Link
              key={p.id}
              to={`/pokemon/${p.slug}`}
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 hover:bg-slate-700 border-b border-slate-700 last:border-b-0"
            >
              #{p.pokedex_number} {p.name}
            </Link>
          ))}
          {results!.formMatches.map((f) => (
            <Link
              key={f.id}
              to={`/pokemon/${f.pokemon.slug}`}
              onClick={() => setShowDropdown(false)}
              className="block px-4 py-2 hover:bg-slate-700 border-b border-slate-700 last:border-b-0"
            >
              #{f.pokemon.pokedex_number} {f.pokemon.name} — {f.form_name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;