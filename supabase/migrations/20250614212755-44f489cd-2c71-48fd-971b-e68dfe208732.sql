
-- 1. Create memory_capsules table for core Memory Capsule functionality
CREATE TABLE IF NOT EXISTS public.memory_capsules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  image_url text,
  audio_url text,
  video_url text,
  unlock_date timestamptz NOT NULL,
  email_for_delivery text,
  allow_public_sharing boolean NOT NULL DEFAULT FALSE,
  is_unlocked boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT now(),
  unlocked_at timestamptz
);

-- 2. Create index to quickly find public, unlocked capsules (for feed)
CREATE INDEX IF NOT EXISTS idx_capsule_public_unlocked ON public.memory_capsules (allow_public_sharing, is_unlocked, unlock_date);

-- 3. (Optional) Create a separate table for capsule views/interactions for future analytics (can be built out if needed)
-- CREATE TABLE IF NOT EXISTS public.capsule_views (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   capsule_id uuid NOT NULL REFERENCES public.memory_capsules(id) ON DELETE CASCADE,
--   viewed_at timestamptz NOT NULL DEFAULT now()
-- );

-- 4. (Optional) Public Storage Buckets for Capsule Media
-- Images
insert into storage.buckets (id, name, public) values ('memory-capsule-images', 'memory-capsule-images', true) on conflict do nothing;

-- Audio
insert into storage.buckets (id, name, public) values ('memory-capsule-audio', 'memory-capsule-audio', true) on conflict do nothing;

-- Video
insert into storage.buckets (id, name, public) values ('memory-capsule-video', 'memory-capsule-video', true) on conflict do nothing;

-- 5. (RECOMMENDED) Enable RLS to make capsules private until unlocked (simple baseline policy)
ALTER TABLE public.memory_capsules ENABLE ROW LEVEL SECURITY;

-- Only public, unlocked capsules can be SELECTed by anyone (for feed)
CREATE POLICY "Public unlocked capsule feed" ON public.memory_capsules
  FOR SELECT
  USING (
    allow_public_sharing = TRUE AND is_unlocked = TRUE AND unlock_date <= now()
  );

-- Insert/update/delete OPEN for now (or restrict to authenticated users if/when you have auth)
CREATE POLICY "Anyone can insert capsules" ON public.memory_capsules
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update capsules" ON public.memory_capsules
  FOR UPDATE WITH CHECK (true);

CREATE POLICY "Anyone can delete capsules" ON public.memory_capsules
  FOR DELETE USING (true);
