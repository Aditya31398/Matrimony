import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usePlans, usePremium } from '../hooks/usePremium'
import { paymentService } from '../services/paymentService'
import { useTenant } from '../context/TenantContext'

const PERKS = [
  { icon: 'visibility', title: 'Full profile details', text: 'Phone number, star, rashi, profession, education, family and lifestyle.' },
  { icon: 'chat', title: 'Chat with anyone', text: 'Start conversations and reply to every member.' },
  { icon: 'auto_awesome', title: 'Astro matching', text: '36-point Guna Milan with every profile you view.' },
  { icon: 'workspace_premium', title: 'Premium badge', text: 'Stand out and appear first in Discover and Top Picks.' },
]

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

function loadCheckout() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SRC
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export default function PremiumPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { name: brand } = useTenant()
  const { data, isLoading } = usePlans()
  const { isPremium, premiumUntil } = usePremium()
  const [selected, setSelected] = useState('MONTH_3')
  const [paying, setPaying] = useState(false)

  const plans = data?.plans ?? []
  const configured = data?.configured

  const handlePay = async () => {
    setPaying(true)
    try {
      const loaded = await loadCheckout()
      if (!loaded) { toast.error('Could not load the payment window. Check your connection.'); return }

      const order = await paymentService.createOrder(selected)
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: brand,
        description: `Premium · ${order.planLabel}`,
        prefill: { name: order.name, email: order.email, contact: order.phone },
        theme: { color: '#ae3115' },
        handler: async (resp) => {
          try {
            const result = await paymentService.verify({
              orderId: resp.razorpay_order_id,
              paymentId: resp.razorpay_payment_id,
              signature: resp.razorpay_signature,
            })
            await queryClient.invalidateQueries()
            toast.success(`Welcome to Premium! Active until ${formatDate(result.premiumUntil)}`)
            navigate('/discover')
          } catch (e) {
            toast.error(e.message || 'Payment received but verification failed — contact support')
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      })
      checkout.on('payment.failed', (resp) => {
        toast.error(resp.error?.description || 'Payment failed')
        setPaying(false)
      })
      checkout.open()
    } catch (e) {
      toast.error(e.message || 'Could not start payment')
      setPaying(false)
    }
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="max-w-[1080px] mx-auto px-4 sm:px-6 py-10 pb-32">
      <header className="text-center mb-10">
        <p className="text-xs font-bold tracking-widest uppercase text-primary mb-2">{brand} Premium</p>
        <h1 className="text-3xl sm:text-4xl font-black text-on-surface mb-3">See every detail. Chat freely.</h1>
        <p className="text-on-surface-variant max-w-xl mx-auto">
          Free members see only photo, name, age, caste and religion. Premium unlocks everything else.
        </p>
      </header>

      {isPremium && premiumUntil && (
        <div className="mb-8 flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-green-800">
          <span className="material-symbols-outlined fill-icon">verified</span>
          <p className="text-sm font-semibold">
            You're Premium until {formatDate(premiumUntil)}. Buying another plan extends it.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {PERKS.map(({ icon, title, text }) => (
          <div key={title} className="flex gap-4 bg-white rounded-[24px] p-5 shadow-card border border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-primary flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
              <h3 className="font-black text-on-surface">{title}</h3>
              <p className="text-sm text-on-surface-variant">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-orange-100 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {plans.map((plan) => {
              const active = selected === plan.id
              const best = plan.id === 'MONTH_3'
              return (
                <button key={plan.id} type="button" onClick={() => setSelected(plan.id)}
                  className={`relative text-left rounded-[28px] p-6 border-2 transition-all active:scale-[0.98] ${
                    active ? 'border-primary bg-orange-50 shadow-btn-primary' : 'border-slate-100 bg-white shadow-card hover:border-primary/40'
                  }`}>
                  {best && (
                    <span className="absolute -top-3 left-6 bg-primary text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      Most popular
                    </span>
                  )}
                  <p className="font-bold text-on-surface-variant mb-1">{plan.label}</p>
                  <p className="text-3xl font-black text-on-surface">₹{plan.amount.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-on-surface-variant mt-1">₹{plan.perMonth.toLocaleString('en-IN')} / month</p>
                  <span className={`absolute top-6 right-6 material-symbols-outlined ${active ? 'text-primary fill-icon' : 'text-slate-300'}`}>
                    {active ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
              )
            })}
          </div>

          {configured === false && (
            <p className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
              Online payments are being set up. Please check back soon.
            </p>
          )}

          <button onClick={handlePay} disabled={paying || !configured}
            className="w-full max-w-md mx-auto flex py-4 rounded-2xl text-white font-bold text-lg items-center justify-center gap-2 shadow-btn-primary hover:shadow-btn-primary-hover active:scale-95 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #ae3115, #ff6b4a)' }}>
            {paying
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span className="material-symbols-outlined">lock</span>Pay securely with Razorpay</>}
          </button>
          <p className="text-center text-xs text-on-surface-variant mt-3">
            UPI, cards, net banking and wallets. One-time payment — no auto-renewal.
          </p>
        </>
      )}
    </motion.main>
  )
}
