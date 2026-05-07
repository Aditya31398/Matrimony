import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { VerifiedBadge, InterestTag } from './Badge'
import { useConnect, useShortlist } from '../../hooks/useMatches'
import { formatLastSeen } from '../../utils/lastSeen'

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80'

export default function ProfileCard({ profile, variant = 'grid' }) {
  const [liked, setLiked] = useState(false)
  const connect = useConnect()
  const shortlist = useShortlist()

  if (!profile) return null

  const {
    id,
    firstName,
    age,
    profession,
    city,
    photoUrl,
    isVerified,
    isOnline,
    lastSeenAt,
    interests = [],
  } = profile

  const lastSeenLabel = formatLastSeen(lastSeenAt, isOnline)

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.10)' }}
        className="group relative bg-white rounded-32 overflow-hidden shadow-card cursor-pointer"
      >
        <Link to={`/profile/${id}`}>
          <div className="aspect-[4/5] relative overflow-hidden">
            <img
              src={photoUrl || PLACEHOLDER}
              alt={firstName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {isVerified && (
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                <VerifiedBadge />
                <span className="text-[10px] font-bold text-on-surface tracking-wider">VERIFIED</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-white font-semibold text-lg leading-tight">{firstName}, {age}</h3>
                {isOnline && <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />}
              </div>
              <p className="text-white/80 text-sm mt-0.5">{profession} • {city}</p>
              {lastSeenLabel && !isOnline && (
                <p className="text-white/60 text-[11px] mt-0.5">{lastSeenLabel}</p>
              )}
            </div>
          </div>
        </Link>
        <div className="p-3 flex gap-2">
          <button
            onClick={() => connect.mutate(id)}
            disabled={connect.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
          >
            Connect
          </button>
          <button
            onClick={() => { setLiked(!liked); shortlist.mutate(id) }}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
              liked ? 'bg-orange-50 border-primary text-primary' : 'border-outline-variant text-slate-400 hover:bg-orange-50 hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              favorite
            </span>
          </button>
        </div>
      </motion.div>
    )
  }

  // Full grid variant (discover page)
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 25px 50px rgba(0,0,0,0.12)' }}
      className="group relative bg-white rounded-24 overflow-hidden shadow-card cursor-pointer"
    >
      <Link to={`/profile/${id}`}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={photoUrl || PLACEHOLDER}
            alt={firstName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked) }}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white hover:bg-white hover:text-primary transition-colors"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              favorite
            </span>
          </button>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-xl leading-none">{firstName}, {age}</h4>
              {isVerified && <VerifiedBadge size="lg" />}
              {isOnline && <span className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 text-white/90 text-sm font-semibold">
              <span className="material-symbols-outlined text-sm">work</span>
              {profession}
            </div>
            {lastSeenLabel && (
              <p className="text-white/60 text-[11px] mt-1">
                {isOnline ? '● Online' : `Last seen ${lastSeenLabel}`}
              </p>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4 flex justify-between items-center bg-white">
        <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-semibold">
          <span className="material-symbols-outlined text-primary text-lg">location_on</span>
          {city}, India
        </div>
        <div className="flex gap-1.5">
          {interests.slice(0, 2).map((tag, i) => (
            <InterestTag key={i} label={tag} color={i === 0 ? 'secondary' : 'tertiary'} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
