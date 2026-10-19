/*
# ServiceHub — Initial schema

## Overview
Creates the full data model for a local-service marketplace with three
personas (customer, provider, admin) on top of Supabase Auth. Services are
catalogue rows seeded for ten categories. Customers book services with
providers; providers accept/reject and progress the booking; customers leave
reviews; admin verifies providers and manages the platform.

## Tables created
1. `profiles` — per-user metadata linked 1:1 to auth.users. `role` is
   `customer` | `provider` | `admin`. `is_blocked` lets admins ban users.
2. `services` — service catalogue (one row per category / offering). Seeded.
3. `providers` — provider-specific profile: bio, photo, id proof url, skills,
   service areas, verification state, rating aggregates.
4. `provider_services` — many-to-many: which services a provider offers.
5. `bookings` — a customer booking for a service+provider on a date/time.
   Status: pending | accepted | in_progress | completed | cancelled | rejected.
6. `reviews` — a customer review for a completed booking.
7. `payments` — payment record for a booking.
8. `notifications` — in-app notifications addressed to a user.

## Relationships
- profiles.id ← auth.users.id (ON DELETE CASCADE)
- providers.id ← profiles.id
- provider_services.provider_id → providers.id; service_id → services.id
- bookings.customer_id → profiles.id; provider_id → providers.id; service_id → services.id
- reviews.booking_id → bookings.id; customer_id → profiles.id; provider_id → providers.id
- payments.booking_id → bookings.id
- notifications.user_id → profiles.id

## Security (RLS)
- profiles: users read+update own row; admins read all.
- services: public read (catalogue), admin write.
- providers: public read; owner insert/update; admin update (verify/block).
- provider_services: public read; owner insert/delete; admin delete.
- bookings: customer & provider of the booking can read; both can update
  within allowed transitions; customer inserts; admin reads all.
- reviews: public read; the booking customer inserts once; admin can delete.
- payments: customer & provider of the booking read; admin read all.
- notifications: owner reads/updates/deletes; admin none needed.

## Notes
- Owner columns default to auth.uid() so inserts that omit the owner succeed.
- `provider_id` on bookings/reviews references providers.id but we store the
  customer_id as a profiles.id so RLS can compare auth.uid() directly.
*/

-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','provider','admin')),
  avatar_url text DEFAULT '',
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================
-- services
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_from numeric(10,2) NOT NULL DEFAULT 0,
  icon_name text NOT NULL DEFAULT 'Wrench',
  image_url text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_public" ON services;
CREATE POLICY "services_select_public"
ON services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "services_insert_admin" ON services;
CREATE POLICY "services_insert_admin"
ON services FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "services_update_admin" ON services;
CREATE POLICY "services_update_admin"
ON services FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "services_delete_admin" ON services;
CREATE POLICY "services_delete_admin"
ON services FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- providers
-- ============================================================
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  bio text NOT NULL DEFAULT '',
  profile_photo_url text DEFAULT '',
  id_proof_url text DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  service_areas text[] NOT NULL DEFAULT '{}',
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  jobs_completed int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "providers_select_public" ON providers;
CREATE POLICY "providers_select_public"
ON providers FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "providers_insert_own" ON providers;
CREATE POLICY "providers_insert_own"
ON providers FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "providers_update_own_or_admin" ON providers;
CREATE POLICY "providers_update_own_or_admin"
ON providers FOR UPDATE TO authenticated
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- provider_services
-- ============================================================
CREATE TABLE IF NOT EXISTS provider_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  custom_price numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_id, service_id)
);

ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "provider_services_select_public" ON provider_services;
CREATE POLICY "provider_services_select_public"
ON provider_services FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "provider_services_insert_own" ON provider_services;
CREATE POLICY "provider_services_insert_own"
ON provider_services FOR INSERT TO authenticated
WITH CHECK (auth.uid() = provider_id);

DROP POLICY IF EXISTS "provider_services_delete_own" ON provider_services;
CREATE POLICY "provider_services_delete_own"
ON provider_services FOR DELETE TO authenticated
USING (auth.uid() = provider_id);

-- ============================================================
-- bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  scheduled_date date NOT NULL,
  scheduled_time text NOT NULL,
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','in_progress','completed','cancelled','rejected')),
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_participants_or_admin" ON bookings;
CREATE POLICY "bookings_select_participants_or_admin"
ON bookings FOR SELECT TO authenticated
USING (
  auth.uid() = customer_id
  OR auth.uid() = provider_id
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "bookings_insert_customer" ON bookings;
CREATE POLICY "bookings_insert_customer"
ON bookings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "bookings_update_participants_or_admin" ON bookings;
CREATE POLICY "bookings_update_participants_or_admin"
ON bookings FOR UPDATE TO authenticated
USING (
  auth.uid() = customer_id
  OR auth.uid() = provider_id
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
)
WITH CHECK (
  auth.uid() = customer_id
  OR auth.uid() = provider_id
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================================
-- reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public"
ON reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "reviews_insert_customer" ON reviews;
CREATE POLICY "reviews_insert_customer"
ON reviews FOR INSERT TO authenticated
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "reviews_delete_admin" ON reviews;
CREATE POLICY "reviews_delete_admin"
ON reviews FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'card' CHECK (method IN ('card','cash','upi','wallet')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_participants_or_admin" ON payments;
CREATE POLICY "payments_select_participants_or_admin"
ON payments FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM bookings b WHERE b.id = payments.booking_id AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

DROP POLICY IF EXISTS "payments_insert_admin_or_participant" ON payments;
CREATE POLICY "payments_insert_admin_or_participant"
ON payments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM bookings b WHERE b.id = payments.booking_id AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid()))
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- ============================================================
-- notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info','booking','review','system','payment')),
  is_read boolean NOT NULL DEFAULT false,
  related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own_or_admin" ON notifications;
CREATE POLICY "notifications_insert_own_or_admin"
ON notifications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own"
ON notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_providers_verified ON providers(is_verified);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_providers_updated ON providers;
CREATE TRIGGER trg_providers_updated BEFORE UPDATE ON providers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_updated ON bookings;
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_providers_updated2 ON providers;
CREATE TRIGGER trg_providers_updated2 BEFORE UPDATE ON providers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Auto-create profile on signup (handle_new_user)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Recalculate provider rating on review insert
-- ============================================================
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS trigger AS $$
DECLARE
  avg_rating numeric;
  cnt int;
BEGIN
  SELECT COALESCE(AVG(rating), 0)::numeric(2,1), COUNT(*)
  INTO avg_rating, cnt
  FROM reviews WHERE provider_id = NEW.provider_id;

  UPDATE providers
  SET rating = avg_rating, rating_count = cnt
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_review_rating ON reviews;
CREATE TRIGGER trg_review_rating
AFTER INSERT OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- ============================================================
-- Increment jobs_completed when booking completed
-- ============================================================
CREATE OR REPLACE FUNCTION on_booking_completed()
RETURNS trigger AS $$
BEGIN
  IF (OLD.status <> 'completed' AND NEW.status = 'completed') THEN
    UPDATE providers SET jobs_completed = jobs_completed + 1 WHERE id = NEW.provider_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_booking_completed ON bookings;
CREATE TRIGGER trg_booking_completed
AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION on_booking_completed();
