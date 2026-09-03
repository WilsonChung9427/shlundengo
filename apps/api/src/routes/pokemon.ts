import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabase.js";
import { hasPremiumAccess } from "../lib/discord.js";

export async function pokemonRoutes(app: FastifyInstance) {
  // GET /api/pokemon — paginated list of all Pokémon (public data only)
  app.get("/api/pokemon", async (request, reply) => {
    const query = request.query as { page?: string; limit?: string };
    const page = Math.max(1, parseInt(query.page ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20", 10)));
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("pokemon")
      .select("id, pokedex_number, name, slug, generation", { count: "exact" })
      .order("pokedex_number", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      app.log.error(error);
      return reply.status(500).send({ error: "Failed to fetch Pokémon." });
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    };
  });

    // GET /api/pokemon/:slug/strings — premium trade/transfer strings, gated by Discord role
  app.get("/api/pokemon/:slug/strings", async (request, reply) => {
    const user = request.session.get("discordUser");

    if (!user) {
      return reply.status(401).send({ error: "Not logged in." });
    }

    const isPremium = await hasPremiumAccess(user.id);

    if (!isPremium) {
      return reply.status(403).send({ error: "Premium access required." });
    }

    const { slug } = request.params as { slug: string };

    const { data: pokemon, error: pokemonError } = await supabase
      .from("pokemon")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (pokemonError || !pokemon) {
      return reply.status(404).send({ error: "Pokémon not found." });
    }

    const { data: forms, error: formsError } = await supabase
      .from("pokemon_forms")
      .select("id, form_slug")
      .eq("pokemon_id", pokemon.id);

    if (formsError || !forms) {
      return reply.status(500).send({ error: "Failed to fetch forms." });
    }

    const formIds = forms.map((f) => f.id);

    const { data: strings, error: stringsError } = await supabase
      .from("strings")
      .select("pokemon_form_id, string_type, string_value")
      .in("pokemon_form_id", formIds);

    if (stringsError) {
      app.log.error(stringsError);
      return reply.status(500).send({ error: "Failed to fetch strings." });
    }

    return { data: strings };
  });

  // GET /api/pokemon/:slug — a single Pokémon's public detail info
  app.get("/api/pokemon/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const { data: pokemon, error: pokemonError } = await supabase
      .from("pokemon")
      .select("id, pokedex_number, name, slug, generation")
      .eq("slug", slug)
      .maybeSingle();

    if (pokemonError) {
      app.log.error(pokemonError);
      return reply.status(500).send({ error: "Failed to fetch Pokémon." });
    }

    if (!pokemon) {
      return reply.status(404).send({ error: "Pokémon not found." });
    }

    const { data: forms, error: formsError } = await supabase
      .from("pokemon_forms")
      .select("id, form_name, form_slug, is_mega, is_default, sprite_url, pokemon_go_status")
      .eq("pokemon_id", pokemon.id);

    if (formsError) {
      app.log.error(formsError);
      return reply.status(500).send({ error: "Failed to fetch Pokémon forms." });
    }

    return { data: { ...pokemon, forms } };
  });
}