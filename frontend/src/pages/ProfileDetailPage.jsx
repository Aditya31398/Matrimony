import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProfile } from '../hooks/useProfile'
import { useConnect, useShortlist } from '../hooks/useMatches'
import { useStartConversation } from '../hooks/useMessages'
import { useCompatibility } from '../hooks/useCompatibility'
import { VerifiedBadge, PremiumBadge } from '../components/ui/Badge'
import PremiumLock from '../components/ui/PremiumLock'
import { usePremium } from '../hooks/usePremium'
import { useAuth } from '../context/AuthContext'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../utils/placeholder'
import toast from 'react-hot-toast'
import { useState } from 'react'
import ConnectModal from '../components/ui/ConnectModal'
import ReportModal from '../components/ui/ReportModal'
import MatchScoreCard from '../components/ui/MatchScoreCard'
import { useBlockToggle } from '../hooks/useFeatures'
import { safetyService } from '../services/featureService'
import { shareWithFamily } from '../utils/share'
import { nakshatraName, moonSign } from '../utils/astrology'

const TIER_CONFIG = {
  EXCELLENT:    { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Excellent' },
  GOOD:         { color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-200',    label: 'Good' },
  AVERAGE:      { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   label: 'Average' },
  POOR:         { color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'border-orange-200',  label: 'Poor' },
  INCOMPATIBLE: { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     label: 'Challenging' },
}

function CompatibilityCard({ compat }) {
  if (!compat) return null

  if (compat.algorithm === 'NONE') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
        className="bg-white rounded-[32px] p-7 shadow-card border border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400">stars</span>
          </div>
          <h3 className="text-lg font-black text-on-surface">Horoscope Match</h3>
        </div>
        <p className="text-sm text-on-surface-variant">{compat.summary}</p>
      </motion.div>
    )
  }

  const cfg = TIER_CONFIG[compat.tier] ?? TIER_CONFIG.AVERAGE
  const isAshta = compat.algorithm === 'ASHTAKOOTA'
  const isDasha = compat.algorithm === 'DASHAKOOTA'
  const isBasic = compat.algorithm === 'BASIC_ZODIAC'
  const scoreLabel = isBasic
    ? `${compat.totalScore.toFixed(1)} / ${compat.maxScore}`
    : isDasha
      ? `${Math.round(compat.totalScore)} / ${compat.maxScore} poruthams`
      : `${compat.totalScore.toFixed(1)} / ${compat.maxScore} pts`

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
      className={`rounded-[32px] p-7 border ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center">
            <span className={`material-symbols-outlined ${cfg.color}`}>stars</span>
          </div>
          <h3 className="text-lg font-black text-on-surface">
            {isAshta ? 'Ashtakoota Match' : isDasha ? 'Dashakoota Match' : 'Star Compatibility'}
          </h3>
        </div>
        <div className="text-right">
          {isDasha && compat.rajjuDosha
            ? <div className={`text-lg font-black ${cfg.color}`}>Not advised</div>
            : <div className={`text-2xl font-black ${cfg.color}`}>{compat.percentage}%</div>}
          <div className="text-xs text-on-surface-variant font-medium">{scoreLabel}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/60 mb-4 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${cfg.color.replace('text-', 'bg-')}`}
          style={{ width: `${compat.percentage}%` }} />
      </div>

      <p className="text-sm text-on-surface-variant mb-4">{compat.summary}</p>

      {compat.region?.includes('/') && (
        <p className="text-xs text-on-surface-variant mb-4">
          Mixed traditions ({compat.region.replace('/', ' & ').toLowerCase()}) — both systems are shown.
        </p>
      )}

      {/* Dosha alerts */}
      {(compat.nadiDosha || compat.manglikDosha || compat.rajjuDosha) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {compat.nadiDosha && <DoshaTag label="Nadi Dosha" />}
          {compat.rajjuDosha && <DoshaTag label="Rajju Dosha" />}
          {compat.manglikDosha && <DoshaTag label="Manglik Mismatch" />}
        </div>
      )}

      {(compat.advisories ?? []).length > 0 && (
        <ul className="mb-4 space-y-1.5">
          {compat.advisories.map((note, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] mt-0.5">info</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}

      {compat.alternate && compat.alternate.algorithm !== 'NONE' && (
        <div className="flex items-center justify-between rounded-2xl bg-white/60 px-4 py-3 mb-4 text-sm">
          <span className="font-bold text-on-surface">
            {compat.alternate.algorithm === 'ASHTAKOOTA' ? 'Ashtakoota (North Indian)' : 'Dashakoota (South Indian)'}
          </span>
          <span className="font-black text-on-surface">
            {compat.alternate.algorithm === 'DASHAKOOTA'
              ? `${Math.round(compat.alternate.totalScore)} / ${compat.alternate.maxScore}`
              : `${compat.alternate.totalScore.toFixed(1)} / ${compat.alternate.maxScore}`}
            <span className="ml-2 text-xs font-bold text-on-surface-variant">{compat.alternate.percentage}%</span>
          </span>
        </div>
      )}

      {/* Koota breakdown (collapsed by default) */}
      {compat.kootas && compat.kootas.length > 0 && (
        <details className="group">
          <summary className="text-xs font-bold text-on-surface-variant cursor-pointer select-none hover:text-primary list-none flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] group-open:rotate-90 transition-transform">chevron_right</span>
            View breakdown
          </summary>
          <div className="mt-3 space-y-2">
            {compat.kootas.map((k) => (
              <div key={k.name} className="flex items-center gap-3 text-sm">
                <span className="w-28 font-bold text-on-surface text-xs shrink-0">{k.name}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/60 overflow-hidden">
                  <div className={`h-full rounded-full ${k.scored > 0 ? cfg.color.replace('text-', 'bg-') : 'bg-red-300'}`}
                    style={{ width: `${(k.scored / k.max) * 100}%` }} />
                </div>
                <span className={`w-10 text-right text-xs font-bold shrink-0 ${k.scored > 0 ? cfg.color : 'text-red-500'}`}>
                  {k.scored}/{k.max}
                </span>
                <span className="text-xs text-on-surface-variant hidden sm:block truncate max-w-[140px]">{k.detail}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </motion.div>
  )
}

function DoshaTag({ label }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
      <span className="material-symbols-outlined text-[14px]">warning</span>
      {label}
    </span>
  )
}

const INFO_FIELDS = [
  ['Religion', 'religion'], ['Caste', 'caste'], ['Height', 'height'],
  ['Mother Tongue', 'motherTongue'], ['Dietary Pref', 'dietaryPreference'],
  ['Education', 'education'], ['Birth Star', 'nakshatra'], ['Moon Sign', 'rashi'],
]

// Free members only receive these fields from the API
const FREE_FIELDS = new Set(['religion', 'caste'])

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
        <div className="w-14 h-14 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-6xl opacity-30">person_off</span>
        <p className="text-xl font-bold">Profile not found</p>
        <button onClick={() => navigate(-1)} className="text-primary font-bold hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Go back
        </button>
      </div>
    )
  }

  const isOwn = auth?.profileId === profile.id
  const restricted = profile.restricted

  const handleConnect = () => setConnectOpen(true)

  const sendInterest = (note) => {
    connect.mutate({ profileId: profile.id, note }, {
      onSuccess: (m) => {
        setConnectOpen(false)
        toast.success(m?.status === 'ACCEPTED'
          ? `It's a match! You and ${profile.firstName} are connected`
          : `Interest sent to ${profile.firstName}`)
      },
      onError: (e) => toast.error(e.message || 'Already connected or request pending'),
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

  const handleShortlist = () => {
    shortlist.mutate(profile.id, {
      onSuccess: () => toast.success(`${profile.firstName} added to shortlist`),
      onError: (e) => toast.error(e.message || 'Could not shortlist'),
    })
  }

  const handleMessage = () => {
    if (!isPremium) {
      toast('Chatting is a Premium feature', { icon: '🔒' })
      navigate('/premium')
      return
    }
    startConversation.mutate(profile.id, {
      onSuccess: (conv) => navigate(`/messages/${conv.id}`),
      onError: (e) => toast.error(e.message || 'Could not open chat'),
    })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-40">
      {/* Back button + actions menu */}
      <div className="max-w-[1280px] mx-auto px-6 pt-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="More options"
            className="p-2 rounded-full hover:bg-surface text-on-surface-variant">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-float border border-slate-100 overflow-hidden z-50"
              onClick={() => setMenuOpen(false)}>
              <button onClick={() => shareWithFamily(profile.id, profile.firstName, isOwn)}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface">
                <span className="material-symbols-outlined text-[20px] text-green-600">family_restroom</span>
                Share with family
              </button>
              {!isOwn && (
                <>
                  <button onClick={toggleBlock}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-on-surface hover:bg-surface">
                    <span className="material-symbols-outlined text-[20px]">block</span>
                    {profile.blockedByMe ? 'Unblock' : 'Block'}
                  </button>
                  <button onClick={() => setReportOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                    <span className="material-symbols-outlined text-[20px]">flag</span>
                    Report profile
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {profile.blockedByMe && (
        <div className="max-w-[1280px] mx-auto px-6 mt-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl bg-slate-100 px-5 py-4">
            <span className="material-symbols-outlined text-slate-500">block</span>
            <p className="flex-1 text-sm text-on-surface">You've blocked {profile.firstName}. They can't see your profile or contact you.</p>
            <button onClick={toggleBlock} className="text-sm font-bold text-primary hover:underline">Unblock</button>
          </div>
        </div>
      )}

      <ConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} firstName={profile.firstName}
        onSend={sendInterest} sending={connect.isPending} />
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} firstName={profile.firstName}
        onSubmit={submitReport} submitting={reporting} />

      <main className="max-w-[1280px] mx-auto px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left: Photo + Basic Info ─────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="relative group">
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.10)] group-hover:scale-[1.01] transition-transform duration-500">
                <img src={profile.photoUrl || AVATAR_PLACEHOLDER} alt={profile.firstName}
                  onError={showPlaceholderOnError} className="w-full h-full object-cover" />
                {profile.photoHidden && (
                  <div className="absolute inset-x-0 top-0 flex justify-center pt-8">
                    <span className="flex items-center gap-2 bg-black/50 backdrop-blur text-white text-xs font-bold px-4 py-2 rounded-full">
                      <span className="material-symbols-outlined fill-icon text-[16px]">lock</span>
                      {profile.firstName} shares photos after accepting your interest
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                  {profile.isPremium && <div className="mb-3"><PremiumBadge /></div>}
                  <h1 className="text-[40px] font-black leading-tight">
                    {profile.firstName} {profile.lastName}, {profile.age}
                  </h1>
                  {!restricted && (
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 opacity-90 text-sm">
                      {profile.city && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          {profile.city}, India
                        </div>
                      )}
                      {profile.profession && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">work</span>
                          {profile.profession}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
              className="bg-white rounded-[32px] p-8 shadow-card border border-slate-100">
              <h3 className="font-display text-2xl font-bold text-on-surface mb-5">Basic Info</h3>
              <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                {INFO_FIELDS.map(([label, key]) => {
                  const locked = restricted && !FREE_FIELDS.has(key)
                  const value = key === 'nakshatra' ? nakshatraName(profile.nakshatra) : key === 'rashi' ? moonSign(profile) : profile[key]
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                      {locked
                        ? <span className="flex items-center gap-1 text-sm font-semibold text-slate-400">
                            <span className="material-symbols-outlined text-[16px]">lock</span>Premium
                          </span>
                        : <span className="font-semibold text-on-surface text-sm">{value ?? '—'}</span>}
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">call</span>
                {restricted
                  ? <span className="text-sm font-semibold text-slate-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">lock</span>Phone number visible to Premium members
                    </span>
                  : profile.phone
                    ? <a href={`tel:${profile.phone}`} className="text-sm font-bold text-on-surface hover:text-primary">{profile.phone}</a>
                    : <span className="text-sm text-on-surface-variant">Phone not shared</span>}
              </div>
            </motion.div>
          </div>

          {/* ── Right: Story, Interests, Looking For ─────────────────── */}
          <div className="lg:col-span-7 space-y-5">
            {!isOwn && !profile.blockedByMe && <MatchScoreCard profileId={profile.id} firstName={profile.firstName} />}

            {restricted ? (
              <PremiumLock
                title={`See ${profile.firstName}'s full profile`}
                text="Phone number, star & rashi, profession, education, story, interests and partner preferences are visible to Premium members."
              />
            ) : (<>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-white rounded-[32px] p-9 shadow-card border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined fill-icon">auto_awesome</span>
                </div>
                <h2 className="text-2xl font-black text-on-surface">My Story</h2>
                {profile.isVerified && <VerifiedBadge size="lg" />}
              </div>
              {profile.bio?.split('\n\n').map((para, i) => (
                <p key={i} className="text-on-surface-variant leading-relaxed text-[15px] mb-4 last:mb-0">{para}</p>
              ))}
            </motion.div>

            {((profile.interests ?? []).length > 0 || (profile.lifestyle ?? []).length > 0) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
              className={`grid grid-cols-1 gap-5 ${(profile.interests ?? []).length && (profile.lifestyle ?? []).length ? 'md:grid-cols-2' : ''}`}>
              {(profile.interests ?? []).length > 0 && (
              <div className="bg-tertiary-fixed rounded-[32px] p-7">
                <h3 className="text-lg font-black text-on-tertiary-fixed mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">palette</span> Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.interests ?? []).map((tag) => (
                    <span key={tag} className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-on-tertiary-container">{tag}</span>
                  ))}
                </div>
              </div>
              )}
              {(profile.lifestyle ?? []).length > 0 && (
              <div className="bg-secondary-fixed rounded-[32px] p-7">
                <h3 className="text-lg font-black text-on-secondary-fixed-variant mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">fitness_center</span> Lifestyle
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(profile.lifestyle ?? []).map((tag) => (
                    <span key={tag} className="bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-on-secondary-container">{tag}</span>
                  ))}
                </div>
              </div>
              )}
            </motion.div>
            )}

            {/* Horoscope compatibility card */}
            <CompatibilityCard compat={compat} />

            {(profile.lookingFor ?? []).length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-primary-fixed rounded-[32px] p-9 border border-orange-100/50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined fill-icon">favorite</span>
                  </div>
                  <h2 className="text-2xl font-black text-on-primary-fixed">What I'm Looking For</h2>
                </div>
                <div className="space-y-4">
                  {profile.lookingFor.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary mt-0.5 flex-shrink-0">check_circle</span>
                      <p className="text-on-primary-fixed-variant text-[15px] leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            </>)}

            {!isOwn && !isPremium && (
              <PremiumLock
                title="Horoscope compatibility"
                text={`See your Ashtakoota / Dashakoota match with ${profile.firstName}.`}
              />
            )}
          </div>
        </div>
      </main>

      {/* ── Floating Action Bar ──────────────────────────────────────── */}
      {!isOwn && !profile.blockedByMe && <div className="fixed inset-x-0 bottom-24 md:bottom-8 z-[60] flex justify-center px-4 pointer-events-none">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="w-full max-w-md pointer-events-auto"
      >
        <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] p-3 shadow-float flex items-center gap-3 border border-outline-variant/70">
          <button onClick={handleShortlist} disabled={shortlist.isPending}
            className="h-14 w-14 rounded-2xl bg-white border-2 border-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-50 active:scale-95 transition-all disabled:opacity-60 flex-shrink-0">
            <span className="material-symbols-outlined">bookmark</span>
          </button>
          <button onClick={handleMessage} disabled={startConversation.isPending}
            className="flex-1 h-14 rounded-2xl bg-white border-2 border-slate-100 text-slate-700 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-60">
            {startConversation.isPending
              ? <span className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
              : <><span className="material-symbols-outlined fill-icon text-[20px]">{isPremium ? 'chat' : 'lock'}</span>Message</>
            }
          </button>
          <button onClick={handleConnect} disabled={connect.isPending}
            className="flex-[1.3] h-14 rounded-2xl text-white font-black flex items-center justify-center gap-2 shadow-btn-primary hover:shadow-btn-primary-hover active:scale-95 transition-all disabled:opacity-60"
            style={{ background: 'var(--gradient-primary)' }}>
            {connect.isPending
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span className="material-symbols-outlined fill-icon">send</span>Connect</>
            }
          </button>
        </div>
      </motion.div>
      </div>}
    </motion.div>
  )
}
