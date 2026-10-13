import { Link } from 'react-router-dom'

/** Quiet upsell shown in place of premium-only content. */
export default function PremiumLock({ title = 'For Premium members', text }) {
  return (
    <div className="rounded-2xl border border-outline-variant/70 bg-surface-container-low px-6 py-6">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">
        <span className="material-symbols-outlined text-[15px]">lock</span> Premium
      </p>
      <p className="font-display text-[24px] leading-snug text-on-surface mt-1.5">{title}</p>
      {text && <p className="text-[14px] text-on-surface-variant mt-1 max-w-md">{text}</p>}
      <Link to="/premium" className="inline-flex items-center mt-4 h-10 px-5 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors">
        View plans
      </Link>
    </div>
  )
}
