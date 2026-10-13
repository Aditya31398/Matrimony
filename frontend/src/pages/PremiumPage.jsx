import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usePlans, usePremium } from '../hooks/usePremium'
import { paymentService } from '../services/paymentService'
import { useTenant } from '../context/TenantContext'

const PERKS = [
  ['Full profiles', 'Phone number, horoscope, profession, education, story and preferences.'],
  ['Unlimited conversations', 'Start a chat with anyone and reply to every message.'],
  ['Kundli matching', 'Ashtakoota and Dashakoota compatibility with every profile you view.'],
  ['Stand out', 'A Premium badge, and your profile shown first in Discover.'],
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
        theme: { color: '#7A1F3D' },
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
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-12 pb-32">
      <header className="text-center mb-12">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-600">{brand} Premium</p>
        <h1 className="text-[44px] sm:text-[56px] leading-[1.02] text-on-surface mt-2">See every detail.<br className="sm:hidden" /> Chat freely.</h1>
        <p className="text-[16px] text-on-surface-variant max-w-lg mx-auto mt-4">
          Free members see a photo, name, age, caste and religion. Premium opens up everything else.
        </p>
        {isPremium && premiumUntil && (
          <p className="text-[14px] text-on-surface mt-5">
            You're Premium until <strong className="font-semibold">{formatDate(premiumUntil)}</strong> — a new plan extends it.
          </p>
        )}
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 max-w-3xl mx-auto mb-14">
        {PERKS.map(([title, text]) => (
          <li key={title} className="flex gap-3">
            <span className="material-symbols-outlined text-[20px] text-primary mt-0.5">check</span>
            <div>
              <p className="text-[15px] font-semibold text-on-surface">{title}</p>
              <p className="text-[14px] text-on-surface-variant mt-0.5">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div role="radiogroup" aria-label="Plans" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {plans.map((plan) => {
              const active = selected === plan.id
              const best = plan.id === 'MONTH_3'
              return (
                <button key={plan.id} type="button" role="radio" aria-checked={active} onClick={() => setSelected(plan.id)}
                  className={`relative text-left rounded-2xl p-6 border bg-white transition-colors ${
                    active ? 'border-primary ring-1 ring-primary' : 'border-outline-variant/80 hover:border-on-surface/30'
                  }`}>
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-medium text-on-surface">{plan.label}</p>
                    {best && <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gold-600">Most chosen</span>}
                  </div>
                  <p className="font-display text-[40px] leading-none text-on-surface mt-4">₹{plan.amount.toLocaleString('en-IN')}</p>
                  <p className="text-[13px] text-on-surface-variant mt-2">₹{plan.perMonth.toLocaleString('en-IN')} per month</p>
                </button>
              )
            })}
          </div>

          {configured === false && (
            <p className="text-center text-[13px] text-on-surface-variant mb-4">Online payments are being set up. Please check back soon.</p>
          )}

          <div className="text-center">
            <button onClick={handlePay} disabled={paying || !configured}
              className="w-full max-w-sm h-12 inline-flex items-center justify-center rounded-lg bg-primary text-white text-[15px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
              {paying
                ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Continue to payment'}
            </button>
            <p className="text-[12px] text-on-surface-variant mt-3">
              Secured by Razorpay · UPI, cards, net banking and wallets · One-time payment, no auto-renewal
            </p>
          </div>
        </>
      )}
    </motion.main>
  )
}
