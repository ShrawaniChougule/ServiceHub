import {
  Zap, Droplets, Hammer, Wind, Sparkles, PaintRoller,
  GraduationCap, Laptop, Smartphone, Car, type LucideIcon,
} from 'lucide-react';

export interface CategoryDef {
  name: string;
  slug: string;
  icon: LucideIcon;
  blurb: string;
  gradient: string;
}

export const CATEGORIES: CategoryDef[] = [
  { name: 'Electrician', slug: 'Electrician', icon: Zap, blurb: 'Wiring, switches & lighting', gradient: 'from-amber-400 to-orange-500' },
  { name: 'Plumber', slug: 'Plumber', icon: Droplets, blurb: 'Leaks, drains & fittings', gradient: 'from-sky-400 to-blue-500' },
  { name: 'Carpenter', slug: 'Carpenter', icon: Hammer, blurb: 'Furniture & doors', gradient: 'from-amber-600 to-yellow-700' },
  { name: 'AC Repair', slug: 'AC Repair', icon: Wind, blurb: 'Service & installation', gradient: 'from-cyan-400 to-teal-500' },
  { name: 'Cleaning', slug: 'Cleaning', icon: Sparkles, blurb: 'Deep & sofa cleaning', gradient: 'from-emerald-400 to-green-500' },
  { name: 'Painter', slug: 'Painter', icon: PaintRoller, blurb: 'Walls & waterproofing', gradient: 'from-rose-400 to-pink-500' },
  { name: 'Home Tutor', slug: 'Home Tutor', icon: GraduationCap, blurb: 'Math, science & exams', gradient: 'from-violet-400 to-indigo-500' },
  { name: 'Laptop Repair', slug: 'Laptop Repair', icon: Laptop, blurb: 'OS & hardware fixes', gradient: 'from-slate-500 to-slate-700' },
  { name: 'Mobile Repair', slug: 'Mobile Repair', icon: Smartphone, blurb: 'Screens & batteries', gradient: 'from-fuchsia-400 to-purple-500' },
  { name: 'Mechanic', slug: 'Mechanic', icon: Car, blurb: 'Bike & car servicing', gradient: 'from-red-400 to-rose-600' },
];

export function categoryIcon(name: string): LucideIcon {
  return CATEGORIES.find((c) => c.name === name)?.icon ?? Zap;
}

export function categoryGradient(name: string): string {
  return CATEGORIES.find((c) => c.name === name)?.gradient ?? 'from-brand-500 to-brand-700';
}

export const POPULAR_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Gurugram',
];
