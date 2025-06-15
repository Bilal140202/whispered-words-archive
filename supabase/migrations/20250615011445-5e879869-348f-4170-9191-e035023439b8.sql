
-- 1. Enable Row Level Security for all interaction tables
ALTER TABLE public.letter_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_reactions ENABLE ROW LEVEL SECURITY;

-- 2. Remove any existing policies to avoid duplication/conflicts
DROP POLICY IF EXISTS "Public select" ON public.letter_comments;
DROP POLICY IF EXISTS "Public insert" ON public.letter_comments;
DROP POLICY IF EXISTS "Public update" ON public.letter_comments;
DROP POLICY IF EXISTS "Public delete" ON public.letter_comments;

DROP POLICY IF EXISTS "Public select" ON public.letter_likes;
DROP POLICY IF EXISTS "Public insert" ON public.letter_likes;
DROP POLICY IF EXISTS "Public update" ON public.letter_likes;
DROP POLICY IF EXISTS "Public delete" ON public.letter_likes;

DROP POLICY IF EXISTS "Public select" ON public.letter_reactions;
DROP POLICY IF EXISTS "Public insert" ON public.letter_reactions;
DROP POLICY IF EXISTS "Public update" ON public.letter_reactions;
DROP POLICY IF EXISTS "Public delete" ON public.letter_reactions;

-- 3. Create policies for anonymous/public use (can be tuned if auth is later added):

-- Anyone can select/insert/update/delete their own comment/like/reaction (public/anonymous)
CREATE POLICY "Public select" ON public.letter_comments
  FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.letter_comments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.letter_comments
  FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.letter_comments
  FOR DELETE USING (true);

CREATE POLICY "Public select" ON public.letter_likes
  FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.letter_likes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.letter_likes
  FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.letter_likes
  FOR DELETE USING (true);

CREATE POLICY "Public select" ON public.letter_reactions
  FOR SELECT USING (true);
CREATE POLICY "Public insert" ON public.letter_reactions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON public.letter_reactions
  FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON public.letter_reactions
  FOR DELETE USING (true);

-- 4. Enforce MAX LENGTH of 240 characters for comments at DB level (backend validation)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'letter_comments_comment_maxlen'
  ) THEN
    ALTER TABLE public.letter_comments
    ADD CONSTRAINT letter_comments_comment_maxlen
      CHECK (char_length(comment) <= 240);
  END IF;
END
$$;

-- 5. (Optional) Prevent simple XSS: remove <script> tags, etc. on insert/update (for extra protection)
-- We'll create a trigger that strips <script> and on* event handlers from the "comment" field.
CREATE OR REPLACE FUNCTION public.sanitize_comment_content()
RETURNS TRIGGER AS $$
BEGIN
  NEW.comment := regexp_replace(NEW.comment, '<script.*?>.*?</script>', '', 'gi');
  NEW.comment := regexp_replace(NEW.comment, '<[^>]*on[a-z]+\\s*=\\s*\"[^\"]*\"[^>]*>', '', 'gi');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sanitize_comment_content_before_insupd ON public.letter_comments;
CREATE TRIGGER sanitize_comment_content_before_insupd
  BEFORE INSERT OR UPDATE ON public.letter_comments
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_comment_content();

-- 6. (Optional, but visible for moderation) Add created_at default enforcement if needed:
ALTER TABLE public.letter_comments ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.letter_likes ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.letter_reactions ALTER COLUMN created_at SET DEFAULT now();

