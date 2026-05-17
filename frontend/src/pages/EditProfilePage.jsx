import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMyProfile } from '../hooks/useProfiles'
import { profileService } from '../services/profileService'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../services/api'

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Parsi', 'Jewish', 'No Religion', 'Other']
const LANGUAGES = ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Other']
const DIET_OPTIONS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Jain', 'Eggetarian']
const HOROSCOPE_OPTIONS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
const HEIGHT_OPTIONS = Array.from({ length: 21 }, (_, i) => {
  const totalIn = 57 + i
  const ft = Math.floor(totalIn / 12)
  const inch = totalIn % 12
  const cm = Math.round(totalIn * 2.54)
  return `${ft}'${inch}" (${cm}cm)`
})
const INTERESTS_OPTIONS = ['Reading', 'Cooking', 'Travel', 'Music', 'Photography', 'Fitness', 'Art', 'Technology', 'Fashion', 'Gaming', 'Dance', 'Writing', 'Sports', 'Movies', 'Nature']
const LIFESTYLE_OPTIONS = ['Yoga', 'Trekking', 'Early Bird', 'Night Owl', 'Travel Enthusiast', 'Foodie', 'Gym', 'Meditation', 'Cycling', 'Swimming']

const SELECT_CLS = 'w-full bg-white border-2 border-transparent focus:border-primary-container rounded-[18px] px-5 py-4 text-base font-medium text-on-surface shadow-card hover:shadow-card-hover transition-all outline-none appearance-none'
const INPUT_CLS = 'w-full bg-white border-2 border-transparent focus:border-primary-container rounded-[18px] px-5 py-4 text-base font-medium text-on-surface shadow-card hover:shadow-card-hover transition-all outline-none'

