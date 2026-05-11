-- ═══════════════════════════════════════════════════════════════
-- 0003_admin_users_policy.sql — Authenticated user kendi admin
-- satırını okuyabilsin
-- ═══════════════════════════════════════════════════════════════
--
-- Sorun: admin_users tablosunda RLS aktif ama hiçbir SELECT policy
-- olmadığı için authenticated kullanıcı kendi yetki satırını
-- okuyamıyor → login akışı "Bu hesap admin değil" diyor.
--
-- Çözüm: JWT email claim'i ile eşleşen satırın okumasına izin ver.
-- (Service_role her zaman bypass eder, anon yine erişemez.)
-- ═══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "admin_users_self_read" ON public.admin_users;

CREATE POLICY "admin_users_self_read" ON public.admin_users
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = email);

-- Doğrulama:
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname = 'public' AND tablename = 'admin_users';
