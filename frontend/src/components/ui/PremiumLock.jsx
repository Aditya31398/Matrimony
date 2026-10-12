import { Link } from 'react-router-dom'

/** Upsell shown in place of premium-only content. */
export default function PremiumLock({ title = 'Premium members only', text, compact = false }) {
  return (
    <div className={`rounded-[28px] border border-orange-200 bg-gradient-to-br from-orange-50 to-white text-center ${compact ? 'p-5' : 'p-8'}`}>
      <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white shadow-card flex items-center justify-center text-primary">
        <span className="material-symbols-outlined fill-icon">lock</span>
      </div>
      <h3 className="font-black text-on-surface mb-1">{title}</h3>
      {text && <p className="text-sm text-on-surface-variant mb-4 max-w-sm mx-auto">{text}</p>}
      <Link to="/premium"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-bold shadow-btn-primary active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg, #ae3115, #ff6b4a)' }}>
        <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
        Upgrade to Premium
      </Link>
    </div>
  )
}
