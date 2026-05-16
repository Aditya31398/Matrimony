import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please enter your email and password')
      return
    }
    setUnverified(false)
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      if (err.message?.includes('verify your email')) {
        setUnverified(true)
      } else {
        toast.error(err.message || 'Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setVerifying(true)
    try {
      await api.post('/auth/verify-otp', { email: form.email, otp })
      toast.success('Email verified! Signing you in…')
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Incorrect or expired OTP')
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await api.post('/auth/resend-otp', { email: form.email })
      toast.success('New code sent — check your inbox')
      setOtp('')
      setCooldown(60)
    } catch (err) {
      toast.error(err.message || 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex items-center justify-center py-16 px-6 relative overflow-hidden"
    >
      <div className="fixed top-0 right-0 h-screen w-1/3 z-0 overflow-hidden hidden lg:block pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-gradient-to-bl from-primary-fixed to-surface rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black tracking-tighter text-primary inline-block mb-6">SoulSync</Link>
          <h1 className="text-3xl font-black text-on-surface mb-2">Welcome back</h1>
          <p className="text-on-surface-variant">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 shadow-card border border-slate-100 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant block">Email address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary-container rounded-2xl pl-12 pr-5 py-4 text-base font-medium text-on-surface outline-none transition-all"
                autoComplete="email"
                maxLength={150}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant block">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">lock</span>
              <input
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary-container rounded-2xl pl-12 pr-5 py-4 text-base font-medium text-on-surface outline-none transition-all"
                autoComplete="current-password"
                maxLength={128}
              />
            </div>
          </div>

          <AnimatePresence>
            {unverified && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="rounded-2xl bg-orange-50 border border-orange-200 p-5 space-y-3">
                <p className="text-sm font-bold text-orange-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">mark_email_unread</span>
                  Enter the 6-digit code sent to {form.email}
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-black tracking-[0.5em] bg-white border-2 border-orange-200 focus:border-primary-container rounded-2xl px-5 py-3 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-[0.3em]"
                  autoFocus
                />
                <button type="button" onClick={handleVerifyOtp} disabled={verifying || otp.length !== 6}
                  className="w-full py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #ae3115, #ff6b4a)' }}>
                  {verifying
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Verify & Sign In'}
                </button>
                <button type="button" onClick={handleResend} disabled={resending || cooldown > 0}
                  className="text-xs font-bold text-primary hover:underline disabled:opacity-50 w-full text-center">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #ae3115, #ff6b4a)' }}
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <>Sign In <span className="material-symbols-outlined">arrow_forward</span></>
            }
          </button>

          <p className="text-center text-sm text-on-surface-variant pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-bold hover:underline">Create one</Link>
          </p>

        </form>
      </div>
    </motion.div>
  )
}
