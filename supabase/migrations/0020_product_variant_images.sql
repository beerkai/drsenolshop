-- Varyant bazlı galeri (850 gr / 355 gr fotoğrafları ayrı listelenebilir)
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS images TEXT[];