function Field({ label, icon, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-black text-on-surface flex items-center gap-2">
        {icon && <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  )
}

function TagToggle({ options, selected, onChange }) {
  const toggle = (tag) =>
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag])
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => (
        <button type="button" key={tag} onClick={() => toggle(tag)}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all active:scale-95 ${
            selected.includes(tag)
              ? 'bg-primary text-white shadow-btn-primary'
              : 'bg-white border-2 border-surface-variant text-on-surface-variant hover:border-primary/40 hover:bg-orange-50'
          }`}>
          {tag}
        </button>
      ))}
    </div>
  )
}

export default function EditProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useMyProfile()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState(null)

  useEffect(() => {
    if (profile && !form) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        profession: profile.profession ?? '',
        religion: profile.religion ?? '',
        caste: profile.caste ?? '',
        height: profile.height ?? '',
        motherTongue: profile.motherTongue ?? '',
        dietaryPreference: profile.dietaryPreference ?? '',
        horoscope: profile.horoscope ?? '',
        education: profile.education ?? '',
        bio: profile.bio ?? '',
        photoUrl: profile.photoUrl ?? '',
        photos: profile.photos ?? [],
        interests: profile.interests ?? [],
        lifestyle: profile.lifestyle ?? [],
        lookingForGender: profile.lookingForGender ?? '',
        ageMin: profile.ageMin ?? 22,
        ageMax: profile.ageMax ?? 35,
        partnerDescription: (profile.lookingFor ?? []).join('\n'),
      })
    }
  }, [profile, form])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return }
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    try {
      // No explicit Content-Type — the request interceptor detects FormData
      // and lets axios set multipart/form-data with the correct boundary.
      const { data } = await api.post('/upload/photo', fd)
      set('photoUrl', data.url)
      set('photos', [data.url, ...(form.photos ?? []).filter((u) => u !== form.photoUrl).slice(0, 4)])
      toast.success('Photo uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.firstName.trim()) { toast.error('First name is required'); return }
    setSaving(true)
    try {
      await profileService.update(profile.id, {
        ...form,
        partnerDescription: form.partnerDescription,
      })
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      toast.success('Profile updated!')
      navigate('/my-profile')
    } catch (e) {
      toast.error(e.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-32">
      <main className="max-w-[780px] mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-on-surface">Edit Profile</h1>
            <p className="text-sm text-on-surface-variant mt-1">Changes are saved immediately</p>
          </div>
          <button onClick={() => navigate('/my-profile')}
            className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">arrow_back</span> Back
          </button>
        </div>

        {/* Photo */}
        <div className="bg-white rounded-[28px] p-6 shadow-card border border-slate-100">
          <h3 className="text-lg font-black text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">photo_camera</span> Profile Photo
          </h3>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-orange-100 flex-shrink-0">
              {form.photoUrl
                ? <img src={form.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                  </div>
              }
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <label className="cursor-pointer flex flex-col gap-2">
              <span className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-orange-200 text-primary font-bold text-sm hover:bg-orange-50 transition-colors">
                <span className="material-symbols-outlined text-lg">upload</span>
                {uploading ? 'Uploading…' : 'Change Photo'}
              </span>
              <span className="text-xs text-on-surface-variant">JPG, PNG or WebP · max 10MB</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-[28px] p-6 shadow-card border border-slate-100 space-y-5">
          <h3 className="text-lg font-black text-on-surface">Basic Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" icon="person">
              <input className={INPUT_CLS} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="First name" />
            </Field>
            <Field label="Last Name">
              <input className={INPUT_CLS} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Last name" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City" icon="location_on">
              <input className={INPUT_CLS} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Mumbai" />
            </Field>
            <Field label="State">
              <input className={INPUT_CLS} value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="e.g. Maharashtra" />
            </Field>
          </div>
          <Field label="Profession" icon="work">
            <input className={INPUT_CLS} value={form.profession} onChange={(e) => set('profession', e.target.value)} placeholder="e.g. Software Engineer" />
          </Field>
          <Field label="Education" icon="school">
            <select className={SELECT_CLS} value={form.education} onChange={(e) => set('education', e.target.value)}>
              <option value="">Select education</option>
              <option>High School</option><option>Bachelors Degree</option>
              <option>Masters Degree</option><option>PhD / Doctorate</option>
            </select>
          </Field>
        </div>

        {/* Background */}
        <div className="bg-white rounded-[28px] p-6 shadow-card border border-slate-100 space-y-5">
          <h3 className="text-lg font-black text-on-surface">Background</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Religion" icon="church">
              <select className={SELECT_CLS} value={form.religion} onChange={(e) => set('religion', e.target.value)}>
                <option value="">Select religion</option>
                {RELIGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Caste">
              <input className={INPUT_CLS} value={form.caste} onChange={(e) => set('caste', e.target.value)} placeholder="e.g. Brahmin" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Height" icon="height">
              <select className={SELECT_CLS} value={form.height} onChange={(e) => set('height', e.target.value)}>
                <option value="">Select height</option>
                {HEIGHT_OPTIONS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </Field>
            <Field label="Mother Tongue" icon="translate">
              <select className={SELECT_CLS} value={form.motherTongue} onChange={(e) => set('motherTongue', e.target.value)}>
                <option value="">Select language</option>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dietary Preference" icon="restaurant">
              <select className={SELECT_CLS} value={form.dietaryPreference} onChange={(e) => set('dietaryPreference', e.target.value)}>
                <option value="">Select</option>
                {DIET_OPTIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Horoscope" icon="auto_awesome">
              <select className={SELECT_CLS} value={form.horoscope} onChange={(e) => set('horoscope', e.target.value)}>
                <option value="">Select sign</option>
                {HOROSCOPE_OPTIONS.map((h) => <option key={h}>{h}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-[28px] p-6 shadow-card border border-slate-100">
          <h3 className="text-lg font-black text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span> My Story
          </h3>
          <textarea rows={5} value={form.bio} onChange={(e) => set('bio', e.target.value)}
            placeholder="Tell potential partners about yourself…"
            className="w-full bg-surface border-2 border-transparent focus:border-primary-container rounded-[18px] px-5 py-4 text-base font-medium text-on-surface outline-none resize-none transition-all" />
        </div>

        {/* Interests */}
        <div className="bg-tertiary-fixed rounded-[28px] p-6">
          <h3 className="text-lg font-black text-on-tertiary-fixed mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">palette</span> Interests
          </h3>
          <TagToggle options={INTERESTS_OPTIONS} selected={form.interests} onChange={(v) => set('interests', v)} />
        </div>

        {/* Lifestyle */}
        <div className="bg-secondary-fixed rounded-[28px] p-6">
          <h3 className="text-lg font-black text-on-secondary-fixed-variant mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">fitness_center</span> Lifestyle
          </h3>
          <TagToggle options={LIFESTYLE_OPTIONS} selected={form.lifestyle} onChange={(v) => set('lifestyle', v)} />
        </div>

        {/* Partner Preferences */}
        <div className="bg-white rounded-[28px] p-6 shadow-card border border-slate-100 space-y-5">
          <h3 className="text-lg font-black text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary fill-icon">favorite</span> Partner Preferences
          </h3>
          <Field label="Looking for">
            <div className="grid grid-cols-2 gap-3">
              {[['Woman', 'female'], ['Man', 'male']].map(([label, icon]) => (
                <button type="button" key={label}
                  onClick={() => set('lookingForGender', label)}
                  className={`h-14 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    form.lookingForGender === label
                      ? 'border-primary bg-orange-50 text-primary'
                      : 'border-surface-variant text-on-surface-variant hover:border-primary/40'
                  }`}>
                  <span className="material-symbols-outlined">{icon}</span>{label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Age" icon="cake">
              <input type="number" className={INPUT_CLS} value={form.ageMin} min={18} max={80}
                onChange={(e) => set('ageMin', Number(e.target.value))} />
            </Field>
            <Field label="Max Age">
              <input type="number" className={INPUT_CLS} value={form.ageMax} min={18} max={80}
                onChange={(e) => set('ageMax', Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Ideal partner description" icon="edit">
            <textarea rows={3} value={form.partnerDescription}
              onChange={(e) => set('partnerDescription', e.target.value)}
              placeholder="What qualities matter most to you?"
              className="w-full bg-surface border-2 border-transparent focus:border-primary-container rounded-[18px] px-5 py-4 text-base font-medium text-on-surface outline-none resize-none transition-all" />
          </Field>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="w-full h-16 rounded-[24px] text-white font-black text-lg flex items-center justify-center gap-3 shadow-btn-primary hover:shadow-btn-primary-hover active:scale-[0.98] transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #ae3115 0%, #ff6b4a 100%)' }}>
          {saving
            ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><span className="material-symbols-outlined fill-icon">save</span>Save Changes</>
          }
        </button>
      </main>
    </motion.div>
  )
}
