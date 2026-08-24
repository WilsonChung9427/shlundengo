import { Routes, Route } from 'react-router'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Search from './pages/Search'
import PokemonDetail from './pages/PokemonDetail'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/pokemon/:slug" element={<PokemonDetail />} />
      </Routes>
    </div>
  )
}

export default App