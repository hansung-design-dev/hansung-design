-- Add soft-delete support for user_profiles to avoid breaking FK references (orders/design_drafts).
-- This enables "delete and recreate" UX while keeping historical references intact.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS user_profiles_archived_at_idx
ON public.user_profiles (archived_at);

-- Add soft-delete support for user_profiles to avoid breaking FK references (orders/design_drafts).
-- This enables "delete and recreate" UX while keeping historical references intact.

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS user_profiles_archived_at_idx
ON public.user_profiles (archived_at);


