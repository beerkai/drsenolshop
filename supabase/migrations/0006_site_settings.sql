-- ═══════════════════════════════════════════════════════════════
-- 0006_site_settings.sql — Site-geneli ayarlar (key/value JSONB)
-- ═══════════════════════════════════════════════════════════════
--
-- Örnek key'ler:
--   bank_info       : { bank_name, account_holder, iban }
--   site_notice     : { title, message, level }
--
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Banka bilgileri gibi public okunabilir ayarlar için anon SELECT açık:
-- Hassas key'ler eklenirse o key'lere özel policy yazılır.
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);
