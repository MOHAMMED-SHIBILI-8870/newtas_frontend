import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, MapPinned, Phone } from 'lucide-react'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Packages', to: '/packages' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
]

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_0.9fr_0.8fr]">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-3 rounded-3xl bg-white/5 px-4 py-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-sm font-black">
              TA
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">TravelAI</p>
              <p className="text-sm text-slate-300">Plan, book, and approve trips with clarity.</p>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-300">
            A professional travel platform with public trip browsing, user bookings, admin approvals, and AI-powered
            itinerary generation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Explore packages <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">Navigation</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {footerLinks.map((link) => (
              <li key={link.to}>
                <Link className="transition hover:text-cyan-200" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">Contact</p>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <MapPinned className="mt-0.5 h-4 w-4 text-cyan-200" />
              <span>Kerala, India</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-cyan-200" />
              <span>support@travelai.local</span>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-cyan-200" />
              <span>+91 98765 43210</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>(c) {new Date().getFullYear()} TravelAI. All rights reserved.</p>
        <p>Built for public browsing, user bookings, and admin approvals.</p>
      </div>
    </footer>
  )
}

export default Footer
