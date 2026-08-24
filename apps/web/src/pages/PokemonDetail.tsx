import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getPokemon } from "../lib/api";
import type { PokemonDetail as PokemonDetailType } from "../types/pokemon";

function PokemonDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    getPokemon(slug)
      .then((res) => setPokemon(res.data))
      .catch((err) => {
        console.error(err);
        setError("Pokémon not found.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;
  if (error || !pokemon) return <div className="p-8 text-red-400">{error ?? "Not found."}</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link to="/search" className="text-slate-400 hover:text-white text-sm">
        ← Back to search
      </Link>

      <h1 className="text-3xl font-bold mt-4">
        #{pokemon.pokedex_number} {pokemon.name}
      </h1>
      {pokemon.generation && (
        <p className="text-slate-400 mt-1">Generation {pokemon.generation}</p>
      )}

      <div className="mt-8 space-y-6">
        {pokemon.forms.map((form) => (
          <div key={form.id} className="border border-slate-700 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{form.form_name}</h2>
              <span className="text-xs uppercase tracking-wide text-slate-400 bg-slate-800 px-2 py-1 rounded">
                {form.pokemon_go_status}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded">
                <span className="text-slate-300">Trade String</span>
                <span className="text-slate-500">🔒 Premium</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded">
                <span className="text-slate-300">Transfer String</span>
                <span className="text-slate-500">🔒 Premium</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-8 w-full py-3 rounded bg-blue-600 hover:bg-blue-500 font-semibold">
        Unlock Premium
      </button>
    </div>
  );
}

export default PokemonDetail;