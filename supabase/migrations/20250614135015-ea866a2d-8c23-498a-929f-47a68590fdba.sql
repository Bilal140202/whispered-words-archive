
-- Add 150 random letters for each category/tag
DO $$
DECLARE
  tags TEXT[] := ARRAY['Love', 'Regret', 'Goodbye', 'Gratitude', 'Confession', 'Rage', 'Closure'];
  i INT;
  t TEXT;
  j INT;
  random_names TEXT[] := ARRAY[
    'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Jess', 'Charlie', 'Drew', 'Riley', 'Sam', 'Sky', 'Jamie'
  ];
  name_idx INT;
  sample_bodies TEXT[] := ARRAY[
    'I never told you how much you meant to me.',
    'Sometimes, I wish I had chosen differently.',
    'Farewell, hoping you find happiness.',
    'Thank you for being there when I needed you.',
    'My heart has held onto this secret far too long.',
    'There are words I wanted to scream but never did.',
    'Finally, I feel ready to move on from this chapter.'
  ];
  body_idx INT;
  content TEXT;
BEGIN
  FOR i IN 1..array_length(tags, 1) LOOP
    t := tags[i];
    FOR j IN 1..150 LOOP
      name_idx := (random() * (array_length(random_names,1)-1) + 1)::INT;
      body_idx := (random() * (array_length(sample_bodies,1)-1) + 1)::INT;
      content := sample_bodies[body_idx] || ' — From, ' || random_names[name_idx] || ' #' || (1000+((random()*8999)::INT));
      INSERT INTO letters (text, tag)
      VALUES (content, t);
    END LOOP;
  END LOOP;
END $$;
