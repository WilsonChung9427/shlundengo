import { Link } from "react-router";
import type { Family, FamilyMember } from "../types/pokemon";

function groupByStage(members: FamilyMember[]) {
  const stages = new Map<number, FamilyMember[]>();
  for (const member of members) {
    const group = stages.get(member.stage_order) ?? [];
    group.push(member);
    stages.set(member.stage_order, group);
  }
  return [...stages.entries()]
    .sort(([a], [b]) => a - b)
    .map(([stageOrder, group]) => ({
      stageOrder,
      members: group.sort((a, b) => a.branch_order - b.branch_order),
    }));
}

function MemberCard({ member }: { member: FamilyMember }) {
  const { pokemon_form, stage_order } = member;
  const displayName =
    pokemon_form.form_name === "Normal"
      ? pokemon_form.pokemon.name
      : `${pokemon_form.form_name} ${pokemon_form.pokemon.name}`;

  return (
    <Link
      to={`/pokemon/${pokemon_form.pokemon.slug}`}
      className="flex flex-col items-center gap-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 min-w-[120px]"
    >
      <span className="text-xs text-slate-400">#{pokemon_form.pokemon.pokedex_number}</span>
      <span className="font-semibold text-center">{displayName}</span>
      {pokemon_form.is_mega && (
        <span className="text-xs text-purple-400">Mega</span>
      )}
    </Link>
  );
}

function EvolutionFamily({ family }: { family: Family }) {
  const stages = groupByStage(family.members);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{family.name}</h2>
      <div className="flex items-center gap-3 flex-wrap">
        {stages.map((stage, i) => (
          <div key={stage.stageOrder} className="flex items-center gap-3">
            {i > 0 && <span className="text-slate-500 text-xl">→</span>}
            {stage.members.length === 1 ? (
              <MemberCard member={stage.members[0]} />
            ) : (
              // Multiple members at the same stage = branching (e.g. Mega X / Mega Y)
              <div className="flex flex-col gap-2">
                {stage.members.map((m) => (
                  <MemberCard key={m.pokemon_form.id} member={m} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvolutionFamily;