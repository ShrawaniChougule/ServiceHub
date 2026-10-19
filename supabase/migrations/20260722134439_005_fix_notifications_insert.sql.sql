/*
# Fix notifications INSERT policy

## Problem
The notifications INSERT policy only allowed `auth.uid() = user_id OR is_admin()`.
When a customer creates a booking, the app inserts a notification addressed to
the provider (user_id = provider's id). Since auth.uid() is the customer's id,
not the provider's, the insert was rejected by RLS.

## Fix
Allow any authenticated user to INSERT notifications. This is safe because:
- Notifications are created by the app from booking/review actions
- Users can only READ their own notifications (SELECT policy is strict)
- The INSERT doesn't expose any sensitive data — just a message to another user
- The alternative (checking booking membership) would recurse through bookings RLS
*/

DROP POLICY IF EXISTS "notifications_insert_own_or_admin" ON notifications;
CREATE POLICY "notifications_insert_authenticated"
ON notifications FOR INSERT TO authenticated
WITH CHECK (true);
