import { type ReactNode } from 'react';
import { classNames, initials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={classNames('rounded-full object-cover ring-2 ring-white shadow-soft', sizes[size], className)}
      />
    );
  }
  return (
    <div
      className={classNames(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-bold text-white ring-2 ring-white shadow-soft',
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </div>
  );
}

export function Badge({
  children,
  color = 'slate',
  className,
}: {
  children: ReactNode;
  color?: 'slate' | 'blue' | 'green' | 'amber' | 'rose' | 'indigo' | 'sky';
  className?: string;
}) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-brand-100 text-brand-800',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    sky: 'bg-sky-100 text-sky-700',
  };
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <h3 className="text-lg font-bold text-brand-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={classNames(
        'inline-block animate-spin rounded-full border-2 border-brand-200 border-t-brand-700',
        className ?? 'h-6 w-6',
      )}
    />
  );
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={classNames('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <span className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-brand-900 sm:text-4xl text-balance">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-lg text-slate-500 text-balance">{subtitle}</p>}
    </div>
  );
}
