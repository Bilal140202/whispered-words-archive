
-- Drop the existing (broken) INSERT policy if it exists
DROP POLICY IF EXISTS "Anyone can write letters" ON public.letters;
DROP POLICY IF EXISTS "Authenticated can write letters" ON public.letters;

-- Allow anyone (including unauthenticated users) to insert new letters
CREATE POLICY "Anyone can write letters"
  ON public.letters
  FOR INSERT
  TO public
  WITH CHECK (true);
