import { Routes, Route } from 'react-router'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import PokemonDetail from './pages/PokemonDetail'
import FamilyDetail from './pages/FamilyDetail'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/pokemon/:slug" element={<PokemonDetail />} />
        <Route path="/families/:slug" element={<FamilyDetail />} />
      </Routes>
    </div>
  )
}

export default App