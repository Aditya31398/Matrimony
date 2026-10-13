import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { VerifiedBadge } from './Badge'
import { useAcceptMatch, useDeclineMatch } from '../../hooks/useMatches'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../../utils/placeholder'
import toast from 'react-hot-toast'

export default function InterestCard({ match }) {
  const accept = useAcceptMatch()
  const decline = useDeclineMatch()

  if (!match) return null
  const { id, profile } = match
  const { firstName, age, profession, photoUrl, isVerified, restricted, caste, religion } = profile ?? {}
  const subtitle = restricted ? [caste, religion].filter(Boolean).join(' • ') : profession

  return (
    <motion.div
      whileHover={{ borderColor: '#fb923c' }}
      className="flex items-center gap-4 p-4 bg-white rounded-[20px] shadow-card border border-orange-50/30 hover:border-orange-200 transition-colors cursor-pointer"
    >
      <Link to={`/profile/${profile?.id}`} className="flex-shrink-0">
        <div className="w-20 h-20 rounded-2xl overflow-hidden">
          <img
            src={photoUrl || AVATAR_PLACEHOLDER}
            onError={showPlaceholderOnError}
            alt={firstName}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <h4 className="font-bold text-base text-on-surface truncate">
            {firstName}, {age}
          </h4>
          {isVerified && <VerifiedBadge />}
        </div>
        <p className="text-on-surface-variant text-sm truncate">{subtitle || '\u00a0'}</p>
        {match.note && (
          <p className="text-xs text-on-surface italic bg-orange-50 rounded-xl px-3 py-2 my-2 line-clamp-3">“{match.note}”</p>
        )}
        <div className="mb-3" />
        <div className="flex gap-2">
          <button
            onClick={() => accept.mutate(id, {
              onSuccess: () => toast.success(`You and ${firstName} are now connected`),
              onError: (e) => toast.error(e.message || 'Could not accept'),
            })}
            disabled={accept.isPending}
            className="text-xs font-bold text-primary px-3 py-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-60 active:scale-95"
          >
            Accept
          </button>
          <button
            onClick={() => decline.mutate(id, {
              onError: (e) => toast.error(e.message || 'Could not decline'),
            })}
            disabled={decline.isPending}
            className="text-xs font-bold text-on-surface-variant px-3 py-1.5 hover:bg-surface-container rounded-lg transition-colors disabled:opacity-60 active:scale-95"
          >
            Decline
          </button>
        </div>
      </div>
    </motion.div>
  )
}
