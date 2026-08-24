import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabase.js";

export async function searchRoutes(app: FastifyInstance) {
  // GET /api/pokemon/search?q=... — search by name (partial), form name, or Dex number
  app.get("/api/pokemon/search", async (request, reply) => {
    const query = request.query as { q?: string };
    const rawQuery = (query.q ?? "").trim();

    if (rawQuery.length === 0) {
      return { data: [] };
    }

    // Support "#003" or "003" style Dex number lookups
    const dexMatch = rawQuery.match(/^#?(\d+)$/);

    if (dexMatch) {
      const dexNumber = parseInt(dexMatch[1], 10);
      const { data, error } = await supabase
        .from("pokemon")
        .select("id, pokedex_number, name, slug, generation")
        .eq("pokedex_number", dexNumber)
        .limit(1);

      if (error) {
        app.log.error(error);
        return reply.status(500).send({ error: "Search failed." });
      }

      return { data };
    }

    // Otherwise, search pokemon_forms by form_name (covers base names AND "Mega X" style names)
    // Also search the base pokemon.name, in case someone searches "venusaur" but not "mega venusaur"
    const { data: formMatches, error: formError } = await supabase
      .from("pokemon_forms")
      .select("id, form_name, form_slug, is_mega, pokemon:pokemon_id(id, pokedex_number, name, slug, generation)")
      .ilike("form_name", `%${rawQuery}%`)
      .limit(20);

    if (formError) {
      app.log.error(formError);
      return reply.status(500).send({ error: "Search failed." });
    }

    const { data: nameMatches, error: nameError } = await supabase
      .from("pokemon")
      .select("id, pokedex_number, name, slug, generation")
      .ilike("name", `%${rawQuery}%`)
      .limit(20);

    if (nameError) {
      app.log.error(nameError);
      return reply.status(500).send({ error: "Search failed." });
    }

    return { data: { formMatches, nameMatches } };
  });
}