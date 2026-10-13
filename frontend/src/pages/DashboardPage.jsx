import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProfileCard from '../components/ui/ProfileCard'
import InterestCard from '../components/ui/InterestCard'
import { NewBadge } from '../components/ui/Badge'
import { SkeletonProfileCard, SkeletonInterestCard } from '../components/ui/SkeletonCard'
import { useViewers, useMyProfile } from '../hooks/useProfiles'
import { useDailyPicks } from '../hooks/useFeatures'
import CompletenessRing from '../components/ui/CompletenessRing'
import { useInterested, useMatches } from '../hooks/useMatches'
import { useConversations } from '../hooks/useMessages'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../utils/placeholder'

function EmptyState({ icon, title, children }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center gap-2 py-10 px-6 rounded-[24px] border-2 border-dashed border-surface-variant text-on-surface-variant">
      <span className="material-symbols-outlined text-4xl opacity-40">{icon}</span>
      <p className="font-bold text-on-surface">{title}</p>
      {children && <p className="text-sm">{children}</p>}
    </div>
  )
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardPage() {
  const { data: topPicks = [], isLoading: picksLoading } = useDailyPicks()
  const { data: me } = useMyProfile()
  const { data: interestedList = [], isLoading: intLoading } = useInterested()
  const { data: convList = [], isLoading: convLoading } = useConversations()
  const { data: matches = [] } = useMatches()
  const { data: viewers } = useViewers()

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1280px] mx-auto px-6 py-8 pb-32"
    >
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-display-xl font-black text-on-surface mb-2">
          {me?.firstName ? `Hi ${me.firstName}` : 'Find your SoulSync'}
        </h1>
        <p className="text-body-lg text-on-surface-variant">Here are your personalized matches for today.</p>
      </header>

      {me && (
        <div className="mb-12 max-w-2xl">
          <CompletenessRing profile={me} compact />
        </div>
      )}

      {/* ── Top Picks ───────────────────────────────────────────────── */}
      <section className="mb-16">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-headline-lg font-black text-on-surface">Today's Top 5</h2>
            <p className="text-sm text-on-surface-variant">Best matches for your preferences · refreshes every day</p>
          </div>
          <Link to="/discover" className="text-sm font-bold text-primary hover:underline">View All</Link>
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {picksLoading
            ? [...Array(5)].map((_, i) => (
                <motion.div key={i} variants={fadeUp}><SkeletonProfileCard /></motion.div>
              ))
            : topPicks.length === 0
              ? <EmptyState icon="person_search" title="No profiles yet">New members join every day — check back soon.</EmptyState>
              : topPicks.map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProfileCard profile={p} variant="compact" />
                </motion.div>
              ))}
        </motion.div>
      </section>

      {/* ── Your Matches (accepted connections) ─────────────────────── */}
      {matches.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-headline-lg font-black text-on-surface">Your Matches</h2>
            <span className="text-sm font-bold text-on-surface-variant">{matches.length} connected</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {matches.map(({ id, profile: p }) => (
              <Link key={id} to={`/profile/${p.id}`} className="flex-shrink-0">
                <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center gap-2 w-24 cursor-pointer">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
                    <img src={p.photoUrl || AVATAR_PLACEHOLDER} onError={showPlaceholderOnError} alt={p.firstName}
                      className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold text-on-surface text-center truncate w-full">{p.firstName}, {p.age}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Who Viewed Me ───────────────────────────────────────────── */}
      {viewers && viewers.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-headline-lg font-black text-on-surface">Who Viewed Your Profile</h2>
            <span className="text-sm font-bold text-on-surface-variant">{viewers.length} visitor{viewers.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {viewers.map((p) => (
              <Link key={p.id} to={`/profile/${p.id}`} className="flex-shrink-0">
                <motion.div whileHover={{ y: -4 }} className="flex flex-col items-center gap-2 w-24 cursor-pointer">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-orange-200">
                    <img src={p.photoUrl || AVATAR_PLACEHOLDER} alt={p.firstName}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={showPlaceholderOnError}
                    />
                  </div>
                  <span className="text-xs font-bold text-on-surface text-center truncate w-full">{p.firstName}</span>
                  <span className="text-[10px] text-on-surface-variant truncate w-full text-center">
                    {p.restricted ? [p.caste, p.religion].filter(Boolean).join(' • ') : p.profession}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Bento grid: Interested + Recent ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interested in You */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-headline-lg font-black text-on-surface">Interested in You</h2>
            {interestedList.length > 0 && <NewBadge count={interestedList.length} />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {intLoading
              ? [...Array(4)].map((_, i) => <SkeletonInterestCard key={i} />)
              : interestedList.length === 0
                ? <EmptyState icon="favorite" title="No requests yet">When someone sends you a connect request, it shows up here.</EmptyState>
                : interestedList.map((match) => (
                  <InterestCard key={match.id} match={match} />
                ))}
          </div>
        </section>

        {/* Recent Messages */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-headline-lg font-black text-on-surface">Recent</h2>
            <Link to="/messages">
              <button className="p-2 text-primary hover:bg-orange-50 rounded-full transition-colors">
                <span className="material-symbols-outlined">chat_bubble</span>
              </button>
            </Link>
          </div>
          <div className="bg-white rounded-[24px] p-2 shadow-card">
            {convLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-surface-container shimmer flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-surface-container rounded shimmer" />
                      <div className="h-3 w-36 bg-surface-container rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : convList.length === 0 ? (
              <p className="p-6 text-center text-sm text-on-surface-variant">No conversations yet.</p>
            ) : (
              convList.slice(0, 5).map((conv) => (
                <Link key={conv.id} to={`/messages/${conv.id}`}>
                  <div className="flex items-center gap-4 p-4 hover:bg-surface-container rounded-[18px] transition-colors cursor-pointer">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img src={conv.otherProfile?.photoUrl || AVATAR_PLACEHOLDER} onError={showPlaceholderOnError}
                          alt={conv.otherProfile?.firstName} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-sm font-bold text-on-surface truncate">{conv.otherProfile?.firstName}</h4>
                        <span className="text-[10px] text-on-surface-variant font-bold">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant truncate mt-0.5">{conv.lastMessage}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
            <div className="p-3">
              <Link to="/messages">
                <button className="w-full py-3 text-center text-primary text-sm font-bold hover:bg-orange-50 rounded-xl transition-colors">
                  View All Messages
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </motion.main>
  )
}
