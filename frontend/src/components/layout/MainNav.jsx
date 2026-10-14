import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLang } from '../../context/LangContext'

const NAV_ITEMS = [
  { to: '/', label: 'nav.home' },
  { to: '/crop-doctor', label: 'nav.cropDoctor' },
  { to: '/shop', label: 'nav.shopInputs' },
  { to: '/soil-plan', label: 'nav.soilPlan' },
  { to: '/prices', label: 'nav.cropPrices' },
  { to: '/alerts', label: 'nav.weatherAlerts' },
  { to: '/lake-watch', label: 'nav.lakeWatch' },
  { to: '/dashboard', label: 'nav.researcher' },
  { to: '/my-farm', label: 'nav.myFarm' },
]

export default function MainNav() {
  const { t } = useLang()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `relative px-3 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap
     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
     ${isActive
       ? 'text-primary bg-primary-50 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-t'
       : 'text-text-muted hover:text-text-primary hover:bg-gray-100'
     }`

  return (
    <>
      {/* Desktop nav — 1024px+ */}
      <nav className="hidden lg:block bg-white border-b border-border" aria-label="Main navigation">
        <div className="max-w-container mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {NAV_ITEMS.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
                {t(item.label)}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Tablet nav — hamburger → drawer */}
      <nav className="hidden md:flex lg:hidden bg-white border-b border-border px-4 py-1.5 items-center" aria-label="Main navigation">
        <button
          className="flex items-center gap-2 text-sm font-medium text-text-primary hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
        {/* Current page hint */}
        <span className="ml-3 text-sm text-text-muted">·</span>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `ml-2 text-sm ${isActive ? 'text-primary font-semibold' : 'text-text-muted'}`
          }
        >
          {t('nav.home')}
        </NavLink>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:flex lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-bold text-primary">Navigation</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 text-sm font-medium border-l-4 transition-colors
                     ${isActive
                       ? 'border-primary text-primary bg-primary-50'
                       : 'border-transparent text-text-muted hover:text-text-primary hover:bg-gray-50'
                     }`
                  }
                >
                  {t(item.label)}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
