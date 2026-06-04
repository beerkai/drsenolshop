-- ═══════════════════════════════════════════════════════════════
-- 0015_customer_notes.sql — Müşteri başına admin notları
-- ═══════════════════════════════════════════════════════════════
--
-- Email tabanlı: müşteri hesabı sonradan oluşturulsa bile (veya silinse)
-- not orada kalır. Admin görüntüler, müşteri görmez.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  admin_email TEXT,                     -- not bırakan admin'in email'i (denormalize)
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_notes_email_idx ON public.customer_notes(customer_email, created_at DESC);

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
-- Yalnız service_role erişebilir; policy YOK (default deny).
