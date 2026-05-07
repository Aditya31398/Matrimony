import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegisterProfile } from '../hooks/useProfiles'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const TOTAL_STEPS = 5

const STEP_META = [
  { label: 'The Journey Begins', title: 'Tell us about yourself', subtitle: 'Let\'s start your story. We\'ll use these details to help you find someone who truly resonates with your soul.' },
  { label: 'Your World', title: 'Where do you call home?', subtitle: 'Help us connect you with people who share your world and your surroundings.' },
  { label: 'Your Photos', title: 'Show your true self', subtitle: 'Add at least 1 photo so matches can see the real you. You can add up to 5 photos.' },
  { label: 'Your Soul', title: 'What makes you, you?', subtitle: 'Share your passions and your dreams. The real you is the most attractive version of you.' },
  { label: 'Your Heart', title: 'What are you looking for?', subtitle: 'Knowing what you seek helps us find your perfect complement.' },
]

const INTERESTS_OPTIONS = ['Yoga', 'Travel', 'Music', 'Reading', 'Cooking', 'Tech', 'Hiking', 'Art', 'Photography', 'Movies', 'Dancing', 'Sports']
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Jewish', 'Other']
const LANGUAGES = ['Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Urdu', 'English', 'Other']
const DIET_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Eggetarian', 'Occasionally Non-Veg']
const HOROSCOPE_OPTIONS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
const HEIGHT_OPTIONS = [
  `4'9" (145cm)`, `4'10" (147cm)`, `4'11" (150cm)`,
  `5'0" (152cm)`, `5'1" (155cm)`, `5'2" (157cm)`, `5'3" (160cm)`, `5'4" (163cm)`,
  `5'5" (165cm)`, `5'6" (168cm)`, `5'7" (170cm)`, `5'8" (173cm)`, `5'9" (175cm)`,
  `5'10" (178cm)`, `5'11" (180cm)`, `6'0" (183cm)`, `6'1" (185cm)`, `6'2" (188cm)`,
  `6'3" (191cm)`, `6'4" (193cm)`, `6'5" (196cm)`,
]
const SELECT_CLS = 'w-full bg-white border-2 border-transparent focus:border-primary-container rounded-[24px] px-7 py-5 text-lg font-medium text-on-surface shadow-card hover:shadow-card-hover transition-all outline-none'

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: (dir) => ({ x: dir < 0 ? 80 : -80, opacity: 0, transition: { duration: 0.25 } }),
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useRegisterProfile()
  const [step, setStep] = useState(1)
  const [registeredEmail, setRegisteredEmail] = useState(null)
  const [dir, setDir] = useState(1)
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: '', dateOfBirth: '',
    email: '', password: '',
    city: '', state: '', religion: '', caste: '', education: '', profession: '',
    height: '', motherTongue: '', dietaryPreference: '', horoscope: '',
    photos: [],
    interests: [], bio: '',
    lookingForGender: '', ageMin: 22, ageMax: 35, partnerDescription: '',
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const toggleInterest = (tag) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(tag)
        ? f.interests.filter((t) => t !== tag)
        : [...f.interests, tag],
    }))

  const goBack = () => { setDir(-1); setStep((s) => Math.max(s - 1, 1)) }

  const validateStep = () => {
    if (step === 1) {
      if (!form.firstName.trim()) { toast.error('Please enter your first name'); return false }
      if (!form.gender) { toast.error('Please select your gender'); return false }
      if (!form.dateOfBirth) { toast.error('Please enter your date of birth'); return false }
      if (!form.email.trim()) { toast.error('Please enter your email'); return false }
      if (!form.password || form.password.length < 6) { toast.error('Password must be at least 6 characters'); return false }
    }
    if (step === 2 && !form.city.trim()) { toast.error('Please enter your city'); return false }
    if (step === 3 && form.photos.length === 0) { toast.error('Please add at least 1 photo'); return false }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setDir(1)
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    try {
      await register.mutateAsync(form)
      setRegisteredEmail(form.email)
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.')
    }
  }

  const meta = STEP_META[step - 1]

  if (registeredEmail) {
    return <OtpScreen email={registeredEmail} />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex items-center justify-center py-16 px-6 relative overflow-hidden"
    >
      <div className="fixed top-0 right-0 h-screen w-1/3 z-0 overflow-hidden hidden lg:block pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-gradient-to-bl from-primary-fixed to-surface rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="max-w-[640px] w-full relative z-10">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-3 px-1">
            <span className="text-sm font-bold text-primary">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-sm font-medium text-on-surface-variant italic">{meta.label}</span>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #ae3115, #ff928b)' }}
              initial={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Header */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={`header-${step}`} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
            className="mb-10 text-center md:text-left">
            <h1 className="text-display-xl font-black text-on-surface mb-3">{meta.title}</h1>
            <p className="text-body-lg text-on-surface-variant max-w-md leading-relaxed">{meta.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {/* Form steps */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.form key={`form-${step}`} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
            onSubmit={(e) => { e.preventDefault(); step < TOTAL_STEPS ? handleNext() : handleSubmit() }}
            className="space-y-8">

            {step === 1 && (
              <>
                <Field label="What should we call you?" icon="person">
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput placeholder="First name" value={form.firstName} onChange={(v) => set('firstName', v)} />
                    <FormInput placeholder="Last name" value={form.lastName} onChange={(v) => set('lastName', v)} />
                  </div>
                </Field>
                <Field label="I identify as…">
                  <div className="grid grid-cols-3 gap-4">
                    {[['female', 'Woman'], ['male', 'Man'], ['transgender', 'Non-binary']].map(([icon, label]) => (
                      <RadioCard key={label} icon={icon} label={label} selected={form.gender === label} onClick={() => {
                        set('gender', label)
                        if (label === 'Man') set('lookingForGender', 'Woman')
                        else if (label === 'Woman') set('lookingForGender', 'Man')
                      }} />
                    ))}
                  </div>
                </Field>
                <Field label="When were you born?" icon="calendar_month">
                  <FormInput type="date" value={form.dateOfBirth} onChange={(v) => set('dateOfBirth', v)} />
                  <p className="text-xs font-semibold text-on-surface-variant mt-2 px-1">You must be 18 or older to join SoulSync.</p>
                </Field>
                <Field label="Your email address" icon="email">
                  <FormInput type="email" placeholder="you@example.com" value={form.email} onChange={(v) => set('email', v)} />
                </Field>
                <Field label="Create a password" icon="lock">
                  <FormInput type="password" placeholder="Min. 6 characters" value={form.password} onChange={(v) => set('password', v)} />
                </Field>
              </>
            )}

            {step === 2 && (
              <>
                <Field label="Which city do you live in?" icon="location_on">
                  <FormInput placeholder="e.g. Mumbai" value={form.city} onChange={(v) => set('city', v)} />
                </Field>
                <Field label="Your profession" icon="work">
                  <FormInput placeholder="e.g. Software Engineer" value={form.profession} onChange={(v) => set('profession', v)} />
                </Field>
                <Field label="Highest education" icon="school">
                  <select value={form.education} onChange={(e) => set('education', e.target.value)}
                    className={SELECT_CLS}>
                    <option value="">Select education</option>
                    <option>High School</option>
                    <option>Bachelors Degree</option>
                    <option>Masters Degree</option>
                    <option>PhD / Doctorate</option>
                  </select>
                </Field>
                <Field label="Religion" icon="church">
                  <select value={form.religion} onChange={(e) => set('religion', e.target.value)}
                    className={SELECT_CLS}>
                    <option value="">Select religion</option>
                    {RELIGIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Caste" icon="diversity_3">
                  <FormInput placeholder="e.g. Brahmin, Kshatriya…" value={form.caste} onChange={(v) => set('caste', v)} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Height" icon="height">
                    <select value={form.height} onChange={(e) => set('height', e.target.value)}
                      className={SELECT_CLS}>
                      <option value="">Select height</option>
                      {HEIGHT_OPTIONS.map((h) => <option key={h}>{h}</option>)}
                    </select>
                  </Field>
                  <Field label="Mother Tongue" icon="translate">
                    <select value={form.motherTongue} onChange={(e) => set('motherTongue', e.target.value)}
                      className={SELECT_CLS}>
                      <option value="">Select language</option>
                      {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Dietary Preference" icon="restaurant">
                    <select value={form.dietaryPreference} onChange={(e) => set('dietaryPreference', e.target.value)}
                      className={SELECT_CLS}>
                      <option value="">Select</option>
                      {DIET_OPTIONS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Horoscope" icon="auto_awesome">
                    <select value={form.horoscope} onChange={(e) => set('horoscope', e.target.value)}
                      className={SELECT_CLS}>
                      <option value="">Select sign</option>
                      {HOROSCOPE_OPTIONS.map((h) => <option key={h}>{h}</option>)}
                    </select>
                  </Field>
                </div>
              </>
            )}

            {step === 3 && (
              <PhotoUploadStep
                photos={form.photos}
                onChange={(photos) => set('photos', photos)}
              />
            )}

            {step === 4 && (
              <>
                <Field label="Select your interests (pick any)">
                  <div className="flex flex-wrap gap-3">
                    {INTERESTS_OPTIONS.map((tag) => (
                      <button type="button" key={tag} onClick={() => toggleInterest(tag)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                          form.interests.includes(tag)
                            ? 'bg-primary text-white shadow-btn-primary'
                            : 'bg-white border-2 border-surface-variant text-on-surface-variant hover:border-primary/40 hover:bg-orange-50'
                        }`}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Write your story (bio)" icon="auto_awesome">
                  <textarea rows={5} placeholder="Tell potential partners a little about yourself…"
                    value={form.bio} onChange={(e) => set('bio', e.target.value)}
                    className="w-full bg-white border-2 border-transparent focus:border-primary-container rounded-[24px] px-7 py-5 text-base font-medium text-on-surface shadow-card hover:shadow-card-hover transition-all outline-none resize-none" />
                </Field>
              </>
            )}

            {step === 5 && (
              <>
                <Field label="I'm looking for a">
                  <div className="grid grid-cols-2 gap-4">
                    {[['female', 'Woman'], ['male', 'Man']].map(([icon, label]) => (
                      <RadioCard key={label} icon={icon} label={label} selected={form.lookingForGender === label} onClick={() => set('lookingForGender', label)} />
                    ))}
                  </div>
                </Field>
                <Field label={`Preferred age range: ${form.ageMin} – ${form.ageMax}`} icon="cake">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 ml-1 block mb-1">From</label>
                      <FormInput type="number" value={form.ageMin} onChange={(v) => set('ageMin', v)} />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 ml-1 block mb-1">To</label>
                      <FormInput type="number" value={form.ageMax} onChange={(v) => set('ageMax', v)} />
                    </div>
                  </div>
                </Field>
                <Field label="Describe your ideal partner" icon="favorite">
                  <textarea rows={4} placeholder="What qualities matter most to you in a life partner?"
                    value={form.partnerDescription} onChange={(e) => set('partnerDescription', e.target.value)}
                    className="w-full bg-white border-2 border-transparent focus:border-primary-container rounded-[24px] px-7 py-5 text-base font-medium text-on-surface shadow-card hover:shadow-card-hover transition-all outline-none resize-none" />
                </Field>
              </>
            )}

            {/* Navigation */}
            <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-5">
              {step > 1 ? (
                <button type="button" onClick={goBack}
                  className="order-2 md:order-1 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  Back
                </button>
              ) : (
                <p className="order-2 md:order-1 text-sm text-on-surface-variant">
                  Already a member?{' '}
                  <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              )}
              <button type="submit" disabled={register.isPending}
                className="order-1 md:order-2 w-full md:w-64 font-bold text-lg py-4 px-8 rounded-[24px] text-white shadow-btn-primary hover:shadow-btn-primary-hover hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #ff6b4a, #ff928b)' }}>
                {register.isPending ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === TOTAL_STEPS ? 'Create My Profile' : 'Continue'}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function PhotoUploadStep({ photos, onChange }) {
  const [uploading, setUploading] = useState({}) // index → true while uploading

  const handleFiles = async (files) => {
    const remaining = 5 - photos.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (toUpload.length === 0) return

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i]
      const idx = photos.length + i
      setUploading((u) => ({ ...u, [idx]: true }))

      try {
        const data = new FormData()
        data.append('file', file)
        const res = await import('../services/api').then(({ default: api }) =>
          api.post('/upload/photo', data, { headers: { 'Content-Type': 'multipart/form-data' } })
        )
        onChange([...photos, res.data.url].slice(0, 5))
      } catch (err) {
        toast.error(err.message || 'Upload failed')
      } finally {
        setUploading((u) => { const n = { ...u }; delete n[idx]; return n })
      }
    }
  }

  const remove = (i) => onChange(photos.filter((_, j) => j !== i))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-[20px] overflow-hidden group shadow-card">
            <img src={url} alt="" className="w-full h-full object-cover" />
            {i === 0 && (
              <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                PRIMARY
              </div>
            )}
            <button type="button" onClick={() => remove(i)}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}

        {Object.keys(uploading).map((k) => (
          <div key={'u' + k} className="aspect-square rounded-[20px] bg-surface-container flex items-center justify-center">
            <span className="w-8 h-8 border-3 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ))}

        {photos.length + Object.keys(uploading).length < 5 && (
          <label className={`aspect-square rounded-[20px] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all border-2 border-dashed
            ${photos.length === 0 ? 'border-primary bg-orange-50 hover:bg-orange-100' : 'border-surface-variant bg-white hover:bg-surface-container'}`}>
            <span className={`material-symbols-outlined text-3xl ${photos.length === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
              add_photo_alternate
            </span>
            <span className={`text-xs font-bold ${photos.length === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
              {photos.length === 0 ? 'Add photo*' : 'Add more'}
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only"
              onChange={(e) => handleFiles(e.target.files)} />
          </label>
        )}
      </div>

      <p className="text-xs text-on-surface-variant text-center">
        {photos.length === 0
          ? 'At least 1 photo is required · Max 5 · JPEG / PNG / WebP · 5 MB each'
          : `${photos.length} of 5 photos added · First photo is your primary photo`}
      </p>
    </div>
  )
}

function OtpScreen({ email }) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // countdown for resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleVerify = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      await import('../services/api').then(({ default: api }) =>
        api.post('/auth/verify-otp', { email, otp })
      )
      toast.success('Email verified! Signing you in…')
      // auto-login after verification — password not available here so redirect to login
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Incorrect or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await import('../services/api').then(({ default: api }) =>
        api.post('/auth/resend-otp', { email })
      )
      toast.success('New code sent!')
      setOtp('')
      setCooldown(60)
    } catch (err) {
      toast.error(err.message || 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">mark_email_unread</span>
        </motion.div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-on-surface mb-2">Verify your email</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            We sent a 6-digit code to<br />
            <span className="font-bold text-on-surface">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-3xl font-black tracking-[0.5em] bg-white border-2 border-transparent focus:border-primary-container rounded-[24px] px-7 py-5 text-on-surface shadow-card outline-none transition-all placeholder:text-surface-variant placeholder:tracking-[0.3em]"
            autoFocus
          />

          <button type="submit" disabled={loading || otp.length !== 6}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 shadow-btn-primary hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #ae3115, #ff6b4a)' }}>
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Verify & Continue'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button onClick={handleResend} disabled={resending || cooldown > 0}
            className="text-sm font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline">
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
          </button>
          <p className="text-xs text-on-surface-variant">Code expires in 10 minutes · Check spam if not received</p>
        </div>
      </div>
    </motion.div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-3">
      <label className="text-xl font-black text-on-surface block">{label}</label>
      {children}
    </div>
  )
}

function FormInput({ type = 'text', placeholder, value, onChange }) {
  return (
    <input type={type} placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white border-2 border-transparent focus:border-primary-container rounded-[24px] px-7 py-5 text-lg font-medium text-on-surface shadow-card hover:shadow-card-hover transition-all outline-none placeholder:text-surface-variant"
    />
  )
}

function RadioCard({ icon, label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`relative cursor-pointer w-full bg-white border-2 rounded-[20px] p-5 flex flex-col items-center gap-3 shadow-card transition-all active:scale-95 ${
        selected ? 'border-primary-container bg-primary-fixed' : 'border-transparent hover:border-primary-container/30'
      }`}>
      <span className={`material-symbols-outlined text-4xl transition-colors ${selected ? 'text-primary' : 'text-on-surface-variant'}`}>{icon}</span>
      <span className="text-sm font-bold text-on-surface">{label}</span>
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
        </div>
      )}
    </button>
  )
}
