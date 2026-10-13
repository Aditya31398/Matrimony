import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTenant } from '../../context/TenantContext'

export default function Footer() {
  const { t } = useTranslation()
  const { name, tagline } = useTenant()

  const footerLinks = [
    { label: t('footer.privacy'), to: '/' },
    { label: t('footer.terms'), to: '/' },
    { label: t('footer.safety'), to: '/' },
    { label: t('footer.stories'), to: '/' },
    { label: t('footer.contact'), to: '/' },
  ]

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/70 mt-auto pb-20 md:pb-0">
      <div className="max-w-[1280px] mx-auto py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-display text-2xl font-bold text-primary">{name}</span>
          <p className="text-sm text-slate-500">
            {t('footer.tagline', { name, tagline, year: new Date().getFullYear() })}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {footerLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-sm text-slate-500 hover:text-primary transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <button className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">language</span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">share</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
