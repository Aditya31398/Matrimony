import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProfileCard from '../components/ui/ProfileCard'
import InterestCard from '../components/ui/InterestCard'
import SectionHeader from '../components/ui/SectionHeader'
import CompletenessRing from '../components/ui/CompletenessRing'
import { SkeletonProfileCard, SkeletonInterestCard } from '../components/ui/SkeletonCard'
import { useViewers, useMyProfile } from '../hooks/useProfiles'
import { useDailyPicks } from '../hooks/useFeatures'
import { useInterested, useMatches } from '../hooks/useMatches'
import { useConversations } from '../hooks/useMessages'
import { AVATAR_PLACEHOLDER, showPlaceholderOnError } from '../utils/placeholder'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function Empty({ children }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-outline-variant px-6 py-10 text-center text-[13px] text-on-surface-variant">
      {children}
    </div>
  )
}

function PersonRow({ people, caption }) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
      {people.map((p) => (
        <Link key={p.id} to={`/profile/${p.id}`} className="flex-shrink-0 w-[76px] text-center group">
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden ring-1 ring-outline-variant group-hover:ring-primary/40 transition">
            <img src={p.photoUrl || AVATAR_PLACEHOLDER} onError={showPlaceholderOnError} alt={p.firstName}
              className="w-full h-full object-cover" loading="lazy" />
          </div>
          <p className="mt-2 text-[13px] font-medium text-on-surface truncate">{p.firstName}</p>
          {caption && <p className="text-[11px] text-on-surface-variant truncate">{caption(p)}</p>}
        </Link>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data: topPicks = [], isLoading: picksLoading } = useDailyPicks()
  const { data: me } = useMyProfile()
  const { data: interestedList = [], isLoading: intLoading } = useInterested()
  const { data: convList = [], isLoading: convLoading } = useConversations()
  const { data: matches = [] } = useMatches()
  const { data: viewers = [] } = useViewers()
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-10 pb-32">
      <header className="mb-8">
        <p className="text-[12px] uppercase tracking-[0.14em] text-on-surface-variant">{today}</p>
        <h1 className="text-[40px] sm:text-[48px] leading-[1.05] text-on-surface mt-1">
          {greeting()}{me?.firstName ? `, ${me.firstName}` : ''}
        </h1>
      </header>

      {me && <div className="mb-12"><CompletenessRing profile={me} compact /></div>}

      <section className="mb-14">
        <SectionHeader overline="Curated daily" title="Today's top five"
          subtitle="Chosen for your preferences. A new selection arrives every morning." to="/discover" linkLabel="Browse all" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {picksLoading
            ? [...Array(5)].map((_, i) => <SkeletonProfileCard key={i} />)
            : topPicks.length === 0
              ? <Empty>New members join every day — your selection will appear here.</Empty>
              : topPicks.map((p) => <ProfileCard key={p.id} profile={p} variant="compact" />)}
        </div>
      </section>

      {(matches.length > 0 || viewers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-12 mb-14">
          {matches.length > 0 && (
            <section>
              <SectionHeader title="Your connections" subtitle={`${matches.length} accepted`} />
              <PersonRow people={matches.map((m) => m.profile)} caption={(p) => `${p.age}`} />
            </section>
          )}
          {viewers.length > 0 && (
            <section>
              <SectionHeader title="Recently viewed you" subtitle={`${viewers.length} ${viewers.length === 1 ? 'visitor' : 'visitors'}`} />
              <PersonRow people={viewers} caption={(p) => (p.restricted ? p.religion : p.profession) ?? ''} />
            </section>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-x-10 gap-y-12">
        <section>
          <SectionHeader title="Interested in you"
            subtitle={interestedList.length ? `${interestedList.length} waiting for your reply` : undefined} />
          <div className="space-y-3">
            {intLoading
              ? [...Array(2)].map((_, i) => <SkeletonInterestCard key={i} />)
              : interestedList.length === 0
                ? <Empty>When someone sends you an interest, it will appear here.</Empty>
                : interestedList.map((match) => <InterestCard key={match.id} match={match} />)}
          </div>
        </section>

        <section>
          <SectionHeader title="Messages" to="/messages" linkLabel="Open inbox" />
          <div className="bg-white rounded-2xl border border-outline-variant/70 divide-y divide-outline-variant/60">
            {convLoading ? (
              <div className="p-5 space-y-4">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full shimmer" />
                    <div className="flex-1 space-y-2"><div className="h-3 w-24 rounded shimmer" /><div className="h-3 w-36 rounded shimmer" /></div>
                  </div>
                ))}
              </div>
            ) : convList.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-on-surface-variant">No conversations yet.</p>
            ) : (
              convList.slice(0, 5).map((conv) => (
                <Link key={conv.id} to={`/messages/${conv.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container-low transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                  <div className="relative flex-shrink-0">
                    <img src={conv.otherProfile?.photoUrl || AVATAR_PLACEHOLDER} onError={showPlaceholderOnError}
                      alt={conv.otherProfile?.firstName} className="w-11 h-11 rounded-full object-cover" loading="lazy" />
                    {conv.isOnline && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className={`text-[14px] truncate ${conv.unreadCount ? 'font-semibold text-on-surface' : 'font-medium text-on-surface'}`}>
                        {conv.otherProfile?.firstName}
                      </p>
                      <span className="text-[11px] text-on-surface-variant flex-shrink-0">{conv.lastMessageTime}</span>
                    </div>
                    <p className={`text-[13px] truncate ${conv.unreadCount ? 'text-on-surface' : 'text-on-surface-variant'}`}>{conv.lastMessage}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </motion.main>
  )
}
