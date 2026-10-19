export type Role = 'customer' | 'provider' | 'admin';

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  avatar_url: string;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  slug: string;
  description: string;
  price_from: number;
  icon_name: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface Provider {
  id: string;
  bio: string;
  profile_photo_url: string;
  id_proof_url: string;
  skills: string[];
  service_areas: string[];
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  rating_count: number;
  jobs_completed: number;
  created_at: string;
  updated_at: string;
  // joined fields
  profile?: Profile;
}

export interface ProviderService {
  id: string;
  provider_id: string;
  service_id: string;
  custom_price: number | null;
  service?: Service;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  address: string;
  city: string;
  scheduled_date: string;
  scheduled_time: string;
  notes: string;
  status: BookingStatus;
  price: number;
  created_at: string;
  updated_at: string;
  // joined
  service?: Service;
  provider?: Provider;
  customer?: Profile;
  review?: Review;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer?: Profile;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}
