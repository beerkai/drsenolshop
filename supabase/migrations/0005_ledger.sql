-- ═══════════════════════════════════════════════════════════════
-- 0005_ledger.sql — Defter sistemi (manuel saha satışları)
-- ═══════════════════════════════════════════════════════════════
--
-- "Defter" = bal işletmesinde her gün gelen müşterileri kaydeden manuel
-- kayıt sistemi (online siparişlerden ayrı). Her satış:
--   - tarih + saat
--   - araç plakası (birleşik upper: 34BED961)
--   - ilgilenen çalışan (employees tablosundan)
--   - ödeme yöntemi (kart/nakit)
--   - satış miktarı + opsiyonel rehber komisyonu
--   - müşteriden alındı? / rehbere ödendi? checkbox'ları
--   - serbest not
--
-- ═══════════════════════════════════════════════════════════════

-- ─── employees: işletme çalışanları ──────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'satış';
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS display_order INTEGER;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS employees_active_order_idx
  ON public.employees(is_active, display_order);

DROP TRIGGER IF EXISTS employees_set_updated_at ON public.employees;
CREATE TRIGGER employees_set_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
-- Policy yok → sadece service_role.

-- ─── ledger_entries: defter kayıtları ────────────────────────
CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS entry_date DATE;
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS entry_time TIME;

-- Plaka birleşik format: 34BED961 (CHECK ile zorunluluk)
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS plate TEXT;

-- Çalışan referansı + snapshot ismi (çalışan silinirse kayıt yetim kalmasın)
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS employee_id UUID;
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS employee_name TEXT;

-- Ödeme yöntemi: cash | card
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';

-- Tutarlar
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS sale_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS has_guide BOOLEAN DEFAULT false;
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS guide_commission NUMERIC(10,2);

-- Ödeme durumları
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS customer_paid BOOLEAN DEFAULT false;
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS guide_paid BOOLEAN DEFAULT false;

-- Notlar + kayıt meta
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS created_by_email TEXT;
ALTER TABLE public.ledger_entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- FK to employees (idempotent)
DO $$ BEGIN
  ALTER TABLE public.ledger_entries
    ADD CONSTRAINT ledger_entries_employee_id_fkey
    FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- CHECK: payment_method enum-benzeri
DO $$ BEGIN
  ALTER TABLE public.ledger_entries
    ADD CONSTRAINT ledger_entries_payment_method_check
    CHECK (payment_method IN ('cash', 'card'));
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- CHECK: plaka birleşik format (rakam+harf+rakam, boşluksuz, uppercase)
-- Uygulama tarafı normalize edecek, DB'de sadece format kontrolü.
DO $$ BEGIN
  ALTER TABLE public.ledger_entries
    ADD CONSTRAINT ledger_entries_plate_format_check
    CHECK (plate ~ '^[0-9]{2}[A-Z]{1,3}[0-9]{1,4}$');
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

-- İndeksler
CREATE INDEX IF NOT EXISTS ledger_entries_date_idx       ON public.ledger_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS ledger_entries_plate_idx      ON public.ledger_entries(plate);
CREATE INDEX IF NOT EXISTS ledger_entries_employee_idx   ON public.ledger_entries(employee_id);
CREATE INDEX IF NOT EXISTS ledger_entries_created_at_idx ON public.ledger_entries(created_at DESC);

-- updated_at trigger
DROP TRIGGER IF EXISTS ledger_entries_set_updated_at ON public.ledger_entries;
CREATE TRIGGER ledger_entries_set_updated_at
  BEFORE UPDATE ON public.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
-- Policy yok → sadece service_role API ile erişilir.
