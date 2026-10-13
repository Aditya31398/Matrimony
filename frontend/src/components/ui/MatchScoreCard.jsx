import { Link } from 'react-router-dom'
import { useMatchScore } from '../../hooks/useFeatures'

/** "Why you match": overall % and each factor; premium-only details appear locked. */
export default function MatchScoreCard({ profileId }) {
  const { data, isLoading } = useMatchScore(profileId)
  if (isLoading) return <div className="h-24 rounded-xl shimmer" />
  if (!data || data.percent == null) {
    return <p className="text-[14px] text-on-surface-variant">Not enough details yet to compare your preferences.</p>
  }
  const locked = data.factors.some((f) => f.locked)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-6">
      <div>
        <p className="font-display text-[56px] leading-none text-primary">{data.percent}%</p>
        <p className="text-[13px] text-on-surface-variant mt-1">match with your preferences</p>
      </div>
      <div>
        <ul className="divide-y divide-outline-variant/60">
          {data.factors.map((f, i) => {
            const good = f.points >= f.max * 0.6
            return (
              <li key={i} className="flex items-center gap-3 py-2 text-[14px]">
                <span className={`material-symbols-outlined text-[18px] ${f.locked ? 'text-on-surface-variant/50' : good ? 'text-emerald-600' : 'text-on-surface-variant/50'}`}>
                  {f.locked ? 'lock' : good ? 'check' : 'remove'}
                </span>
                <span className={`flex-1 ${f.locked ? 'text-on-surface-variant' : 'text-on-surface'}`}>{f.label}</span>
              </li>
            )
          })}
        </ul>
        {locked && (
          <Link to="/premium" className="inline-block mt-3 text-[13px] font-medium text-primary hover:underline underline-offset-4">
            See every detail with Premium
          </Link>
        )}
      </div>
    </div>
  )
}
