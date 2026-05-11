-- 1. Tabloları temizleme (Eğer önceden varsa sıfırlar)
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 2. Kategoriler Tablosu
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Ürünler Tablosu
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ikas_id TEXT UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images TEXT[],
  metadata_title TEXT,
  metadata_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ürün Varyantları Tablosu
CREATE TABLE product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  ikas_variant_id TEXT UNIQUE,
  variant_type TEXT,
  variant_value TEXT,
  sku TEXT,
  price NUMERIC NOT NULL,
  discount_price NUMERIC,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Güvenlik (RLS - Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Sadece Okuma (Select) izinleri - Herkes görebilir
CREATE POLICY "Kategorileri herkes okuyabilir" ON categories FOR SELECT USING (true);
CREATE POLICY "Ürünleri herkes okuyabilir" ON products FOR SELECT USING (true);
CREATE POLICY "Varyantları herkes okuyabilir" ON product_variants FOR SELECT USING (true);

-- Öne çıkan ürünler ve kart alanları (eksikse Supabase SQL Editor’da çalıştırın)
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS default_variant_label TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
