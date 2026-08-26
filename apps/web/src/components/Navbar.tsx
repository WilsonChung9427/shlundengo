import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

function Navbar() {
  const { user, loading, logout } = useAuth()

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold">Pokémon GO Strings</Link>
        <Link to="/search" className="text-slate-300 hover:text-white">Search</Link>
      </div>

      <div>
        {loading ? null : user ? (
          <div className="flex items-center gap-3">
            <span className="text-slate-300 text-sm">{user.username}</span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <a
            href={`${API_URL}/api/auth/discord/login`}
            className="text-sm px-4 py-1.5 rounded bg-[#5865F2] hover:bg-[#4752C4] font-semibold"
          >
            Login with Discord
          </a>
        )}
      </div>
    </nav>
  )
}

export default Navbar