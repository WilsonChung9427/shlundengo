import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getPokemon, getPokemonStrings, type PokemonString } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { PokemonDetail as PokemonDetailType } from "../types/pokemon";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function PokemonDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();

  const [pokemon, setPokemon] = useState<PokemonDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [strings, setStrings] = useState<PokemonString[] | null>(null);
  const [stringsStatus, setStringsStatus] = useState <
    "idle" | "loading" | "unauthenticated" | "not-premium" | "loaded" | "error"
  >("idle");

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

  useEffect(() => {
    if (!slug || authLoading) return;

    if (!user) {
      setStringsStatus("unauthenticated");
      return;
    }

    setStringsStatus("loading");
    getPokemonStrings(slug).then((res) => {
      if ("error" in res) {
        setStringsStatus(res.status === 403 ? "not-premium" : "unauthenticated");
        return;
      }
      setStrings(res.data);
      setStringsStatus("loaded");
    });
  }, [slug, user, authLoading]);

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;
  if (error || !pokemon) return <div className="p-8 text-red-400">{error ?? "Not found."}</div>;

  function stringFor(formId: string, type: "TRADE" | "TRANSFER") {
    return strings?.find((s) => s.pokemon_form_id === formId && s.string_type === type);
  }

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
                {pokemon.forms.map((form) => {
          if (form.is_mega) {
            return (
              <div
                key={form.id}
                className="border border-slate-700 rounded-lg p-5 flex items-center gap-4"
              >
                {form.sprite_url ? (
                  <img src={form.sprite_url} alt={form.form_name} className="w-16 h-16" />
                ) : (
                  <div className="w-16 h-16 rounded bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
                    No image
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">{form.form_name}</h2>
                  <span className="text-xs uppercase tracking-wide text-slate-400 bg-slate-800 px-2 py-1 rounded inline-block mt-1">
                    {form.pokemon_go_status}
                  </span>
                </div>
              </div>
            );
          }

          const trade = stringFor(form.id, "TRADE");
          const transfer = stringFor(form.id, "TRANSFER");

          return (
            <div key={form.id} className="border border-slate-700 rounded-lg p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{form.form_name}</h2>
                <span className="text-xs uppercase tracking-wide text-slate-400 bg-slate-800 px-2 py-1 rounded">
                  {form.pokemon_go_status}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {(["Trade", "Transfer"] as const).map((label) => {
                  const stringData = label === "Trade" ? trade : transfer;
                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded gap-3"
                    >
                      <span className="text-slate-300 shrink-0">{label} String</span>
                      {stringsStatus === "loaded" && stringData ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <code className="text-xs text-green-400 truncate">
                            {stringData.string_value}
                          </code>
                          <CopyButton text={stringData.string_value} />
                        </div>
                      ) : (
                        <span className="text-slate-500">🔒 Premium</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {stringsStatus !== "loaded" && (
        <div className="mt-8 text-center">
          {stringsStatus === "unauthenticated" && (
            <a
              href={`${API_URL}/api/auth/discord/login`}
              className="inline-block w-full py-3 rounded bg-[#5865F2] hover:bg-[#4752C4] font-semibold"
            >
              Login with Discord to Unlock Premium
            </a>
          )}
          {stringsStatus === "not-premium" && (
            <div className="w-full py-3 rounded bg-blue-600 text-center">
              <p className="font-semibold">Unlock Premium</p>
              <p className="text-sm text-blue-100 mt-1">
                Get a premium membership to access trade and transfer strings.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PokemonDetail;