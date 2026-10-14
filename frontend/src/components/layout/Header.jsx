import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Search, ShoppingCart, User, Leaf, X } from 'lucide-react'
import { useState } from 'react'
import { useLang } from '../../context/LangContext'
import { useCart } from '../../context/CartContext'

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mewari', label: 'मेवाड़ी' },
]

export default function Header() {
  const { lang, switchLang, t } = useLang()
  const { count } = useCart()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
      setQuery('')
    }
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-40 shadow-nav">
      <div className="max-w-container mx-auto px-3 md:px-6 py-2.5 flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-primary rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-primary text-sm leading-tight">Aravalli Agri-Tech</div>
            <div className="text-xxs text-text-muted leading-tight">Watershed Intelligence</div>
          </div>
        </Link>

        {/* Location chip */}
        <button className="hidden md:flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-chip border border-primary-200 hover:bg-primary-100 transition-colors shrink-0">
          <MapPin className="w-3 h-3" />
          <span>Udaipur, RJ (24.58°N)</span>
          <span className="bg-green-500 text-white text-xxs px-1 rounded-sm">Zone 4</span>
        </button>

        {/* Search bar — desktop */}
        <div className="hidden md:flex flex-1 max-w-lg">
          <form onSubmit={handleSearch} className="w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('header.search')}
              className="input pl-9 py-2 text-xs"
              aria-label="Search"
            />
          </form>
        </div>

        {/* Mobile search toggle */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onClick={() => setSearchOpen(s => !s)}
          aria-label="Search"
        >
          {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </button>

        {/* Language switch — desktop */}
        <div className="hidden md:flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5 shrink-0">
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => switchLang(l.code)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                ${lang === l.code ? 'bg-white shadow-sm text-primary font-semibold' : 'text-text-muted hover:text-text-primary'}`}
              aria-pressed={lang === l.code}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Cart */}
        <Link
          to="/cart"
          className="relative p-2 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0"
          aria-label={`Cart (${count} items)`}
        >
          <ShoppingCart className="w-5 h-5 text-text-primary" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-amber text-white text-xxs font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </Link>

        {/* Profile */}
        <Link
          to="/my-farm"
          className="hidden sm:flex items-center gap-2 text-xs hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="My Farm"
        >
          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="hidden lg:block font-medium text-text-primary">My Farm</span>
        </Link>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden border-t border-border px-3 py-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search crops, inputs, mandis..."
              className="input pl-9 text-sm"
              autoFocus
              aria-label="Search"
            />
          </form>
        </div>
      )}
    </header>
  )
}
