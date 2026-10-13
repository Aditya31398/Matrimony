import { Link } from 'react-router-dom'
import { useMatchScore } from '../../hooks/useFeatures'

/** "Why you match" — overall % plus each factor; premium-only details show as locked. */
export default function MatchScoreCard({ profileId, firstName }) {
  const { data, isLoading } = useMatchScore(profileId)
  if (isLoading) return <div className="h-40 rounded-[32px] bg-surface-container animate-pulse" />
  if (!data || data.percent == null) return null
  const locked = data.factors.some((f) => f.locked)

  return (
    <div className="bg-white rounded-[32px] p-7 shadow-card border border-slate-100">
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F0E9E0" strokeWidth="4" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#7A1F3D" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${data.percent * 0.974} 100`} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-on-surface">{data.percent}%</span>
        </div>
        <div>
          <h2 className="text-xl font-black text-on-surface">Why you match</h2>
          <p className="text-xs text-on-surface-variant">Based on your preferences and {firstName}'s profile</p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {data.factors.map((f, i) => {
          const good = f.points >= f.max * 0.6
          return (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className={`material-symbols-outlined text-[18px] ${f.locked ? 'text-slate-300' : good ? 'text-green-600' : 'text-slate-400'}`}>
                {f.locked ? 'lock' : good ? 'check_circle' : 'remove_circle'}
              </span>
              <span className={`flex-1 ${f.locked ? 'text-slate-400' : 'text-on-surface'}`}>{f.label}</span>
              <span className="text-xs font-bold text-on-surface-variant">{f.points}/{f.max}</span>
            </li>
          )
        })}
      </ul>
      {locked && (
        <Link to="/premium" className="mt-4 inline-block text-xs font-bold text-primary hover:underline">
          Upgrade to see every detail →
        </Link>
      )}
    </div>
  )
}
