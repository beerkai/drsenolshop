-- ═══════════════════════════════════════════════════════════════
-- 0007_ledger_plate_format.sql — plate CHECK gevşetildi
-- ═══════════════════════════════════════════════════════════════
--
-- Eski CHECK sadece geleneksel TR plakası kabul ediyordu.
-- Yeni CHECK: ya geleneksel plaka, ya da harf-rakam segmentleri tire ile
-- bağlanmış serbest etiket (örn. MERCAN-KADIR tur şirketi-rehber kodu).
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.ledger_entries
  DROP CONSTRAINT IF EXISTS ledger_entries_plate_format_check;

DO $$ BEGIN
  ALTER TABLE public.ledger_entries
    ADD CONSTRAINT ledger_entries_plate_format_check
    CHECK (plate ~ '^([0-9]{2}[A-Z]{1,3}[0-9]{1,4}|[A-Z][A-Z0-9]*(-[A-Z0-9]+)*)$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- Doğrulama:
--   SELECT * FROM pg_constraint
--   WHERE conrelid = 'public.ledger_entries'::regclass
--     AND conname = 'ledger_entries_plate_format_check';
