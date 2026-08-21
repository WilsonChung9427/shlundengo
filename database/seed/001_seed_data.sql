-- Bulbasaur family
INSERT INTO pokemon (pokedex_number, name, slug, generation) VALUES
  (1, 'Bulbasaur', 'bulbasaur', 1),
  (2, 'Ivysaur', 'ivysaur', 1),
  (3, 'Venusaur', 'venusaur', 1);

INSERT INTO pokemon_forms (pokemon_id, form_name, form_slug, is_mega, is_default, pokemon_go_status)
SELECT id, 'Normal', slug, false, true, 'AVAILABLE' FROM pokemon WHERE slug IN ('bulbasaur', 'ivysaur', 'venusaur');

INSERT INTO pokemon_forms (pokemon_id, form_name, form_slug, is_mega, is_default, pokemon_go_status)
SELECT id, 'Mega', 'mega-venusaur', true, false, 'AVAILABLE' FROM pokemon WHERE slug = 'venusaur';

INSERT INTO evolution_families (name, slug) VALUES ('Bulbasaur Family', 'bulbasaur-family');

INSERT INTO evolution_family_members (family_id, pokemon_form_id, stage_order, branch_order)
SELECT
  (SELECT id FROM evolution_families WHERE slug = 'bulbasaur-family'),
  pf.id,
  CASE pf.form_slug
    WHEN 'bulbasaur' THEN 1
    WHEN 'ivysaur' THEN 2
    WHEN 'venusaur' THEN 3
    WHEN 'mega-venusaur' THEN 4
  END,
  0
FROM pokemon_forms pf
WHERE pf.form_slug IN ('bulbasaur', 'ivysaur', 'venusaur', 'mega-venusaur');

-- Mewtwo family (branching Mega case)
INSERT INTO pokemon (pokedex_number, name, slug, generation) VALUES
  (150, 'Mewtwo', 'mewtwo', 1);

INSERT INTO pokemon_forms (pokemon_id, form_name, form_slug, is_mega, is_default, pokemon_go_status)
SELECT id, 'Normal', 'mewtwo', false, true, 'AVAILABLE' FROM pokemon WHERE slug = 'mewtwo';

INSERT INTO pokemon_forms (pokemon_id, form_name, form_slug, is_mega, is_default, pokemon_go_status)
SELECT id, 'Mega X', 'mega-mewtwo-x', true, false, 'AVAILABLE' FROM pokemon WHERE slug = 'mewtwo';

INSERT INTO pokemon_forms (pokemon_id, form_name, form_slug, is_mega, is_default, pokemon_go_status)
SELECT id, 'Mega Y', 'mega-mewtwo-y', true, false, 'AVAILABLE' FROM pokemon WHERE slug = 'mewtwo';

INSERT INTO evolution_families (name, slug) VALUES ('Mewtwo Family', 'mewtwo-family');

INSERT INTO evolution_family_members (family_id, pokemon_form_id, stage_order, branch_order)
SELECT
  (SELECT id FROM evolution_families WHERE slug = 'mewtwo-family'),
  pf.id,
  CASE pf.form_slug
    WHEN 'mewtwo' THEN 1
    WHEN 'mega-mewtwo-x' THEN 2
    WHEN 'mega-mewtwo-y' THEN 2
  END,
  CASE pf.form_slug
    WHEN 'mega-mewtwo-x' THEN 1
    WHEN 'mega-mewtwo-y' THEN 2
    ELSE 0
  END
FROM pokemon_forms pf
WHERE pf.form_slug IN ('mewtwo', 'mega-mewtwo-x', 'mega-mewtwo-y');

-- Real trade/transfer strings
INSERT INTO strings (pokemon_form_id, string_type, string_value)
SELECT id, 'TRADE', '!3*&!4*&!dynamax&!shadow&evolve&1&cp753-1035' FROM pokemon_forms WHERE form_slug = 'bulbasaur';

INSERT INTO strings (pokemon_form_id, string_type, string_value)
SELECT id, 'TRANSFER', '!3*&!4*&!dynamax&!shadow&evolve&1&cp0-752' FROM pokemon_forms WHERE form_slug = 'bulbasaur';

INSERT INTO strings (pokemon_form_id, string_type, string_value)
SELECT id, 'TRADE', '!3*&!4*&!dynamax&!shadow&evolve&2&cp1203-1577' FROM pokemon_forms WHERE form_slug = 'ivysaur';

INSERT INTO strings (pokemon_form_id, string_type, string_value)
SELECT id, 'TRANSFER', '!3*&!4*&!dynamax&!shadow&evolve&2&cp0-1202' FROM pokemon_forms WHERE form_slug = 'ivysaur';

INSERT INTO strings (pokemon_form_id, string_type, string_value)
SELECT id, 'TRADE', '!3*&!4*&!dynamax&!shadow&evolve&3&cp2008-2526' FROM pokemon_forms WHERE form_slug = 'venusaur';

INSERT INTO strings (pokemon_form_id, string_type, string_value)
SELECT id, 'TRANSFER', '!3*&!4*&!dynamax&!shadow&evolve&3&cp0-2007' FROM pokemon_forms WHERE form_slug = 'venusaur';