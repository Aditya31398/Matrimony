import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useProfile } from '../hooks/useProfile'
import { useConnect, useShortlist } from '../hooks/useMatches'
import { useStartConversation } from '../hooks/useMessages'
import { useCompatibility } from '../hooks/useCompatibility'
import { usePremium } from '../hooks/usePremium'
import { useBlockToggle } from '../hooks/useFeatures'
import { useAuth } from '../context/AuthContext'
import { VerifiedBadge, PremiumBadge } from '../components/ui/Badge'
import PremiumLock from '../components/ui/PremiumLock'
import ConnectModal from '../components/ui/ConnectModal'
import ReportModal from '../components/ui/ReportModal'
import MatchScoreCard from '../components/ui/MatchScoreCard'
import HoroscopeCard from '../components/ui/HoroscopeCard'
import { safetyService } from '../services/featureService'
import { shareWithFamily } from '../utils/share'
import { nakshatraName, moonSign } from '../utils/astrology'
import { showPlaceholderOnError } from '../utils/placeholder'

const DETAIL_FIELDS = [
  ['Religion', 'religion'], ['Caste', 'caste'], ['Mother tongue', 'motherTongue'],
  ['Education', 'education'], ['Profession', 'profession'], ['Height', 'height'],
  ['Diet', 'dietaryPreference'], ['Birth star', 'nakshatra'], ['Moon sign', 'rashi'],
]

// Free members only receive these fields from the API
const FREE_FIELDS = new Set(['religion', 'caste'])

function Section({ title, children }) {
  return (
    <section className="py-8 border-t border-outline-variant/70">
      <h2 className="text-[26px] leading-tight text-on-surface mb-5">{title}</h2>
      {children}
    </section>
  )
}

