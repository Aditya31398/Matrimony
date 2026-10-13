import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { VerifiedBadge } from './Badge'
import { useConnect, useShortlist } from '../../hooks/useMatches'
import { formatLastSeen } from '../../utils/lastSeen'
import { cloudinaryUrl, cloudinarySrcSet } from '../../utils/cloudinary'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../../utils/placeholder'
import toast from 'react-hot-toast'

/**
 * Editorial profile card: an uncluttered photo with the details set beneath it.
 * `compact` adds the interest/shortlist actions used on the dashboard.
 */
const ProfileCard = memo(function ProfileCard({ profile, variant = 'grid' }) {
  const [liked, setLiked] = useState(false)
  const connect   = useConnect()
  const shortlist = useShortlist()

  if (!profile) return null

  const { id, firstName, age, profession, city, photoUrl, isVerified, isOnline, lastSeenAt,
          caste, religion, restricted, photoHidden, matchScore } = profile
  const lastSeenLabel = formatLastSeen(lastSeenAt, isOnline)
  // Free members only get caste and religion, so show those instead of job and city
  const subtitle = restricted
    ? [caste, religion].filter(Boolean).join(' · ')
    : [profession, city].filter(Boolean).join(' · ')

  const handleConnect = () => connect.mutate(id, {
    onSuccess: (m) => toast.success(m?.status === 'ACCEPTED' ? `It's a match with ${firstName}` : `Interest sent to ${firstName}`),
    onError: (e) => toast.error(e.message || 'Could not send interest'),
  })

  const handleShortlist = (e) => {
    e?.preventDefault()
    if (liked) return
    setLiked(true)
    shortlist.mutate(id, {
      onSuccess: () => toast.success(`${firstName} added to your shortlist`),
      onError: (err) => { setLiked(false); toast.error(err.message || 'Could not shortlist') },
    })
  }

  const imgSrc    = cloudinaryUrl(photoUrl || AVATAR_PLACEHOLDER, 'w_600,q_auto,f_auto')
  const imgSrcSet = cloudinarySrcSet(photoUrl)

  return (
    <article className="group h-full flex flex-col bg-white rounded-2xl border border-outline-variant/70 overflow-hidden transition-shadow duration-300 hover:shadow-card-hover">
      <Link to={`/profile/${id}`} className="block flex-1">
        <div className="relative aspect-[4/5] bg-surface-container overflow-hidden">
          {photoUrl ? <img
            src={imgSrc}
            srcSet={imgSrcSet}
            sizes={variant === 'compact' ? '(max-width: 768px) 100vw, 260px' : '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'}
            alt={firstName}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
            onError={showPlaceholderOnError}
          /> : (
            // No photo (or a private one): a quiet monogram instead of a stock silhouette
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-surface-container-low to-surface-container">
              <span className="font-display text-[72px] leading-none text-primary/25 select-none">{firstName?.[0]}</span>
            </div>
          )}
          {photoHidden && (
            <div className="absolute inset-x-0 bottom-0 m-3 flex items-center justify-center gap-1.5 rounded-lg bg-white/90 backdrop-blur px-3 py-2 text-[12px] text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Photo shared after they accept
            </div>
          )}
          {matchScore != null && (
            <span className={`absolute top-3 left-3 rounded-md px-2 py-1 text-[11px] font-semibold tracking-wide backdrop-blur ${
              matchScore >= 75 ? 'bg-primary text-white' : 'bg-white/90 text-on-surface'
            }`}>
              {matchScore}% match
            </span>
          )}
          {variant !== 'compact' && (
            <button onClick={handleShortlist} aria-label={`Shortlist ${firstName}`}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur transition-colors ${
                liked ? 'bg-white text-primary' : 'bg-white/80 text-on-surface-variant hover:text-primary'
              }`}>
              <span className={`material-symbols-outlined text-[20px] ${liked ? 'fill-icon' : ''}`}>favorite</span>
            </button>
          )}
        </div>

        <div className="px-4 pt-3.5 pb-4">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display text-[22px] font-semibold leading-tight text-on-surface truncate">
              {firstName}, {age}
            </h3>
            {isVerified && <VerifiedBadge />}
          </div>
          {subtitle && <p className="text-[13px] text-on-surface-variant truncate mt-0.5">{subtitle}</p>}
          {/* Always reserve the line so cards in a row stay aligned */}
          <p className="flex items-center gap-1.5 text-[12px] text-on-surface-variant/80 mt-2 h-4">
            {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            {isOnline ? 'Online now' : lastSeenLabel ? `Active ${lastSeenLabel}` : ''}
          </p>
        </div>
      </Link>

      {variant === 'compact' && (
        <div className="px-4 pb-4 flex gap-2">
          <button onClick={handleConnect} disabled={connect.isPending}
            className="flex-1 h-10 rounded-lg border border-primary text-primary text-[13px] font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-60">
            Send interest
          </button>
          <button onClick={handleShortlist} aria-label={`Shortlist ${firstName}`}
            className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
              liked ? 'border-primary text-primary' : 'border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary/40'
            }`}>
            <span className={`material-symbols-outlined text-[20px] ${liked ? 'fill-icon' : ''}`}>favorite</span>
          </button>
        </div>
      )}
      {variant !== 'compact' && restricted && (
        <Link to="/premium" className="block border-t border-outline-variant/60 px-4 py-2.5 text-[12px] font-medium text-primary hover:bg-surface-container-low">
          See full profile with Premium
        </Link>
      )}
    </article>
  )
})

export default ProfileCard
