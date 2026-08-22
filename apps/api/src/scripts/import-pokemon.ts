import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Change this range later to import more (e.g. 1 to 1025 for everything).
const START_ID = 1;
const END_ID = 1025;

const DELAY_MS = 150; // be polite to PokéAPI's fair-use policy

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PokeApiPokemon {
  id: number;
  name: string;
  sprites: {
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
}

async function fetchPokemon(id: number): Promise<PokeApiPokemon> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) {
    throw new Error(`PokéAPI returned ${res.status} for id ${id}`);
  }
  return res.json();
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function importPokemon(id: number) {
  const data = await fetchPokemon(id);
  const slug = toSlug(data.name);
  const spriteUrl = data.sprites.other?.["official-artwork"]?.front_default ?? null;

  // Skip if this Pokémon already exists — never overwrite manually curated data.
  const { data: existing } = await supabase
    .from("pokemon")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    console.log(`  [${id}] ${data.name} — already exists, skipping`);
    return;
  }

  const { data: inserted, error: pokemonError } = await supabase
    .from("pokemon")
    .insert({
      pokedex_number: data.id,
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      slug,
      generation: null, // we'll backfill this properly in a later pass
    })
    .select("id")
    .single();

  if (pokemonError || !inserted) {
    console.error(`  [${id}] ${data.name} — failed to insert pokemon:`, pokemonError);
    return;
  }

  const { error: formError } = await supabase.from("pokemon_forms").insert({
    pokemon_id: inserted.id,
    form_name: "Normal",
    form_slug: slug,
    is_mega: false,
    is_default: true,
    sprite_url: spriteUrl,
    pokemon_go_status: "AVAILABLE",
  });

  if (formError) {
    console.error(`  [${id}] ${data.name} — failed to insert pokemon_forms:`, formError);
    return;
  }

  console.log(`  [${id}] ${data.name} — imported`);
}

async function main() {
  console.log(`Importing Pokémon #${START_ID}–${END_ID} from PokéAPI...`);

  for (let id = START_ID; id <= END_ID; id++) {
    try {
      await importPokemon(id);
    } catch (err) {
      console.error(`  [${id}] failed:`, err);
    }
    await sleep(DELAY_MS);
  }

  console.log("Done.");
}

main();