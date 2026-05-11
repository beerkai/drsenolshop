export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string | null;
  variant_value: string;
  sku: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
}

export interface Product {
  id: string;
  ikas_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  images: string[];
  metadata_title: string | null;
  metadata_description: string | null;
  is_active: boolean;
  created_at: string;
  product_variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProductWithCategory extends Product {
  categories: Category | null;
}
