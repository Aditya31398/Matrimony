import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useMyProfile } from '../hooks/useProfiles'
import { useBlockedMembers, useBlockToggle } from '../hooks/useFeatures'
import { useAuth } from '../context/AuthContext'
import { VerifiedBadge, PremiumBadge } from '../components/ui/Badge'
import CompletenessRing from '../components/ui/CompletenessRing'
import { shareWithFamily } from '../utils/share'
import { showPlaceholderOnError } from '../utils/placeholder'
import { nakshatraName, moonSign } from '../utils/astrology'

const DETAIL_FIELDS = [
  ['Religion', 'religion'], ['Caste', 'caste'], ['Mother tongue', 'motherTongue'],
  ['Education', 'education'], ['Profession', 'profession'], ['Height', 'height'],
  ['Diet', 'dietaryPreference'], ['Phone', 'phone'], ['Birth star', 'nakshatra'], ['Moon sign', 'rashi'],
]

function Section({ title, action, children }) {
  return (
    <section className="py-8 border-t border-outline-variant/70">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-[26px] leading-tight text-on-surface">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export default function MyProfilePage() {
  const { data: profile, isLoading } = useMyProfile()
  const [showBlocked, setShowBlocked] = useState(false)
  const { data: blocked = [] } = useBlockedMembers(showBlocked)
  const blockToggle = useBlockToggle()
  const { logout } = useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center px-6">
        <p className="font-display text-[30px] text-on-surface">Profile unavailable</p>
        <p className="text-[14px] text-on-surface-variant">Please sign in again to view your profile.</p>
      </div>
    )
  }

  const value = (key) => key === 'nakshatra' ? nakshatraName(profile.nakshatra)
    : key === 'rashi' ? moonSign(profile)
    : profile[key]
  const facts = [profile.age && `${profile.age} years`, profile.profession, profile.city].filter(Boolean)
  const preferences = [
    profile.lookingForGender && `Looking for a ${profile.lookingForGender.toLowerCase()}`,
    profile.ageMin && profile.ageMax && `aged ${profile.ageMin}–${profile.ageMax}`,
  ].filter(Boolean).join(', ')
  const tags = [...(profile.interests ?? []), ...(profile.lifestyle ?? [])]
  const editLink = <Link to="/edit-profile" className="text-[13px] font-medium text-primary hover:underline underline-offset-4">Edit</Link>

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-14">
        {/* Left: photo and account tools */}
        <div className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} onError={showPlaceholderOnError} alt={profile.firstName} className="w-full h-full object-cover" />
            ) : (
              <Link to="/edit-profile" className="w-full h-full flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <span className="font-display text-[120px] leading-none text-primary/20">{profile.firstName?.[0]}</span>
                <span className="text-[13px] font-medium text-primary">Add a photo</span>
              </Link>
            )}
            {profile.photoPrivate && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur px-2 py-1 text-[11px] font-medium text-on-surface">
                <span className="material-symbols-outlined text-[14px]">lock</span> Photos private
              </span>
            )}
          </div>

          <CompletenessRing profile={profile} />

          <div className="rounded-2xl border border-outline-variant/70 bg-white divide-y divide-outline-variant/60">
            <button onClick={() => shareWithFamily(profile.id, profile.firstName, true)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-[14px] text-on-surface hover:bg-surface-container-low rounded-t-2xl">
              Share with family
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">ios_share</span>
            </button>
            <button onClick={() => setShowBlocked((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-[14px] text-on-surface hover:bg-surface-container-low">
              Blocked members
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{showBlocked ? 'expand_less' : 'expand_more'}</span>
            </button>
            {showBlocked && (
              <div className="px-5 py-3 space-y-2">
                {blocked.length === 0
                  ? <p className="text-[13px] text-on-surface-variant">You haven't blocked anyone.</p>
                  : blocked.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-[13px]">
                      <span className="text-on-surface">{b.firstName} {b.lastName}</span>
                      <button disabled={blockToggle.isPending}
                        onClick={() => blockToggle.mutate({ profileId: b.id, block: false }, {
                          onSuccess: () => toast.success(`${b.firstName} unblocked`),
                        })}
                        className="font-medium text-primary hover:underline underline-offset-4">Unblock</button>
                    </div>
                  ))}
              </div>
            )}
            <button onClick={() => { logout(); navigate('/') }}
              className="w-full text-left px-5 py-3.5 text-[14px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low rounded-b-2xl">
              Sign out
            </button>
          </div>
        </div>

        {/* Right: how others see you */}
        <div>
          <header className="pb-8">
            <p className="text-[12px] uppercase tracking-[0.14em] text-on-surface-variant mb-3">Your profile</p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {profile.isPremium && <PremiumBadge />}
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-on-surface-variant"><VerifiedBadge /> Verified</span>
              )}
            </div>
            <h1 className="text-[44px] sm:text-[56px] leading-[1.02] text-on-surface">{profile.firstName} {profile.lastName}</h1>
            <p className="text-[16px] text-on-surface-variant mt-3">{facts.join('  ·  ')}</p>
            <div className="flex flex-wrap gap-2.5 mt-7">
              <Link to="/edit-profile" className="h-11 px-6 inline-flex items-center rounded-lg bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors">
                Edit profile
              </Link>
              <Link to={`/profile/${profile.id}`} className="h-11 px-5 inline-flex items-center rounded-lg border border-outline-variant bg-white text-[14px] font-medium text-on-surface hover:border-on-surface/30 transition-colors">
                Preview as others see it
              </Link>
            </div>
          </header>

          <Section title="Membership">
            {profile.isPremium && profile.premiumUntil ? (
              <p className="text-[15px] text-on-surface">
                Premium until <strong className="font-semibold">{formatDate(profile.premiumUntil)}</strong>.{' '}
                <Link to="/premium" className="text-primary hover:underline underline-offset-4">Extend</Link>
              </p>
            ) : (
              <p className="text-[15px] text-on-surface-variant">
                Free membership.{' '}
                <Link to="/premium" className="text-primary font-medium hover:underline underline-offset-4">Upgrade to Premium</Link>{' '}
                to see full profiles, chat and check horoscope matches.
              </p>
            )}
          </Section>

          <Section title="About me" action={editLink}>
            {profile.bio
              ? profile.bio.split('\n\n').map((para, i) => (
                <p key={i} className="text-[16px] leading-[1.75] text-on-surface/85 mb-4 last:mb-0 max-w-prose">{para}</p>
              ))
              : <p className="text-[15px] text-on-surface-variant">Tell people a little about yourself — it's the first thing they read.</p>}
          </Section>

          <Section title="Details" action={editLink}>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
              {DETAIL_FIELDS.map(([label, key]) => (
                <div key={key}>
                  <dt className="text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">{label}</dt>
                  <dd className="text-[15px] text-on-surface mt-1">{value(key) ?? '—'}</dd>
                </div>
              ))}
            </dl>
          </Section>

          {tags.length > 0 && (
            <Section title="Interests & lifestyle" action={editLink}>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="rounded-full border border-outline-variant px-3.5 py-1.5 text-[13px] text-on-surface">{t}</span>
                ))}
              </div>
            </Section>
          )}

          {preferences && (
            <Section title="Partner preferences" action={editLink}>
              <p className="text-[15px] text-on-surface">{preferences}.</p>
            </Section>
          )}
        </div>
      </div>
    </motion.main>
  )
}
