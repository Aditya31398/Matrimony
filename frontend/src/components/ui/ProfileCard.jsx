import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { VerifiedBadge, InterestTag } from './Badge'
import { useConnect, useShortlist } from '../../hooks/useMatches'
import { formatLastSeen } from '../../utils/lastSeen'
import { cloudinaryUrl, cloudinarySrcSet } from '../../utils/cloudinary'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../../utils/placeholder'
import toast from 'react-hot-toast'

const ProfileCard = memo(function ProfileCard({ profile, variant = 'grid' }) {
  const [liked, setLiked] = useState(false)
  const connect   = useConnect()
  const shortlist = useShortlist()

  if (!profile) return null

  const { id, firstName, age, profession, city, photoUrl, isVerified, isOnline, lastSeenAt, interests = [],
          caste, religion, restricted, photoHidden, matchScore } = profile
  const lastSeenLabel = formatLastSeen(lastSeenAt, isOnline)
  // Free members only get caste and religion, so show those instead of job and city
  const subtitle = restricted
    ? [caste, religion].filter(Boolean).join(' • ')
    : [profession, city].filter(Boolean).join(' • ')

  const handleConnect = () => connect.mutate(id, {
    onSuccess: (m) => toast.success(m?.status === 'ACCEPTED' ? `It's a match with ${firstName}!` : `Request sent to ${firstName}`),
    onError: (e) => toast.error(e.message || 'Could not send request'),
  })

  const handleShortlist = () => {
    if (liked) return
    setLiked(true)
    shortlist.mutate(id, {
      onSuccess: () => toast.success(`${firstName} shortlisted`),
      onError: (e) => { setLiked(false); toast.error(e.message || 'Could not shortlist') },
    })
  }

  const matchBadge = matchScore != null && (
    <div className={`absolute top-4 left-4 px-2.5 py-1 rounded-full text-[11px] font-black backdrop-blur-md flex items-center gap-1 ${
      matchScore >= 75 ? 'bg-green-500/90 text-white' : matchScore >= 50 ? 'bg-white/90 text-primary' : 'bg-white/80 text-on-surface-variant'
    }`}>
      <span className="material-symbols-outlined fill-icon text-[13px]">favorite</span>
      {matchScore}% match
    </div>
  )
  // Shown instead of the photo when the member keeps photos private until connected
  const privatePhoto = photoHidden && (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/20 backdrop-blur-[2px] text-white text-center px-4">
      <span className="material-symbols-outlined fill-icon text-3xl">lock</span>
      <span className="text-xs font-bold">Photo visible after they accept</span>
    </div>
  )

  // Serve the right Cloudinary size; fall back to original URL for non-Cloudinary sources
  const imgSrc    = cloudinaryUrl(photoUrl || AVATAR_PLACEHOLDER, 'w_600,q_auto,f_auto')
  const imgSrcSet = cloudinarySrcSet(photoUrl)

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.10)' }}
        className="group relative bg-white rounded-32 overflow-hidden shadow-card cursor-pointer"
      >
        <Link to={`/profile/${id}`}>
          <div className="aspect-[4/5] relative overflow-hidden">
            <img
              src={imgSrc}
              srcSet={imgSrcSet}
              sizes="(max-width: 768px) 100vw, 300px"
              alt={firstName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
              onError={showPlaceholderOnError}
            />
            {privatePhoto}
            {matchBadge}
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
              {subtitle && <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>}
              {lastSeenLabel && !isOnline && (
                <p className="text-white/60 text-[11px] mt-0.5">{lastSeenLabel}</p>
              )}
            </div>
          </div>
        </Link>
        <div className="p-3 flex gap-2">
          <button
            onClick={handleConnect}
            disabled={connect.isPending}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:brightness-110 active:scale-95 transition-all disabled:opacity-60"
          >
            Connect
          </button>
          <button
            onClick={handleShortlist}
            aria-label={`Shortlist ${firstName}`}
            className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
              liked ? 'bg-orange-50 border-primary text-primary' : 'border-outline-variant text-slate-400 hover:bg-orange-50 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]"
              style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}>
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
            src={imgSrc}
            srcSet={imgSrcSet}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            alt={firstName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            decoding="async"
            onError={showPlaceholderOnError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
          {privatePhoto}
          {matchBadge}
          <button
            onClick={(e) => { e.preventDefault(); handleShortlist() }}
            aria-label={`Shortlist ${firstName}`}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 text-white hover:bg-white hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]"
              style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}>
              favorite
            </span>
          </button>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-xl leading-none">{firstName}, {age}</h4>
              {isVerified && <VerifiedBadge size="lg" />}
              {isOnline && <span className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0" />}
            </div>
            {subtitle && (
              <div className="flex items-center gap-1.5 text-white/90 text-sm font-semibold">
                <span className="material-symbols-outlined text-sm">{restricted ? 'diversity_3' : 'work'}</span>
                {restricted ? subtitle : profession}
              </div>
            )}
            {lastSeenLabel && (
              <p className="text-white/60 text-[11px] mt-1">
                {isOnline ? '● Online' : `Last seen ${lastSeenLabel}`}
              </p>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4 flex justify-between items-center bg-white">
        {restricted ? (
          <Link to="/premium" className="flex items-center gap-1.5 text-primary text-sm font-bold hover:underline">
            <span className="material-symbols-outlined text-lg">lock</span>
            See full profile
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 text-on-surface-variant text-sm font-semibold">
            <span className="material-symbols-outlined text-primary text-lg">location_on</span>
            {city ? `${city}, India` : 'India'}
          </div>
        )}
        <div className="flex gap-1.5">
          {interests.slice(0, 2).map((tag, i) => (
            <InterestTag key={i} label={tag} color={i === 0 ? 'secondary' : 'tertiary'} />
          ))}
        </div>
      </div>
    </motion.div>
  )
})

export default ProfileCard
