ALTER TABLE public.spaces
  ADD COLUMN goal_start_time text NOT NULL DEFAULT '10:00',
  ADD COLUMN goal_end_time text NOT NULL DEFAULT '19:30';