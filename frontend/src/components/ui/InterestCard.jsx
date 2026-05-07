import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { VerifiedBadge } from './Badge'
import { useAcceptMatch, useDeclineMatch } from '../../hooks/useMatches'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80'

export default function InterestCard({ match }) {
  const accept = useAcceptMatch()
  const decline = useDeclineMatch()

  if (!match) return null
  const { id, profile } = match
  const { firstName, age, profession, photoUrl, isVerified } = profile ?? {}

  return (
    <motion.div
      whileHover={{ borderColor: '#fb923c' }}
      className="flex items-center gap-4 p-4 bg-white rounded-[20px] shadow-card border border-orange-50/30 hover:border-orange-200 transition-colors cursor-pointer"
    >
      <Link to={`/profile/${profile?.id}`} className="flex-shrink-0">
        <div className="w-20 h-20 rounded-2xl overflow-hidden">
          <img
            src={photoUrl || PLACEHOLDER}
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
        <p className="text-on-surface-variant text-sm mb-3 truncate">{profession}</p>
        <div className="flex gap-2">
          <button
            onClick={() => accept.mutate(id)}
            disabled={accept.isPending}
            className="text-xs font-bold text-primary px-3 py-1.5 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-60 active:scale-95"
          >
            Accept
          </button>
          <button
            onClick={() => decline.mutate(id)}
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
