import SearchBar from "../components/SearchBar";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="max-w-3xl mx-auto px-8 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">Pokémon GO Strings</h1>
      <p className="text-slate-400 text-lg mb-10">
        Find trade and transfer strings for every Pokémon, organized by
        evolution family — including Mega Evolutions.
      </p>

      <div className="max-w-lg mx-auto mb-16">
        <SearchBar onSubmitNavigateToResults />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 text-left">
        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h2 className="font-semibold text-lg mb-2">Free to browse</h2>
          <p className="text-slate-400 text-sm">
            Search any Pokémon, see its evolution family, Mega Evolutions,
            and Pokémon GO availability status — no account needed.
          </p>
        </div>
        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h2 className="font-semibold text-lg mb-2">Premium strings</h2>
          <p className="text-slate-400 text-sm">
            Unlock trade and transfer strings for every Pokémon with a
            premium membership, tied to your Discord account.
          </p>
        </div>
      </div>

      {!loading && !user && (
        <div className="mt-12">
          <a
            href={`${API_URL}/api/auth/discord/login`}
            className="inline-block px-8 py-3 rounded bg-[#5865F2] hover:bg-[#4752C4] font-semibold"
          >
            Login with Discord
          </a>
        </div>
      )}

      {!loading && user && (
        <p className="mt-12 text-slate-400">Welcome back, {user.username}!</p>
      )}
    </div>
  );
}

export default Home;