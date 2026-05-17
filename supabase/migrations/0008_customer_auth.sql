-- ═══════════════════════════════════════════════════════════════
-- 0008_customer_auth.sql — Müşteri hesap altyapısı
-- ═══════════════════════════════════════════════════════════════
--
-- Müşteri Supabase Auth ile giriş yapınca:
--   * Kendi siparişlerini (email match) görebilsin
--   * Misafir checkout'larda email = login email olursa otomatik
--     'sahiplenir' (geçmiş siparişler hesaba bağlı görünür)
--   * Eklenmiş policy: authenticated rolü kendi email'iyle eşleşen
--     orders satırlarını okuyabilir.
--
-- Notlar:
--   * Mevcut yapı: orders.user_id alanı var (boş kalabilir, fallback olarak
--     customer_email match'i ile çalışacağız).
--   * Cart_items zaten anon INSERT, hiçbir SELECT policy yok → bunu da
--     authenticated SELECT için açıyoruz (kendi order_id'lerine ait olan).
-- ═══════════════════════════════════════════════════════════════

-- orders: authenticated user kendi e-postasıyla eşleşen siparişleri okusun
DROP POLICY IF EXISTS "orders_owner_read" ON public.orders;
CREATE POLICY "orders_owner_read" ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    LOWER(customer_email) = LOWER(COALESCE((auth.jwt() ->> 'email')::text, ''))
    OR user_id = auth.uid()
  );

-- order_items: kendi siparişine ait kalemleri okusun
DROP POLICY IF EXISTS "order_items_owner_read" ON public.order_items;
CREATE POLICY "order_items_owner_read" ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE LOWER(customer_email) = LOWER(COALESCE((auth.jwt() ->> 'email')::text, ''))
         OR user_id = auth.uid()
    )
  );
