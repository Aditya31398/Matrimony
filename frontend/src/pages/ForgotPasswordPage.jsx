import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'
import toast from 'react-hot-toast'

const inputClass =
  'w-full bg-surface-container-low border-2 border-transparent focus:border-primary-container rounded-2xl pl-12 pr-5 py-4 text-base font-medium text-on-surface outline-none transition-all'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState('email') // 'email' → 'reset'
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const sendCode = async (e) => {
    e?.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      toast.success('If that email is registered, a code is on its way')
      setStep('reset')
      setOtp('')
      setCooldown(60)
    } catch (err) {
      toast.error(err.message || 'Could not send reset code')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter the 6-digit code'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { email: email.trim(), otp, newPassword: password })
      toast.success('Password reset! Please sign in')
      navigate('/login', { state: { email: email.trim() } })
    } catch (err) {
      toast.error(err.message || 'Incorrect or expired code')
    } finally {
      setLoading(false)
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
          <Link to="/" className="font-display text-[40px] leading-none font-bold text-primary inline-block mb-6">SoulSync</Link>
          <h1 className="text-3xl font-black text-on-surface mb-2">Reset your password</h1>
          <p className="text-on-surface-variant">
            {step === 'email'
              ? "Enter your email and we'll send you a 6-digit code"
              : `Enter the code sent to ${email} and choose a new password`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.form key="email" onSubmit={sendCode}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-[32px] p-8 shadow-card border border-slate-100 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant block">Email address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">email</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    autoComplete="email"
                    maxLength={150}
                    autoFocus
                  />
                </div>
              </div>

              <SubmitButton loading={loading}>Send reset code</SubmitButton>

              <p className="text-center text-sm text-on-surface-variant pt-2">
                Remembered it?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">Back to sign in</Link>
              </p>
            </motion.form>
          ) : (
            <motion.form key="reset" onSubmit={resetPassword}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-white rounded-[32px] p-8 shadow-card border border-slate-100 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant block">6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-black tracking-[0.5em] bg-surface-container-low border-2 border-transparent focus:border-primary-container rounded-2xl px-5 py-3 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-[0.3em]"
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant block">New password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">lock</span>
                  <input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                    maxLength={128}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant block">Confirm new password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">lock</span>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                    autoComplete="new-password"
                    maxLength={128}
                  />
                </div>
              </div>

              <SubmitButton loading={loading}>Reset password</SubmitButton>

              <p className="text-xs text-on-surface-variant text-center">
                No email? Check spam, and make sure <strong>{email}</strong> is the address you registered with.
              </p>

              <div className="flex justify-between text-xs font-bold pt-1">
                <button type="button" onClick={() => setStep('email')} className="text-on-surface-variant hover:underline">
                  Change email
                </button>
                <button type="button" onClick={sendCode} disabled={loading || cooldown > 0}
                  className="text-primary hover:underline disabled:opacity-50">
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
      style={{ background: 'var(--gradient-primary)' }}
    >
      {loading
        ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        : <>{children} <span className="material-symbols-outlined">arrow_forward</span></>
      }
    </button>
  )
}
