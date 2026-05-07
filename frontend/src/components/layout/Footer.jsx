import { Link } from 'react-router-dom'

const footerLinks = [
  { label: 'Privacy Policy', to: '/' },
  { label: 'Terms of Service', to: '/' },
  { label: 'Safety Guide', to: '/' },
  { label: 'Success Stories', to: '/' },
  { label: 'Contact Us', to: '/' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto pb-20 md:pb-0">
      <div className="max-w-[1280px] mx-auto py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-xl font-black tracking-tighter text-orange-600">SoulSync</span>
          <p className="text-sm text-slate-500">© 2024 SoulSync Matrimony. Crafted for Connection.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
          {footerLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-sm text-slate-500 hover:text-orange-500 transition-colors duration-200"
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
