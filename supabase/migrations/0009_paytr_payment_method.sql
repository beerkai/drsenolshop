-- ═══════════════════════════════════════════════════════════════
-- 0009_paytr_payment_method.sql — payment_method enum'a 'paytr' ekle
-- ═══════════════════════════════════════════════════════════════
--
-- PostgreSQL'de ENUM'a değer eklemek tek yön: ALTER TYPE ... ADD VALUE.
-- IF NOT EXISTS clause'u 9.6+'dan beri var; idempotent.
--
-- Not: orders.payment_method default'u hâlâ 'bank_transfer'. PayTR siparişleri
-- /api/orders'a payment_method='paytr' geçilerek oluşturulur.
-- ═══════════════════════════════════════════════════════════════

ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'paytr';
