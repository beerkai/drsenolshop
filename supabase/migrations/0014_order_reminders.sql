-- ═══════════════════════════════════════════════════════════════
-- 0014_order_reminders.sql — Pending sipariş hatırlatma izleme
-- ═══════════════════════════════════════════════════════════════
--
-- Cron her saat çalışır: 6+ saat 'pending' kalan siparişlere "ödemeyi
-- tamamla" hatırlatması gönderir. Tekrar göndermemek için reminded_at
-- stamp'lenir; ikinci hatırlatma 48+ saat sonra (last_reminded_at ile).
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reminded_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reminder_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS orders_pending_reminder_idx
  ON public.orders(created_at)
  WHERE status = 'pending' AND payment_status = 'pending';
