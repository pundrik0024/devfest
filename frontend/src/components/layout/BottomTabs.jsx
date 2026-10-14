import { NavLink } from 'react-router-dom'
import { Home, Camera, ClipboardList, Bell, ShoppingBag } from 'lucide-react'
import { useLang } from '../../context/LangContext'
import { useCart } from '../../context/CartContext'

const TABS = [
  { to: '/',           icon: Home,           label: 'nav.home',   end: true },
  { to: '/crop-doctor',icon: Camera,         label: 'nav.scan'         },
  { to: '/soil-plan',  icon: ClipboardList,  label: 'nav.plan'         },
  { to: '/alerts',     icon: Bell,           label: 'nav.alerts'       },
  { to: '/shop',       icon: ShoppingBag,    label: 'nav.shop'         },
]

export default function BottomTabs() {
  const { t } = useLang()
  const { count } = useCart()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border bottom-tabs"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center">
        {TABS.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 min-touch
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary
               transition-colors relative
               ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'}`
            }
            aria-label={t(tab.label)}
          >
            {({ isActive }) => (
              <>
                {/* Active dot */}
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-b" />
                )}
                <div className="relative">
                  <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {/* Cart badge on shop tab */}
                  {tab.to === '/shop' && count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber text-white text-xxs font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </div>
                <span className={`text-xxs font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {t(tab.label)}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
