import { Link } from '@/lib/router';
import { CATEGORIES } from '@/lib/categories';
import { Wrench, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brand-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:pr-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-700">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Service<span className="text-accent-400">Hub</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Your trusted marketplace for local home and personal services. Verified professionals,
              fair pricing, and a seamless booking experience.
            </p>
            <div className="mt-5 flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#/"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-300 transition-colors hover:bg-accent-500 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Categories</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link to={`/services?category=${c.slug}`} className="text-slate-400 transition-colors hover:text-accent-400">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/about" className="text-slate-400 hover:text-accent-400">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-accent-400">Contact</Link></li>
              <li><Link to="/how-it-works" className="text-slate-400 hover:text-accent-400">How it Works</Link></li>
              <li><Link to="/signup" className="text-slate-400 hover:text-accent-400">Become a Provider</Link></li>
              <li><Link to="/privacy" className="text-slate-400 hover:text-accent-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-accent-400">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-accent-400" />
                <span className="text-slate-400">support@servicehub.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-accent-400" />
                <span className="text-slate-400">+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-accent-400" />
                <span className="text-slate-400">123 WorkStreet, Bengaluru, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} ServiceHub. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with care for local professionals
          </p>
        </div>
      </div>
    </footer>
  );
}
