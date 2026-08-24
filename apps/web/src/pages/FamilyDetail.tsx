import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { getFamily } from "../lib/api";
import EvolutionFamily from "../components/EvolutionFamily";
import type { Family } from "../types/pokemon";

function FamilyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    setError(null);

    getFamily(slug)
      .then((res) => setFamily(res.data))
      .catch((err) => {
        console.error(err);
        setError("Family not found.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;
  if (error || !family) return <div className="p-8 text-red-400">{error ?? "Not found."}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/search" className="text-slate-400 hover:text-white text-sm">
        ← Back to search
      </Link>
      <div className="mt-6">
        <EvolutionFamily family={family} />
      </div>
    </div>
  );
}

export default FamilyDetail;