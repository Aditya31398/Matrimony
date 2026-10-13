import { Link } from 'react-router-dom'
import { profileCompleteness } from '../../utils/completeness'

/**
 * Profile completeness. `compact` is a slim strip for the dashboard (hidden at 100%);
 * the full version shows a ring with the most valuable missing details.
 */
export default function CompletenessRing({ profile, compact = false }) {
  const { percent, missing } = profileCompleteness(profile)
  if (compact && percent >= 100) return null
  const next = missing.slice(0, 3).join(', ').toLowerCase()

  if (compact) {
    return (
      <Link to="/edit-profile"
        className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 rounded-2xl border border-outline-variant/70 bg-white px-5 py-4 hover:border-primary/30 transition-colors">
        <div className="flex items-baseline gap-2 flex-shrink-0">
          <span className="font-display text-[28px] leading-none text-primary">{percent}%</span>
          <span className="text-[13px] text-on-surface-variant">profile complete</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-1 rounded-full bg-surface-container overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-[12px] text-on-surface-variant mt-2 truncate">Add {next} to receive more interests</p>
        </div>
        <span className="text-[13px] font-medium text-primary flex-shrink-0 group-hover:underline underline-offset-4">Complete profile</span>
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/70 p-5 flex items-center gap-5">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" stroke="#ECEEF2" strokeWidth="2" />
          <circle cx="18" cy="18" r="16" fill="none" stroke="#1F2A44" strokeWidth="2" strokeLinecap="round"
            strokeDasharray={`${percent} 100`} pathLength="100" style={{ transition: 'stroke-dasharray 600ms ease' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display text-[18px] text-on-surface">{percent}%</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-on-surface">{percent >= 100 ? 'Profile complete' : 'Profile strength'}</p>
        <p className="text-[13px] text-on-surface-variant mt-0.5">
          {missing.length ? <>Still to add: {next}{missing.length > 3 ? ` and ${missing.length - 3} more` : ''}.</> : 'You are making the best first impression.'}
        </p>
        {missing.length > 0 && (
          <Link to="/edit-profile" className="inline-block mt-1.5 text-[13px] font-medium text-primary hover:underline underline-offset-4">
            Complete profile
          </Link>
        )}
      </div>
    </div>
  )
}
