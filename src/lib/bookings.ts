import { supabase } from './supabase';
import type { BookingStatus } from './types';

export const STATUS_FLOW: Record<BookingStatus, BookingStatus[]> = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
  rejected: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return STATUS_FLOW[from]?.includes(to) ?? false;
}

export const STATUS_META: Record<BookingStatus, { label: string; color: string; dot: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  accepted: { label: 'Accepted', color: 'bg-sky-100 text-sky-700', dot: 'bg-sky-500' },
  in_progress: { label: 'In Progress', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  rejected: { label: 'Rejected', color: 'bg-slate-200 text-slate-600', dot: 'bg-slate-400' },
};

export async function createNotification(
  userId: string,
  title: string,
  body: string,
  type: string = 'info',
  relatedId?: string,
) {
  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    body,
    type,
    related_id: relatedId ?? null,
  });
}
