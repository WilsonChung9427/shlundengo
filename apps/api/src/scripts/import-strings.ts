import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(__dirname, "../../../../database/seed/pokemon-strings.csv");

interface CsvRow {
  Dex: string;
  "Trade String": string;
  "Transfer String": string;
}

async function upsertString(pokemonFormId: string, type: "TRADE" | "TRANSFER", value: string, dex: string) {
  if (!value || value.trim() === "") return;

  const { data: existing } = await supabase
    .from("strings")
    .select("id")
    .eq("pokemon_form_id", pokemonFormId)
    .eq("string_type", type)
    .maybeSingle();

  if (existing) {
    console.log(`  [Dex ${dex}] ${type} — already exists, skipping`);
    return;
  }

  const { error } = await supabase.from("strings").insert({
    pokemon_form_id: pokemonFormId,
    string_type: type,
    string_value: value,
  });

  if (error) {
    console.error(`  [Dex ${dex}] ${type} — failed to insert:`, error.message);
  } else {
    console.log(`  [Dex ${dex}] ${type} — imported`);
  }
}

async function main() {
  const csvContent = readFileSync(CSV_PATH, "utf-8");
  const rows: CsvRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Read ${rows.length} rows from CSV.`);

  const missing: string[] = [];

  for (const row of rows) {
    const dex = row.Dex?.trim();
    if (!dex) continue;

    const { data: pokemon } = await supabase
      .from("pokemon")
      .select("id")
      .eq("pokedex_number", parseInt(dex, 10))
      .maybeSingle();

    if (!pokemon) {
      missing.push(dex);
      continue;
    }

    const { data: form } = await supabase
      .from("pokemon_forms")
      .select("id")
      .eq("pokemon_id", pokemon.id)
      .eq("is_default", true)
      .maybeSingle();

    if (!form) {
      missing.push(dex);
      continue;
    }

    await upsertString(form.id, "TRADE", row["Trade String"], dex);
    await upsertString(form.id, "TRANSFER", row["Transfer String"], dex);
  }

  console.log("Done.");
  if (missing.length > 0) {
    console.log(`\n${missing.length} Dex numbers had no matching Pokémon in the database yet:`);
    console.log(missing.join(", "));
  }
}

main();