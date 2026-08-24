import { useSearchParams } from "react-router";
import SearchBar from "../components/SearchBar";

function Search() {
  const [searchParams] = useSearchParams();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search Pokémon</h1>
      <SearchBar initialQuery={searchParams.get("q") ?? ""} />
    </div>
  );
}

export default Search;