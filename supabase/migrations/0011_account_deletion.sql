-- ═══════════════════════════════════════════════════════════════
-- 0011_account_deletion.sql — Hesap silme sonrası sipariş anonimleştirme
-- ═══════════════════════════════════════════════════════════════
--
-- KVKK m.7 (silme hakkı) ile Vergi Usul Kanunu (sipariş kayıtları 10 yıl
-- saklanmalı) çatışır → sipariş satırları KALIR ama PII anonimleştirilir.
--
-- Bu migration'da yapılan: anonymize_orders_for_user() fonksiyonu.
-- API route bunu RPC olarak çağırır.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.anonymize_orders_for_user(p_user_id UUID, p_email TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected INT := 0;
BEGIN
  -- Email VEYA user_id ile eşleşen tüm siparişleri anonimleştir
  UPDATE public.orders
  SET
    customer_email = 'deleted+' || substr(md5(coalesce(customer_email, '')), 1, 8) || '@deleted.local',
    customer_name = 'Silinmiş Hesap',
    customer_phone = NULL,
    user_id = NULL,
    shipping_address = '{}'::jsonb,
    billing_address = NULL,
    notes = COALESCE(notes, '') || ' [hesap silindi: ' || to_char(NOW(), 'YYYY-MM-DD') || ']'
  WHERE
    (p_user_id IS NOT NULL AND user_id = p_user_id)
    OR (p_email IS NOT NULL AND LOWER(customer_email) = LOWER(p_email));

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Yalnız service_role (admin) çağırsın
REVOKE ALL ON FUNCTION public.anonymize_orders_for_user(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.anonymize_orders_for_user(UUID, TEXT) TO service_role;
