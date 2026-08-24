import type { FastifyInstance } from "fastify";
import { supabase } from "../lib/supabase.js";

export async function familyRoutes(app: FastifyInstance) {
  // GET /api/families/:slug — full evolution family, ordered for display
  app.get("/api/families/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const { data: family, error: familyError } = await supabase
      .from("evolution_families")
      .select("id, name, slug")
      .eq("slug", slug)
      .maybeSingle();

    if (familyError) {
      app.log.error(familyError);
      return reply.status(500).send({ error: "Failed to fetch family." });
    }

    if (!family) {
      return reply.status(404).send({ error: "Family not found." });
    }

    const { data: members, error: membersError } = await supabase
      .from("evolution_family_members")
      .select(
        "stage_order, branch_order, pokemon_form:pokemon_form_id(id, form_name, form_slug, is_mega, sprite_url, pokemon_go_status, pokemon:pokemon_id(id, pokedex_number, name, slug))"
      )
      .eq("family_id", family.id)
      .order("stage_order", { ascending: true })
      .order("branch_order", { ascending: true });

    if (membersError) {
      app.log.error(membersError);
      return reply.status(500).send({ error: "Failed to fetch family members." });
    }

    return { data: { ...family, members } };
  });
}