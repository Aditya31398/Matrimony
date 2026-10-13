import { Link } from 'react-router-dom'
import { VerifiedBadge } from './Badge'
import { useAcceptMatch, useDeclineMatch } from '../../hooks/useMatches'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../../utils/placeholder'
import toast from 'react-hot-toast'

/** A pending interest: who sent it, their optional note, and accept/decline. */
export default function InterestCard({ match }) {
  const accept = useAcceptMatch()
  const decline = useDeclineMatch()

  if (!match) return null
  const { id, profile } = match
  const { firstName, age, profession, photoUrl, isVerified, restricted, caste, religion } = profile ?? {}
  const subtitle = restricted ? [caste, religion].filter(Boolean).join(' · ') : profession

  return (
    <div className="flex gap-4 rounded-2xl border border-outline-variant/70 bg-white p-4 sm:p-5">
      <Link to={`/profile/${profile?.id}`} className="flex-shrink-0">
        <img src={photoUrl || AVATAR_PLACEHOLDER} onError={showPlaceholderOnError} alt={firstName}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover" loading="lazy" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Link to={`/profile/${profile?.id}`} className="font-display text-[20px] font-semibold leading-tight text-on-surface hover:text-primary truncate">
            {firstName}, {age}
          </Link>
          {isVerified && <VerifiedBadge />}
        </div>
        {subtitle && <p className="text-[13px] text-on-surface-variant truncate">{subtitle}</p>}
        {match.note && (
          <p className="mt-2.5 border-l-2 border-gold-500/60 pl-3 text-[13px] italic leading-relaxed text-on-surface line-clamp-3">
            {match.note}
          </p>
        )}
        <div className="flex gap-2 mt-3.5">
          <button disabled={accept.isPending}
            onClick={() => accept.mutate(id, {
              onSuccess: () => toast.success(`You and ${firstName} are now connected`),
              onError: (e) => toast.error(e.message || 'Could not accept'),
            })}
            className="h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
            Accept
          </button>
          <button disabled={decline.isPending}
            onClick={() => decline.mutate(id, { onError: (e) => toast.error(e.message || 'Could not decline') })}
            className="h-9 px-4 rounded-lg border border-outline-variant text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-60">
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
