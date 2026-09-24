-- ═══════════════════════════════════════════════════════════════
-- 0026_telegram_ops.sql — bot oturumu, update tekilliği, stok geçişi
-- ═══════════════════════════════════════════════════════════════
-- Defter sihirbazı ve kargo takip adımı sunucusuz ortamda kaybolmasın
-- diye oturum tutulur. Aynı Telegram update'i ikinci defter satırı açmasın.
-- Stok cron'u yalnızca eşiği yeni geçen varyantları bildirsin.
-- Rehber komisyonu çalışanın oranından hesaplanır (varsayılan %50).

ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS guide_commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.5;

DO $$ BEGIN
  ALTER TABLE public.employees
    ADD CONSTRAINT employees_guide_commission_rate_check
    CHECK (guide_commission_rate >= 0 AND guide_commission_rate <= 1);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.telegram_processed_updates (
  update_id BIGINT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS telegram_processed_updates_at_idx
  ON public.telegram_processed_updates(processed_at);

CREATE TABLE IF NOT EXISTS public.telegram_sessions (
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('sale', 'ship')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id, kind)
);

CREATE TABLE IF NOT EXISTS public.stock_alert_state (
  variant_id UUID PRIMARY KEY,
  last_stock INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.telegram_processed_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alert_state ENABLE ROW LEVEL SECURITY;
-- Policy yok → yalnız service_role.
