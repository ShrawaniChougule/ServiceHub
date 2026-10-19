import { Star } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, size = 20, readOnly }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={classNames(
            'transition-transform',
            !readOnly && 'hover:scale-110 cursor-pointer',
            readOnly && 'cursor-default',
          )}
        >
          <Star
            style={{ width: size, height: size }}
            className={classNames(
              star <= Math.round(value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200',
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function RatingBadge({ value, count, size = 'sm' }: { value: number; count?: number; size?: 'sm' | 'md' }) {
  const txt = size === 'sm' ? 'text-xs' : 'text-sm';
  if (!value || value === 0) {
    return <span className={classNames('font-semibold text-slate-400', txt)}>New</span>;
  }
  return (
    <span className={classNames('inline-flex items-center gap-1 font-semibold text-amber-600', txt)}>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      {value.toFixed(1)}
      {count !== undefined && <span className="font-normal text-slate-400">({count})</span>}
    </span>
  );
}
