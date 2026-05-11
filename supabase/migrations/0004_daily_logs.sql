-- ═══════════════════════════════════════════════════════════════
-- 0004_daily_logs.sql — Patron günlük not + özelleştirilebilir metrik
-- ═══════════════════════════════════════════════════════════════
--
-- Her admin için, her gün için tek kayıt (UNIQUE log_date + author_email).
-- notes = serbest metin, metrics = key/value JSONB (kovan skoru, hedef vb.)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS log_date DATE;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS author_email TEXT;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- (author_email, log_date) UNIQUE — upsert için anahtar
DO $$ BEGIN
  ALTER TABLE public.daily_logs
    ADD CONSTRAINT daily_logs_author_date_key UNIQUE (author_email, log_date);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS daily_logs_log_date_idx ON public.daily_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS daily_logs_author_idx ON public.daily_logs(author_email);

-- updated_at trigger (set_updated_at fonksiyonu 0001'de tanımlandı)
DROP TRIGGER IF EXISTS daily_logs_set_updated_at ON public.daily_logs;
CREATE TRIGGER daily_logs_set_updated_at
  BEFORE UPDATE ON public.daily_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — sadece service_role API üzerinden erişim. Anon hiçbir şey yapamaz.
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
-- Policy YOK.
