import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { shareService } from '../services/featureService'
import { nakshatraName, moonSign } from '../utils/astrology'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../utils/placeholder'
import { useTenant } from '../context/TenantContext'

const ROWS = [
  ['Religion', 'religion'], ['Caste', 'caste'], ['Mother tongue', 'motherTongue'],
  ['Education', 'education'], ['Profession', 'profession'], ['Height', 'height'],
  ['Diet', 'dietaryPreference'], ['Birth star', 'nakshatra'], ['Moon sign', 'rashi'],
]

/** Public, read-only profile opened from a WhatsApp link — no login needed. */
export default function FamilyViewPage() {
  const { token } = useParams()
  const { name: brand } = useTenant()
  const { data: p, isLoading, error } = useQuery({
    queryKey: ['family-view', token],
    queryFn: () => shareService.view(token),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !p) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-6xl opacity-30">link_off</span>
        <p className="text-xl font-bold text-on-surface">This link isn't available</p>
        <p className="text-sm max-w-sm">{error?.message?.includes('expired') ? error.message : 'It may have expired (links last 7 days) or been removed. Ask for a new one.'}</p>
      </div>
    )
  }

  const value = (key) => key === 'nakshatra' ? nakshatraName(p.nakshatra) : key === 'rashi' ? moonSign(p) : p[key]
  const rows = ROWS.filter(([, key]) => value(key))
  const location = [p.city, p.state].filter(Boolean).join(', ')

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[760px] mx-auto px-4 sm:px-6 py-8 pb-24">
      <p className="text-center text-sm text-on-surface-variant mb-6">
        <span className="material-symbols-outlined align-middle text-[18px] text-green-600 mr-1">family_restroom</span>
        {p.sharedOwnProfile
          ? <><strong className="text-on-surface">{p.sharedBy}</strong> shared their {brand} profile with you</>
          : <><strong className="text-on-surface">{p.sharedBy}</strong> would like your opinion on this {brand} profile</>}
      </p>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-surface">
          <img src={p.photoUrl || AVATAR_PLACEHOLDER} onError={showPlaceholderOnError} alt={p.firstName}
            className="w-full h-full object-cover" />
          {p.photoHidden && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined fill-icon text-[14px]">lock</span>Photo is private
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
            <h1 className="text-3xl font-semibold">{p.firstName} {p.lastName}, {p.age}</h1>
            {location && <p className="text-sm opacity-90 mt-1">{location}, India</p>}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {rows.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
              {rows.map(([label, key]) => (
                <div key={key}>
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</dt>
                  <dd className="text-sm font-semibold text-on-surface mt-0.5">{value(key)}</dd>
                </div>
              ))}
            </dl>
          )}
          {p.bio && (
            <div>
              <h2 className="text-sm font-semibold text-on-surface mb-1">About</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{p.bio}</p>
            </div>
          )}
          {p.interests?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {p.interests.map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-full bg-tertiary-fixed text-xs font-bold text-on-tertiary-container">{t}</span>
              ))}
            </div>
          )}
          {p.limited && (
            <p className="text-xs text-on-surface-variant bg-surface rounded-xl px-4 py-3">
              Only basic details are shown. Contact details are never shared through family links.
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-on-surface-variant mt-6">
        Link valid until {new Date(p.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}.{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">Create your own profile</Link>
      </p>
    </motion.main>
  )
}
