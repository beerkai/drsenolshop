-- ═══════════════════════════════════════════════════════════════
-- 0002_admin_users.sql — Admin paneli için kullanıcı whitelist
-- ═══════════════════════════════════════════════════════════════
--
-- Supabase Auth'tan gelen email'i admin_users tablosunda var mı kontrol
-- ederek admin yetkisi veriyoruz. Basit MVP yaklaşımı.
--
-- Tam idempotent: tablo + kolonlar ayrı ayrı garantilenir.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff';
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- UNIQUE constraint'ler
DO $$ BEGIN
  ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_email_key UNIQUE (email);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_auth_user_id_key UNIQUE (auth_user_id);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- CHECK — role enum benzeri
DO $$ BEGIN
  ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_role_check
    CHECK (role IN ('owner', 'staff'));
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- İndeksler
CREATE INDEX IF NOT EXISTS admin_users_email_idx        ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS admin_users_auth_user_id_idx ON public.admin_users(auth_user_id);

-- updated_at trigger (set_updated_at fonksiyonu 0001'de tanımlandı)
DROP TRIGGER IF EXISTS admin_users_set_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_set_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — anon hiçbir erişime sahip değil
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- Hiçbir policy yok → anon SELECT/INSERT/UPDATE/DELETE yapamaz.

-- ─── İlk owner kullanıcı ekleme ─────────────────────────────────
-- Şu SQL'i ayrı çalıştır (email'i kendi mailinle değiştir):
--
-- INSERT INTO public.admin_users (email, full_name, role)
-- VALUES ('senin-mailin@example.com', 'Berkay', 'owner')
-- ON CONFLICT (email) DO NOTHING;
