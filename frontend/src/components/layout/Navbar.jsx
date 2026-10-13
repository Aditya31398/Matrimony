import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useTenant } from '../../context/TenantContext'
import toast from 'react-hot-toast'
import NotificationBell from './NotificationBell'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useAuth()
  const { name } = useTenant()
  const { t } = useTranslation()

  const links = [
    { to: '/discover', label: t('nav.discover') },
    { to: '/dashboard', label: t('nav.matches') },
    { to: '/', label: t('nav.stories') },
    { to: '/messages', label: t('nav.messages') },
    ...(isLoggedIn ? [
      { to: '/my-profile', label: t('nav.myProfile') },
      { to: '/premium', label: t('nav.premium') },
    ] : []),
  ]

  const handleLogout = () => {
    logout()
    toast.success(t('nav.signOut'))
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full bg-[#FFFDFA]/85 backdrop-blur-xl border-b border-outline-variant/70"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-display text-[30px] leading-none font-bold tracking-tight text-primary select-none">
          {name}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <NavLink
              key={to + label}
              to={to}
              className={({ isActive }) =>
                `text-[13px] font-semibold tracking-wide transition-colors duration-300 py-1 border-b-2 ${
                  isActive
                    ? 'text-primary border-gold-500'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn && <NotificationBell />}

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hidden sm:flex text-[13px] font-medium text-on-surface-variant hover:text-primary px-3 py-2 transition-colors"
            >
              {t('nav.signOut')}
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                className="hidden sm:flex bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-full text-sm font-bold active:scale-[0.98] transition-all duration-200"
              >
                {t('nav.getStarted')}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:flex text-primary border-2 border-primary/30 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-primary/5 active:scale-[0.98] transition-all duration-200"
              >
                {t('nav.signIn')}
              </button>
            </>
          )}

          <button
            className="md:hidden p-2 rounded-full hover:bg-primary/5 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="material-symbols-outlined text-slate-700">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-t border-primary/10 px-6 pb-4"
        >
          <div className="flex flex-col gap-1 pt-2">
            {links.map(({ to, label }) => (
              <NavLink
                key={to + label}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'text-primary bg-primary/5 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <div className="flex gap-3 mt-2 pt-3 border-t border-slate-100">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="flex-1 border-2 border-primary/30 text-primary py-3 rounded-xl text-sm font-bold hover:bg-primary/5 active:scale-[0.98] transition-all"
                >
                  {t('nav.signOut')}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/register'); setMenuOpen(false) }}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-container text-on-primary py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition-all"
                  >
                    {t('nav.getStarted')}
                  </button>
                  <button
                    onClick={() => { navigate('/login'); setMenuOpen(false) }}
                    className="flex-1 border-2 border-primary/30 text-primary py-3 rounded-xl text-sm font-bold hover:bg-primary/5 active:scale-[0.98] transition-all"
                  >
                    {t('nav.signIn')}
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
