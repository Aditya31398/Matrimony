import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/discover', icon: 'explore', label: 'Feed' },
  { to: '/dashboard', icon: 'favorite', label: 'Matches' },
  { to: '/messages', icon: 'forum', label: 'Chat' },
  { to: '/my-profile', icon: 'person_celebrate', label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3
                 bg-white/95 backdrop-blur-xl rounded-t-[32px] border-t border-orange-100/30
                 shadow-[0_-10px_40px_rgba(255,107,74,0.10)]"
    >
      {navItems.map(({ to, icon, label }) => {
        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
        return (
          <NavLink
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-all duration-200 active:scale-90 ${
              isActive
                ? 'bg-orange-50 text-orange-600'
                : 'text-slate-400 hover:text-orange-500'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}
            >
              {icon}
            </span>
            <span className="text-[10px] font-semibold mt-0.5">{label}</span>
          </NavLink>
        )
      })}
    </motion.nav>
  )
}
