ALTER TYPE public.gk_day RENAME TO gk_day_old;
CREATE TYPE public.gk_day AS ENUM ('Sloth','Gluttony','Envy','Pride','Lust','Wrath');

ALTER TABLE public.profiles ALTER COLUMN current_day DROP DEFAULT;
ALTER TABLE public.profiles
  ALTER COLUMN current_day TYPE public.gk_day USING (
    CASE current_day::text
      WHEN 'Moon' THEN 'Sloth'
      WHEN 'Fire' THEN 'Gluttony'
      WHEN 'Water' THEN 'Envy'
      WHEN 'Wind' THEN 'Pride'
      WHEN 'Tree' THEN 'Lust'
      WHEN 'Bone' THEN 'Wrath'
    END
  )::public.gk_day;
ALTER TABLE public.profiles ALTER COLUMN current_day SET DEFAULT 'Sloth';

ALTER TABLE public.npc
  ALTER COLUMN day_available TYPE public.gk_day USING (
    CASE day_available::text
      WHEN 'Moon' THEN 'Sloth'
      WHEN 'Fire' THEN 'Gluttony'
      WHEN 'Water' THEN 'Envy'
      WHEN 'Wind' THEN 'Pride'
      WHEN 'Tree' THEN 'Lust'
      WHEN 'Bone' THEN 'Wrath'
    END
  )::public.gk_day;

ALTER TABLE public.vendors
  ALTER COLUMN day_available TYPE public.gk_day USING (
    CASE day_available::text
      WHEN 'Moon' THEN 'Sloth'
      WHEN 'Fire' THEN 'Gluttony'
      WHEN 'Water' THEN 'Envy'
      WHEN 'Wind' THEN 'Pride'
      WHEN 'Tree' THEN 'Lust'
      WHEN 'Bone' THEN 'Wrath'
    END
  )::public.gk_day;

DROP TYPE public.gk_day_old;