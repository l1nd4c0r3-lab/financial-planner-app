import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Home, Target, Wallet, Sparkles, MoreHorizontal } from 'lucide-react'
import { clsx } from 'clsx'

const TABS = [
  { path: '/home',     label: 'Home',     Icon: Home },
  { path: '/goals',    label: 'Goals',    Icon: Target },
  { path: '/budget',   label: 'Budget',   Icon: Wallet },
  { path: '/habits',   label: 'Reflect',  Icon: Sparkles },
  { path: '/settings',  label: 'More',     Icon: MoreHorizontal },
]

export function TabLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Page content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-mid-gray/50 safe-bottom z-40">
        <div className="flex">
          {TABS.map(({ path, label, Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={clsx(
                'flex-1 flex flex-col items-center py-2 pt-3 transition-all duration-150',
                isActive(path)
                  ? 'text-navy'
                  : 'text-mid-gray hover:text-navy/60'
              )}
            >
              <Icon size={22} strokeWidth={isActive(path) ? 2.2 : 1.8} />
              <span className={clsx(
                'text-2xs mt-0.5 font-medium tracking-tight',
                isActive(path) && 'font-semibold'
              )}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
