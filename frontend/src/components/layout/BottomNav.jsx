import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/discover', icon: 'explore', label: 'Discover' },
  { to: '/dashboard', icon: 'favorite', label: 'Matches' },
  { to: '/messages', icon: 'forum', label: 'Chat' },
  { to: '/my-profile', icon: 'person', label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const { isLoggedIn } = useAuth()
  // Every tab needs an account, so signed-out visitors don't get the bar
  if (!isLoggedIn) return null

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pt-2
                 pb-[max(env(safe-area-inset-bottom),10px)] bg-white/95 backdrop-blur-xl border-t border-outline-variant/70"
    >
      {navItems.map(({ to, icon, label }) => {
        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
        return (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center w-16 py-1 transition-colors ${
              isActive ? 'text-primary' : 'text-on-surface-variant/70 hover:text-on-surface'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" } : {}}
            >
              {icon}
            </span>
            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
          </NavLink>
        )
      })}
    </motion.nav>
  )
}
