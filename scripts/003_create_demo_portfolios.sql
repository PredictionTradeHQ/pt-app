-- Persisted demo portfolio per registered user
CREATE TABLE IF NOT EXISTS public.demo_portfolios (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 10000.00,
  positions JSONB NOT NULL DEFAULT '[]'::jsonb,
  activity JSONB NOT NULL DEFAULT '[]'::jsonb,
  starting_balance DECIMAL(12, 2) NOT NULL DEFAULT 10000.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.demo_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo_portfolios_select_own" ON public.demo_portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "demo_portfolios_insert_own" ON public.demo_portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "demo_portfolios_update_own" ON public.demo_portfolios
  FOR UPDATE USING (auth.uid() = user_id);
