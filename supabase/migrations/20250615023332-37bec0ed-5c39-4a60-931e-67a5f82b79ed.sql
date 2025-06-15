
-- Add the emoji column to allow one reaction per letter+IP+emoji
ALTER TABLE public.anon_interaction_logs
ADD COLUMN emoji text;

-- Create an index to speed up the (ip, letter_id, action, emoji) queries
CREATE INDEX IF NOT EXISTS anon_interaction_logs_ip_letter_action_emoji_idx
ON public.anon_interaction_logs (ip, letter_id, action, emoji);

-- (Optional) Backfill: set emoji to NULL for old non-reaction rows
UPDATE public.anon_interaction_logs
SET emoji = NULL
WHERE action != 'reaction';

