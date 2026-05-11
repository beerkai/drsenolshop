-- ═══════════════════════════════════════════════════════════════
-- 0002_admin_users.sql — Admin paneli için kullanıcı whitelist
-- ═══════════════════════════════════════════════════════════════
--
-- Supabase Auth'tan gelen email'i admin_users tablosunda var mı kontrol
-- ederek admin yetkisi veriyoruz. Bu basit yaklaşım v0.4.0 için yeter;
-- ileride role-based permissions eklenebilir.
--
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Supabase auth.users(id) ile bağlantı (auth eklendiğinde dolu olacak)
  auth_user_id UUID UNIQUE,

  email TEXT NOT NULL UNIQUE CHECK (email <> ''),
  full_name TEXT,

  -- Rol — şimdilik 'owner' veya 'staff'; ileride genişler
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),

  is_active BOOLEAN NOT NULL DEFAULT true,

  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS admin_users_email_idx ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS admin_users_auth_user_id_idx ON public.admin_users(auth_user_id);

-- updated_at trigger (0001'de tanımlandı)
DROP TRIGGER IF EXISTS admin_users_set_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_set_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS — admin_users tablosu **kesinlikle anon'a açık değil**.
-- API route service_role ile sorgular.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- Hiçbir policy yok → anon erişemez.

-- ─── İlk owner kullanıcı ────────────────────────────────────────────
-- Buraya gerçek email'i ekle. Migration sonrası elle düzenle veya
-- ayrı bir seed dosyasıyla yap. Burada placeholder.
--
-- INSERT INTO public.admin_users (email, full_name, role)
-- VALUES ('admin@drsenol.shop', 'Dr. Şenol', 'owner')
-- ON CONFLICT (email) DO NOTHING;
