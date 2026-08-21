-- Enums
CREATE TYPE pokemon_go_status AS ENUM ('AVAILABLE', 'UPCOMING', 'ANNOUNCED', 'SPECULATIVE');
CREATE TYPE string_type AS ENUM ('TRADE', 'TRANSFER');

-- Base species
CREATE TABLE pokemon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pokedex_number INT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  generation INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every displayable form, including base form and all Megas
CREATE TABLE pokemon_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pokemon_id UUID NOT NULL REFERENCES pokemon(id) ON DELETE CASCADE,
  form_name TEXT NOT NULL,
  form_slug TEXT NOT NULL UNIQUE,
  is_mega BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sprite_url TEXT,
  pokemon_go_status pokemon_go_status NOT NULL DEFAULT 'SPECULATIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pokemon_forms_pokemon_id ON pokemon_forms(pokemon_id);

-- Evolution family groupings
CREATE TABLE evolution_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ordered membership: which forms belong to which family, and where
CREATE TABLE evolution_family_members (
  family_id UUID NOT NULL REFERENCES evolution_families(id) ON DELETE CASCADE,
  pokemon_form_id UUID NOT NULL REFERENCES pokemon_forms(id) ON DELETE CASCADE,
  stage_order INT NOT NULL,
  branch_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (family_id, pokemon_form_id)
);

CREATE INDEX idx_family_members_family_id ON evolution_family_members(family_id);

-- Trade/transfer strings — premium content
CREATE TABLE strings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pokemon_form_id UUID NOT NULL REFERENCES pokemon_forms(id) ON DELETE CASCADE,
  string_type string_type NOT NULL,
  string_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pokemon_form_id, string_type)
);