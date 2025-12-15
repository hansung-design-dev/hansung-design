-- Store per-profile phone verification state for UX badges.
-- We do NOT rely on phone_verifications TTL for "verified badge" because it expires (e.g. 1 hour).

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_phone_verified boolean NOT NULL DEFAULT false;

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS phone_verified_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS user_profiles_is_phone_verified_idx
ON public.user_profiles (is_phone_verified);


