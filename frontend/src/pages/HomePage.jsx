import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StarRating from '../components/ui/StarRating'
import { useStories } from '../hooks/useStories'
import { SkeletonStoryCard } from '../components/ui/SkeletonCard'

const HERO_IMG =
  'https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=1400&q=85'

const HOW_IT_WORKS = [
  {
    icon: 'person_add',
    bg: 'bg-primary-container',
    title: 'Create Profile',
    desc: 'Tell us your story, your values, and your dreams. Our profile builder focuses on the essence of who you are.',
  },
  {
    icon: 'favorite',
    bg: 'bg-secondary-container',
    title: 'Discover Matches',
    desc: 'Browse through curated profiles that align with your lifestyle. No algorithms, just human-centric discovery.',
  },
  {
    icon: 'chat_bubble',
    bg: 'bg-tertiary-container',
    title: 'Start Connecting',
    desc: 'Break the ice with our guided conversation starters. Secure and thoughtful communication made easy.',
  },
]

const STATS = [
  { value: '2M+', label: 'Verified Profiles' },
  { value: '50K+', label: 'Successful Matches' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '12+', label: 'Years of Trust' },
]

const FALLBACK_STORIES = [
  {
    id: 1,
    coupleNames: 'Ananya & Rohan',
    matchedDate: 'June 2023',
    story: '"We found each other through the Values First search. It wasn\'t about data points; it was about the soul connection we felt from the first message."',
    photoUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
    rating: 5,
  },
  {
    id: 2,
    coupleNames: 'Priya & Arjun',
    matchedDate: 'October 2023',
    story: '"SoulSync\'s personality tags made all the difference. We realized we shared a love for quiet mornings and sustainable living before even meeting."',
    photoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
    rating: 5,
  },
  {
    id: 3,
    coupleNames: 'Kavita & Sameer',
    matchedDate: 'January 2024',
    story: '"The verification process gave me so much peace of mind. It was refreshing to be on a platform that actually prioritizes safety and sincerity."',
    photoUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80',
    rating: 5,
  },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

export default function HomePage() {
  const navigate = useNavigate()
  const [gender, setGender] = useState('Man')
  const [lookingFor, setLookingFor] = useState('Woman')
  const [ageMin, setAgeMin] = useState(24)
  const [ageMax, setAgeMax] = useState(32)
  const { data: stories, isLoading } = useStories()
  const displayStories = stories?.length ? stories.slice(0, 3) : FALLBACK_STORIES

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/discover?gender=${gender}&lookingFor=${lookingFor}&ageMin=${ageMin}&ageMax=${ageMax}`)
  }

  return (
    <main className="flex-1">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-8">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMG} alt="Couple" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/20" />
        </div>

        {/* Decorative blobs */}
        <div className="blob w-72 h-72 bg-primary-container top-20 left-10 animation-delay-2000" />
        <div className="blob w-96 h-96 bg-tertiary-fixed bottom-10 right-20 animation-delay-4000" />

        <div className="relative z-10 page-container w-full py-20">
          <motion.div
            className="max-w-2xl"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.span variants={fadeUp} className="inline-block text-primary font-bold tracking-widest uppercase text-xs mb-5">
              Premium Matrimony
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="text-[52px] md:text-[68px] font-black leading-[1.05] tracking-tight text-on-surface mb-6"
            >
              Your Journey to{' '}
              <span className="text-gradient">Forever</span>{' '}
              Starts Here.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
              Experience digital hospitality in your search for a life partner. We move beyond
              transactions to celebrate the joy of real connection.
            </motion.p>

            {/* Search card */}
            <motion.div
              variants={fadeUp}
              className="bg-white/90 backdrop-blur-xl p-7 rounded-[32px] shadow-2xl border border-orange-100/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">I am a</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 text-on-surface font-medium transition-all"
                  >
                    <option>Man</option>
                    <option>Woman</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Looking for a</label>
                  <select
                    value={lookingFor}
                    onChange={(e) => setLookingFor(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-primary/30 text-on-surface font-medium transition-all"
                  >
                    <option>Woman</option>
                    <option>Man</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-500 ml-1">Aged</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={ageMin}
                      onChange={(e) => setAgeMin(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-2xl px-3 py-3.5 focus:ring-2 focus:ring-primary/30 font-medium text-on-surface transition-all"
                    />
                    <span className="text-slate-400 font-medium flex-shrink-0">to</span>
                    <input
                      type="number"
                      value={ageMax}
                      onChange={(e) => setAgeMax(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-2xl px-3 py-3.5 focus:ring-2 focus:ring-primary/30 font-medium text-on-surface transition-all"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-bold text-lg py-4 rounded-2xl shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">search</span>
                Find My Soulmate
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-orange-50">
        <div className="page-container py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-black text-gradient mb-1">{value}</div>
              <div className="text-sm text-on-surface-variant font-medium">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="section-padding bg-surface-container-lowest">
        <div className="page-container">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">Simple Process</span>
            <h2 className="text-headline-lg text-on-surface font-black mb-4">How SoulSync Works</h2>
            <p className="text-on-surface-variant max-w-md mx-auto">Three simple steps to your beautiful beginning.</p>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {HOW_IT_WORKS.map(({ icon, bg, title, desc }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="group relative p-8 rounded-32 bg-surface-container border border-slate-100 hover:bg-orange-50/60 hover:border-orange-100 transition-all duration-500 cursor-pointer"
              >
                <div className="absolute top-6 right-8 text-6xl font-black text-slate-100 group-hover:text-orange-100 transition-colors select-none">
                  0{i + 1}
                </div>
                <div className={`w-16 h-16 ${bg} text-white rounded-2xl flex items-center justify-center mb-7 shadow-inner`}>
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={icon === 'favorite' ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Success Stories ───────────────────────────────────────────── */}
      <section className="section-padding bg-surface overflow-hidden">
        <div className="page-container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
            <div>
              <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">Our Wall of Joy</span>
              <h2 className="text-headline-lg text-on-surface font-black">SoulSync Success Stories</h2>
            </div>
            <button className="flex-shrink-0 bg-white border-2 border-orange-100 text-orange-600 px-7 py-3 rounded-full font-bold hover:bg-orange-50 transition-colors flex items-center gap-2 group">
              View All Stories
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? [1, 2, 3].map((k) => <SkeletonStoryCard key={k} />)
              : displayStories.map((story, i) => (
                  <motion.div
                    key={story.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6 }}
                    className="bg-white rounded-[24px] overflow-hidden shadow-card hover:shadow-card-hover transition-all group"
                  >
                    <div className="h-[280px] overflow-hidden">
                      <img
                        src={story.photoUrl}
                        alt={story.coupleNames}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-7">
                      <StarRating rating={story.rating ?? 5} />
                      <p className="text-on-surface-variant italic mt-4 mb-5 leading-relaxed text-[15px]">
                        {story.story}
                      </p>
                      <div className="border-t border-slate-50 pt-5">
                        <h4 className="font-bold text-on-surface">{story.coupleNames}</h4>
                        <p className="text-slate-400 text-sm mt-0.5">Matched {story.matchedDate}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="section-padding px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-gradient-to-br from-primary via-[#c94020] to-primary-container text-white rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />
          <h2 className="text-display-xl font-black mb-7 relative z-10 leading-tight">
            Ready to find your <br className="hidden md:block" /> perfect harmony?
          </h2>
          <p className="text-lg mb-12 opacity-90 relative z-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of others who have found their life partners through our mindful approach to matrimony.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center relative z-10">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="bg-white text-primary font-bold px-10 py-4 rounded-2xl hover:shadow-2xl transition-all"
            >
              Get Started Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-transparent border-2 border-white/30 text-white font-bold px-10 py-4 rounded-2xl hover:bg-white/10 transition-all"
            >
              Talk to a Consultant
            </motion.button>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
