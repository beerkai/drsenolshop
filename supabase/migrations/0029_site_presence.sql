-- ═══════════════════════════════════════════════════════════════
-- 0029_site_presence.sql — Şu an sitede olan ziyaretçi nabzı
-- Oturum kimliği rastgele, kişisel veri yok. Yalnız service_role.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.site_presence (
  session_id TEXT PRIMARY KEY CHECK (char_length(session_id) BETWEEN 32 AND 40),
  path TEXT NOT NULL DEFAULT '/' CHECK (char_length(path) <= 80),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS site_presence_last_seen_idx
  ON public.site_presence (last_seen DESC);

DROP TRIGGER IF EXISTS site_presence_set_updated_at ON public.site_presence;
CREATE TRIGGER site_presence_set_updated_at
  BEFORE UPDATE ON public.site_presence
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_presence ENABLE ROW LEVEL SECURITY;
