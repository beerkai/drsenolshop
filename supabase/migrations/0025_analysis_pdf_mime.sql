-- 0025 — Analiz PDF'leri products bucket üzerinden CDN'de yayınlanır.
-- cdn.drsenol.shop, products bucket path'lerini proxy'ler.
-- allowed_mime_types NULL ise tüm türler zaten serbesttir; kısıt varsa PDF eklenir.

UPDATE storage.buckets
SET allowed_mime_types = (
  SELECT ARRAY(
    SELECT DISTINCT mime
    FROM unnest(allowed_mime_types || ARRAY['application/pdf']::text[]) AS mime
  )
)
WHERE id = 'products'
  AND allowed_mime_types IS NOT NULL
  AND NOT ('application/pdf' = ANY (allowed_mime_types));

UPDATE storage.buckets
SET file_size_limit = 20971520
WHERE id = 'products'
  AND file_size_limit IS NOT NULL
  AND file_size_limit < 20971520;
