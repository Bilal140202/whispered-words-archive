
ALTER TABLE public.letter_reactions
ADD COLUMN IF NOT EXISTS ip inet;

-- In the future, you may want to enforce uniqueness:
-- CREATE UNIQUE INDEX IF NOT EXISTS letter_reactions_unique_per_user
-- ON public.letter_reactions (letter_id, emoji, ip);
