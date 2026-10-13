import { Link } from 'react-router-dom'
import { profileCompleteness } from '../../utils/completeness'

/** Progress ring + the most valuable missing details, linking to Edit Profile. */
export default function CompletenessRing({ profile, compact = false }) {
  const { percent, missing } = profileCompleteness(profile)
  if (compact && percent >= 100) return null
  const color = percent >= 80 ? '#16a34a' : percent >= 50 ? '#B88474' : '#5B2A4E'

  return (
    <div className="bg-white rounded-[28px] p-5 shadow-card border border-slate-100 flex items-center gap-5">
      <div className="relative w-20 h-20 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F6ECEB" strokeWidth="3.5" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={`${percent * 0.974} 100`} style={{ transition: 'stroke-dasharray 600ms ease' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-on-surface">{percent}%</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-on-surface">
          {percent >= 100 ? 'Your profile is complete' : 'Complete your profile'}
        </p>
        {missing.length > 0 ? (
          <>
            <p className="text-sm text-on-surface-variant mt-0.5">
              Complete profiles get far more interests. Add: <span className="font-semibold text-on-surface">{missing.slice(0, 3).join(', ')}</span>
              {missing.length > 3 && ` +${missing.length - 3} more`}
            </p>
            <Link to="/edit-profile" className="inline-block mt-2 text-sm font-bold text-primary hover:underline">
              Finish now →
            </Link>
          </>
        ) : (
          <p className="text-sm text-on-surface-variant mt-0.5">Great — you're making the best first impression.</p>
        )}
      </div>
    </div>
  )
}