/** Main photo with thumbnails; a monogram when there's no photo or it's private. */
function Gallery({ profile }) {
  const photos = [...new Set([profile.photoUrl, ...(profile.photos ?? [])].filter(Boolean))]
  const [active, setActive] = useState(0)
  const current = photos[active]

  return (
    <div>
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container">
        {current ? (
          <img src={current} alt={profile.firstName} onError={showPlaceholderOnError} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-surface-container-low to-surface-container">
            <span className="font-display text-[140px] leading-none text-primary/20 select-none">{profile.firstName?.[0]}</span>
          </div>
        )}
        {profile.photoHidden && (
          <p className="absolute inset-x-0 bottom-0 m-4 flex items-center justify-center gap-1.5 rounded-lg bg-white/90 backdrop-blur px-3 py-2.5 text-[13px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[17px]">lock</span>
            {profile.firstName} shares photos after accepting your interest
          </p>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 mt-3">
          {photos.map((src, i) => (
            <button key={src} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}
              className={`w-16 h-20 rounded-lg overflow-hidden ring-offset-2 ring-offset-background transition ${i === active ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'}`}>
              <img src={src} alt="" className="w-full h-full object-cover" onError={showPlaceholderOnError} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProfileDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: profile, isLoading } = useProfile(id)
  const { auth } = useAuth()
  const { isPremium } = usePremium()
  const connect = useConnect()
  const shortlist = useShortlist()
  const startConversation = useStartConversation()
  const blockToggle = useBlockToggle()
  const [connectOpen, setConnectOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: compat } = useCompatibility(isPremium && profile && profile.id !== auth?.profileId ? profile.id : null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-outline-variant border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-6">
        <p className="font-display text-[30px] text-on-surface">Profile not found</p>
        <p className="text-[14px] text-on-surface-variant">It may have been removed or is no longer available.</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-[14px] font-medium text-primary hover:underline underline-offset-4">Go back</button>
      </div>
    )
  }

  const isOwn = auth?.profileId === profile.id
  const restricted = profile.restricted
  const showActions = !isOwn && !profile.blockedByMe
  const facts = restricted
    ? [profile.age && `${profile.age} years`, profile.caste, profile.religion]
    : [profile.age && `${profile.age} years`, profile.profession, profile.city]

  const sendInterest = (note) => {
    connect.mutate({ profileId: profile.id, note }, {
      onSuccess: (m) => {
        setConnectOpen(false)
        toast.success(m?.status === 'ACCEPTED'
          ? `It's a match — you and ${profile.firstName} are connected`
          : `Interest sent to ${profile.firstName}`)
      },
      onError: (e) => toast.error(e.message || 'Already connected or request pending'),
    })
  }

  const handleShortlist = () => {
    shortlist.mutate(profile.id, {
      onSuccess: () => toast.success(`${profile.firstName} added to your shortlist`),
      onError: (e) => toast.error(e.message || 'Could not shortlist'),
    })
  }

  const handleMessage = () => {
    if (!isPremium) {
      toast('Messaging is part of Premium')
      navigate('/premium')
      return
    }
    startConversation.mutate(profile.id, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
      onError: (e) => toast.error(e.message || 'Could not open chat'),
    })
  }

  const toggleBlock = () => {
    const block = !profile.blockedByMe
    if (block && !window.confirm(`Block ${profile.firstName}? They won't see you or be able to contact you.`)) return
    blockToggle.mutate({ profileId: profile.id, block }, {
      onSuccess: () => {
        toast.success(block ? `${profile.firstName} blocked` : `${profile.firstName} unblocked`)
        if (block) navigate('/discover')
      },
      onError: (e) => toast.error(e.message || 'Something went wrong'),
    })
  }

  const submitReport = async (payload) => {
    setReporting(true)
    try {
      const res = await safetyService.report(profile.id, payload)
      toast.success(res.message)
      setReportOpen(false)
      if (payload.block) navigate('/discover')
    } catch (e) {
      toast.error(e.message || 'Could not send report')
    } finally {
      setReporting(false)
    }
  }

  const value = (key) => key === 'nakshatra' ? nakshatraName(profile.nakshatra)
    : key === 'rashi' ? moonSign(profile)
    : profile[key]

  const actions = (
    <>
      <button onClick={() => setConnectOpen(true)} disabled={connect.isPending}
        className="flex-1 sm:flex-none h-11 px-6 rounded-lg bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
        Send interest
      </button>
      <button onClick={handleMessage} disabled={startConversation.isPending}
        className="flex-1 sm:flex-none h-11 px-5 rounded-lg border border-outline-variant bg-white text-[14px] font-medium text-on-surface hover:border-on-surface/30 transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-1.5">
        {!isPremium && <span className="material-symbols-outlined text-[16px]">lock</span>}
        Message
      </button>
      <button onClick={handleShortlist} disabled={shortlist.isPending} aria-label="Shortlist"
        className="h-11 w-11 flex-shrink-0 rounded-lg border border-outline-variant bg-white text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors flex items-center justify-center">
        <span className="material-symbols-outlined text-[20px]">favorite</span>
      </button>
    </>
  )

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-36 lg:pb-20">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="More options"
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-float border border-outline-variant/70 py-1.5 z-50"
              onClick={() => setMenuOpen(false)}>
              <button onClick={() => shareWithFamily(profile.id, profile.firstName, isOwn)}
                className="w-full text-left px-4 py-2.5 text-[14px] text-on-surface hover:bg-surface-container-low">Share with family</button>
              {!isOwn && (
                <>
                  <button onClick={toggleBlock}
                    className="w-full text-left px-4 py-2.5 text-[14px] text-on-surface hover:bg-surface-container-low">
                    {profile.blockedByMe ? 'Unblock' : 'Block'} {profile.firstName}
                  </button>
                  <button onClick={() => setReportOpen(true)}
                    className="w-full text-left px-4 py-2.5 text-[14px] text-red-700 hover:bg-red-50">Report profile</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {profile.blockedByMe && (
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-outline-variant/70 bg-surface-container-low px-5 py-4 text-[14px]">
          <p className="flex-1 text-on-surface">You've blocked {profile.firstName}. They can't see your profile or contact you.</p>
          <button onClick={toggleBlock} className="font-medium text-primary hover:underline underline-offset-4 self-start">Unblock</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-14">
        <div className="lg:sticky lg:top-24 self-start">
          <Gallery profile={profile} />
        </div>

        <div>
          <header className="pb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {profile.isPremium && <PremiumBadge />}
              {profile.isVerified && (
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-on-surface-variant">
                  <VerifiedBadge /> Verified profile
                </span>
              )}
            </div>
            <h1 className="text-[44px] sm:text-[56px] leading-[1.02] text-on-surface">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-[16px] text-on-surface-variant mt-3">{facts.filter(Boolean).join('  ·  ')}</p>
            {showActions && <div className="hidden lg:flex gap-2.5 mt-7">{actions}</div>}
            {isOwn && (
              <button onClick={() => navigate('/edit-profile')}
                className="mt-7 h-11 px-6 rounded-lg border border-outline-variant bg-white text-[14px] font-medium text-on-surface hover:border-on-surface/30 transition-colors">
                Edit profile
              </button>
            )}
          </header>

          {!isOwn && !profile.blockedByMe && (
            <Section title="Why you match"><MatchScoreCard profileId={profile.id} /></Section>
          )}

          {!restricted && profile.bio && (
            <Section title={`About ${profile.firstName}`}>
              {profile.bio.split('\n\n').map((para, i) => (
                <p key={i} className="text-[16px] leading-[1.75] text-on-surface/85 mb-4 last:mb-0 max-w-prose">{para}</p>
              ))}
            </Section>
          )}

          <Section title="Details">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
              {DETAIL_FIELDS.map(([label, key]) => {
                const locked = restricted && !FREE_FIELDS.has(key)
                return (
                  <div key={key}>
                    <dt className="text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">{label}</dt>
                    <dd className={`text-[15px] mt-1 ${locked ? 'text-on-surface-variant/60' : 'text-on-surface'}`}>
                      {locked ? 'Premium' : value(key) ?? '—'}
                    </dd>
                  </div>
                )
              })}
              <div>
                <dt className="text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">Phone</dt>
                <dd className="text-[15px] mt-1">
                  {restricted
                    ? <span className="text-on-surface-variant/60">Premium</span>
                    : profile.phone
                      ? <a href={`tel:${profile.phone}`} className="text-on-surface hover:text-primary">{profile.phone}</a>
                      : <span className="text-on-surface-variant">Not shared</span>}
                </dd>
              </div>
            </dl>
            {restricted && (
              <div className="mt-8">
                <PremiumLock title={`See ${profile.firstName}'s full profile`}
                  text="Phone number, horoscope, profession, education, story and preferences are visible to Premium members." />
              </div>
            )}
          </Section>

          {!restricted && ((profile.interests ?? []).length > 0 || (profile.lifestyle ?? []).length > 0) && (
            <Section title="Interests & lifestyle">
              <div className="flex flex-wrap gap-2">
                {[...(profile.interests ?? []), ...(profile.lifestyle ?? [])].map((tag) => (
                  <span key={tag} className="rounded-full border border-outline-variant px-3.5 py-1.5 text-[13px] text-on-surface">{tag}</span>
                ))}
              </div>
            </Section>
          )}

          {!restricted && (profile.lookingFor ?? []).length > 0 && (
            <Section title="Looking for">
              <ul className="space-y-2.5 max-w-prose">
                {profile.lookingFor.map((item, i) => (
                  <li key={i} className="text-[16px] leading-relaxed text-on-surface/85">{item}</li>
                ))}
              </ul>
            </Section>
          )}

          {!isOwn && !profile.blockedByMe && (
            <Section title="Horoscope compatibility">
              {isPremium
                ? <HoroscopeCard compat={compat} />
                : <PremiumLock title="Kundli match" text={`See your Ashtakoota / Dashakoota compatibility with ${profile.firstName}.`} />}
            </Section>
          )}
        </div>
      </div>

      {/* Phones: actions stay within reach, above the bottom navigation */}
      {showActions && (
        <div className="lg:hidden fixed inset-x-0 bottom-[72px] z-[60] px-4 pointer-events-none">
          <div className="pointer-events-auto mx-auto max-w-md flex gap-2 rounded-xl bg-white/95 backdrop-blur border border-outline-variant/70 p-2 shadow-float">
            {actions}
          </div>
        </div>
      )}

      <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} firstName={profile.firstName}
        onSend={sendInterest} sending={connect.isPending} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} firstName={profile.firstName}
        onSubmit={submitReport} submitting={reporting} />
    </motion.main>
  )
}
