
-- Create spaces table
CREATE TABLE public.spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id TEXT NOT NULL UNIQUE,
  daily_goal_hours NUMERIC NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create punch records table
CREATE TABLE public.punch_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES public.spaces(space_id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.punch_records ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth, data isolated by space_id)
CREATE POLICY "Anyone can read spaces" ON public.spaces FOR SELECT USING (true);
CREATE POLICY "Anyone can insert spaces" ON public.spaces FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update spaces" ON public.spaces FOR UPDATE USING (true);

CREATE POLICY "Anyone can read punch_records" ON public.punch_records FOR SELECT USING (true);
CREATE POLICY "Anyone can insert punch_records" ON public.punch_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update punch_records" ON public.punch_records FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete punch_records" ON public.punch_records FOR DELETE USING (true);

-- Indexes
CREATE INDEX idx_punch_records_space_id ON public.punch_records(space_id);
CREATE INDEX idx_punch_records_start_time ON public.punch_records(start_time DESC);
