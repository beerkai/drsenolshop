-- ═══════════════════════════════════════════════════════════════
-- 0016_paytr_order_metadata.sql — PayTR callback metadata
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paytr_response JSONB;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS orders_payment_ref_idx ON public.orders(payment_ref);
