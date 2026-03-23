CREATE TABLE public.leave_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id text NOT NULL REFERENCES public.spaces(space_id),
  leave_date date NOT NULL,
  leave_type text NOT NULL CHECK (leave_type IN ('morning', 'afternoon', 'full')),
  credit_hours numeric NOT NULL DEFAULT 9.5,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (space_id, leave_date)
);

ALTER TABLE public.leave_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leave_records" ON public.leave_records FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert leave_records" ON public.leave_records FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can delete leave_records" ON public.leave_records FOR DELETE TO public USING (true);