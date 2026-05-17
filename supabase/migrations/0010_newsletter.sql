-- ═══════════════════════════════════════════════════════════════
-- 0010_newsletter.sql — Newsletter aboneleri
-- ═══════════════════════════════════════════════════════════════
--
-- Footer'daki "hasat bildirimi" formundan toplanan e-postalar.
-- Email unique — aynı e-postayı iki kez ekleme.
-- KVKK: pazarlama izni ayrıca consent_at ile saklanır.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,                                        -- footer, popup, checkout vb.
  is_active BOOLEAN NOT NULL DEFAULT TRUE,            -- unsubscribe edilirse false
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),      -- KVKK pazarlama izni anı
  unsubscribed_at TIMESTAMPTZ,
  ip_address TEXT,                                    -- KVKK iz kaydı (opsiyonel)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS newsletter_email_idx ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS newsletter_active_idx ON public.newsletter_subscribers(is_active) WHERE is_active = TRUE;

DROP TRIGGER IF EXISTS newsletter_set_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER newsletter_set_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anon INSERT açık (form submit) — tek email/saat rate-limit yok, ileride eklenebilir.
-- Idempotency: ON CONFLICT DO NOTHING ile API tarafında yönetilir.
DROP POLICY IF EXISTS "newsletter_anon_insert" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_anon_insert" ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- SELECT kapalı (anon listeyi göremesin). Admin service_role ile okur.
