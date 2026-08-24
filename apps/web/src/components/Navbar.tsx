import { Link } from 'react-router'

function Navbar() {
  return (
    <nav className="flex items-center gap-6 px-6 py-4 border-b border-slate-700">
      <Link to="/" className="text-xl font-bold">Pokémon GO Strings</Link>
      <Link to="/search" className="text-slate-300 hover:text-white">Search</Link>
    </nav>
  )
}

export default Navbar