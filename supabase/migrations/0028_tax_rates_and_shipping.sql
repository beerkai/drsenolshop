-- ═══════════════════════════════════════════════════════════════
-- 0028_tax_rates_and_shipping.sql
-- Gıda ürünleri KDV %1, kozmetik KDV %20.
-- Kargo: 2000 TL altı sabit 250 TL, 2000 TL ve üzeri ücretsiz.
-- Canlı uygulama: scripts/apply-tax-shipping.ts (Vercel build).
-- ═══════════════════════════════════════════════════════════════

UPDATE public.products AS p
SET tax_rate = 20
WHERE EXISTS (
  SELECT 1
  FROM public.categories AS c
  WHERE c.id = p.category_id
    AND (
      c.slug ILIKE 'kozmetik%'
      OR c.name ILIKE '%kozmetik%'
      OR c.name ILIKE '%parfüm%'
      OR c.name ILIKE '%parfum%'
    )
)
OR COALESCE(p.slug, '') ILIKE '%parfum%'
OR COALESCE(p.slug, '') ILIKE '%parfüm%'
OR COALESCE(p.name, '') ILIKE '%parfüm%'
OR COALESCE(p.name, '') ILIKE '%parfum%';

UPDATE public.products AS p
SET tax_rate = 1
WHERE NOT (
  EXISTS (
    SELECT 1
    FROM public.categories AS c
    WHERE c.id = p.category_id
      AND (
        c.slug ILIKE 'kozmetik%'
        OR c.name ILIKE '%kozmetik%'
        OR c.name ILIKE '%parfüm%'
        OR c.name ILIKE '%parfum%'
      )
  )
  OR COALESCE(p.slug, '') ILIKE '%parfum%'
  OR COALESCE(p.slug, '') ILIKE '%parfüm%'
  OR COALESCE(p.name, '') ILIKE '%parfüm%'
  OR COALESCE(p.name, '') ILIKE '%parfum%'
);

INSERT INTO public.site_settings (key, value)
VALUES (
  'shipping_config',
  jsonb_build_object(
    'flat_fee', 250,
    'free_threshold', 2000,
    'courier_name', ''
  )
)
ON CONFLICT (key) DO UPDATE
SET value = public.site_settings.value || jsonb_build_object(
  'flat_fee', 250,
  'free_threshold', 2000
);
