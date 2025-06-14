
-- 1. Store emoji reactions per letter (multiple allowed per letter-user)
CREATE TABLE IF NOT EXISTS public.letter_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  -- No user_id: anonymous reactions
  CONSTRAINT fk_letter FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
);

-- 2. Comments per letter
CREATE TABLE IF NOT EXISTS public.letter_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  -- No user_id: anonymous comments
  CONSTRAINT fk_letter FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
);

-- 3. Likes per letter (no user_id: allow multiple likes, just demo purposes)
CREATE TABLE IF NOT EXISTS public.letter_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_letter FOREIGN KEY (letter_id) REFERENCES letters(id) ON DELETE CASCADE
);

-- (No policies needed for anonymous/public use.)

