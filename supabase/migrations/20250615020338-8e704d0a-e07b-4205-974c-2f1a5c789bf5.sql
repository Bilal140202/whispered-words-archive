
-- 1. Table to block abusive IP addresses
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  ip inet PRIMARY KEY,
  blocked_at timestamptz NOT NULL DEFAULT now(),
  reason text
);

-- 2. Table to log all anonymous interaction attempts for rate limiting and abuse detection
CREATE TABLE IF NOT EXISTS public.anon_interaction_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip inet NOT NULL,
  letter_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('comment', 'reaction')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Indexes for rapid queries
CREATE INDEX IF NOT EXISTS anon_interaction_logs_ip_created_at_idx ON public.anon_interaction_logs (ip, created_at);
CREATE INDEX IF NOT EXISTS anon_interaction_logs_letter_ip_action_idx ON public.anon_interaction_logs (letter_id, ip, action);

-- 4. Cleanup policy (optional): Retain only 14 days of interaction logs (for security/PRIVACY)
-- (You may schedule this as a task in your Supabase dashboard or manually run as needed)
-- DELETE FROM public.anon_interaction_logs WHERE created_at < now() - interval '14 days';

-- 5. Row-level security for tables
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.blocked_ips FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON public.blocked_ips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete" ON public.blocked_ips FOR DELETE USING (true);

ALTER TABLE public.anon_interaction_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON public.anon_interaction_logs FOR SELECT USING (true);
CREATE POLICY "Allow insert" ON public.anon_interaction_logs FOR INSERT WITH CHECK (true);

-- 6. (Optional, for future moderation dashboard)
-- CREATE TABLE IF NOT EXISTS public.flagged_letters (
--   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--   letter_id uuid NOT NULL,
--   reason text,
--   flagged_at timestamptz NOT NULL DEFAULT now()
-- );
