/*
# Fix infinite recursion in profiles RLS policies

## Problem
The profiles SELECT policy used:
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
This queries the `profiles` table from within a `profiles` RLS policy, causing
"infinite recursion detected in policy for relation". Every authenticated
query touching profiles (directly or via joins) failed silently.

## Fix
1. Create a SECURITY DEFINER function `is_admin()` that checks the caller's
   role in profiles WITHOUT RLS interference. This breaks the recursion.
2. Rewrite all policies that referenced `EXISTS (SELECT 1 FROM profiles ...)`
   to use `is_admin()` instead.
3. Applies to: profiles, services, providers, bookings, reviews, payments.

## Notes
- The function is SECURITY DEFINER owned by postgres, so it bypasses RLS
  when reading the profiles table internally.
- No data changes. Safe to re-run.
*/

-- ============================================================
-- Helper: is_admin() — breaks RLS recursion
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- profiles: fix recursion
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR is_admin());

-- ============================================================
-- services: fix admin policies
-- ============================================================
DROP POLICY IF EXISTS "services_insert_admin" ON services;
CREATE POLICY "services_insert_admin"
ON services FOR INSERT TO authenticated
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "services_update_admin" ON services;
CREATE POLICY "services_update_admin"
ON services FOR UPDATE TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "services_delete_admin" ON services;
CREATE POLICY "services_delete_admin"
ON services FOR DELETE TO authenticated
USING (is_admin());

-- ============================================================
-- providers: fix admin part of update policy
-- ============================================================
DROP POLICY IF EXISTS "providers_update_own_or_admin" ON providers;
CREATE POLICY "providers_update_own_or_admin"
ON providers FOR UPDATE TO authenticated
USING (auth.uid() = id OR is_admin())
WITH CHECK (auth.uid() = id OR is_admin());

-- ============================================================
-- bookings: fix admin parts
-- ============================================================
DROP POLICY IF EXISTS "bookings_select_participants_or_admin" ON bookings;
CREATE POLICY "bookings_select_participants_or_admin"
ON bookings FOR SELECT TO authenticated
USING (
  auth.uid() = customer_id
  OR auth.uid() = provider_id
  OR is_admin()
);

DROP POLICY IF EXISTS "bookings_update_participants_or_admin" ON bookings;
CREATE POLICY "bookings_update_participants_or_admin"
ON bookings FOR UPDATE TO authenticated
USING (
  auth.uid() = customer_id
  OR auth.uid() = provider_id
  OR is_admin()
)
WITH CHECK (
  auth.uid() = customer_id
  OR auth.uid() = provider_id
  OR is_admin()
);

-- ============================================================
-- reviews: fix admin delete
-- ============================================================
DROP POLICY IF EXISTS "reviews_delete_admin" ON reviews;
CREATE POLICY "reviews_delete_admin"
ON reviews FOR DELETE TO authenticated
USING (is_admin());

-- ============================================================
-- payments: fix admin parts
-- ============================================================
DROP POLICY IF EXISTS "payments_select_participants_or_admin" ON payments;
CREATE POLICY "payments_select_participants_or_admin"
ON payments FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM bookings b WHERE b.id = payments.booking_id AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid()))
  OR is_admin()
);

DROP POLICY IF EXISTS "payments_insert_admin_or_participant" ON payments;
CREATE POLICY "payments_insert_admin_or_participant"
ON payments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM bookings b WHERE b.id = payments.booking_id AND (b.customer_id = auth.uid() OR b.provider_id = auth.uid()))
  OR is_admin()
);
