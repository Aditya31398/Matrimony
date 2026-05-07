import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { isLoggedIn, logout } = useAuth()

  const links = [
    { to: '/discover', label: 'Discover' },
    { to: '/dashboard', label: 'Matches' },
    { to: '/', label: 'Stories' },
    { to: '/messages', label: 'Messages' },
    ...(isLoggedIn ? [{ to: '/my-profile', label: 'My Profile' }] : []),
  ]

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-orange-50/50 shadow-nav"
    >
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black tracking-tighter text-orange-600 select-none">
          SoulSync
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <NavLink
              key={to + label}
              to={to}
              className={({ isActive }) =>
                `text-sm font-medium transition-all duration-300 pb-0.5 ${
                  isActive
                    ? 'text-orange-600 border-b-2 border-orange-500 font-bold'
                    : 'text-slate-600 hover:text-orange-500'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden md:flex p-2 rounded-full hover:bg-orange-50/50 transition-all duration-300 active:scale-95">
            <span className="material-symbols-outlined text-slate-600">notifications</span>
          </button>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hidden sm:flex text-primary border-2 border-orange-200 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-orange-50 active:scale-95 transition-all duration-200"
            >
              Sign Out
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/register')}
                className="hidden sm:flex bg-gradient-to-r from-primary to-primary-container text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:flex text-primary border-2 border-orange-200 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-orange-50 active:scale-95 transition-all duration-200"
              >
                Sign In
              </button>
            </>
          )}

          <button
            className="md:hidden p-2 rounded-full hover:bg-orange-50 transition-colors"
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
          className="md:hidden bg-white border-t border-orange-50 px-6 pb-4"
        >
          <div className="flex flex-col gap-1 pt-2">
            {links.map(({ to, label }) => (
              <NavLink
                key={to + label}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'text-orange-600 bg-orange-50 font-bold' : 'text-slate-600 hover:bg-slate-50'
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
                  className="flex-1 border-2 border-orange-200 text-primary py-3 rounded-xl text-sm font-bold hover:bg-orange-50 active:scale-95 transition-all"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { navigate('/register'); setMenuOpen(false) }}
                    className="flex-1 bg-gradient-to-r from-primary to-primary-container text-white py-3 rounded-xl text-sm font-bold shadow-btn-primary active:scale-95 transition-all"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => { navigate('/login'); setMenuOpen(false) }}
                    className="flex-1 border-2 border-orange-200 text-primary py-3 rounded-xl text-sm font-bold hover:bg-orange-50 active:scale-95 transition-all"
                  >
                    Sign In
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
