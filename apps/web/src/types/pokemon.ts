export interface PokemonSummary {
  id: string;
  pokedex_number: number;
  name: string;
  slug: string;
  generation: number | null;
}

export interface PokemonForm {
  id: string;
  form_name: string;
  form_slug: string;
  is_mega: boolean;
  is_default?: boolean;
  sprite_url: string | null;
  pokemon_go_status: "AVAILABLE" | "UPCOMING" | "ANNOUNCED" | "SPECULATIVE";
}

export interface PokemonDetail extends PokemonSummary {
  forms: PokemonForm[];
}

export interface FamilyMember {
  stage_order: number;
  branch_order: number;
  pokemon_form: PokemonForm & {
    pokemon: PokemonSummary;
  };
}

export interface Family {
  id: string;
  name: string;
  slug: string;
  members: FamilyMember[];
}

export interface SearchResults {
  formMatches: (PokemonForm & { pokemon: PokemonSummary })[];
  nameMatches: PokemonSummary[];
}