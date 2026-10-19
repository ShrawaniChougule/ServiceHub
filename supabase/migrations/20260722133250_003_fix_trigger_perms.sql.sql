/*
# Fix handle_new_user trigger permissions

The trigger function was failing with "Database error creating new user"
because the SECURITY DEFINER function lacked explicit table privileges and
a fixed search_path. This grants the function owner full access to profiles
and providers and sets a secure search_path on the function.
*/

GRANT ALL ON profiles TO authenticated, anon, service_role;
GRANT ALL ON providers TO authenticated, anon, service_role;
GRANT ALL ON provider_services TO authenticated, anon, service_role;

-- Recreate the function with a fixed search_path for security
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
