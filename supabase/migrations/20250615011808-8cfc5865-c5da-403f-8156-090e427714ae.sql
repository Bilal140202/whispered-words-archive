
-- Recreate sanitize_comment_content function to set search_path = public for safety
CREATE OR REPLACE FUNCTION public.sanitize_comment_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.comment := regexp_replace(NEW.comment, '<script.*?>.*?</script>', '', 'gi');
  NEW.comment := regexp_replace(NEW.comment, '<[^>]*on[a-z]+\\s*=\\s*\"[^\"]*\"[^>]*>', '', 'gi');
  RETURN NEW;
END;
$$;
