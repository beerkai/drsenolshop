const fs = require('fs');
const csv = require('csv-parser');
const crypto = require('crypto');
const path = require('path');

const escapeSQL = (str) => {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
};

const slugify = (text) => {
  if (!text) return '';
  const trMap = {
    'çÇ': 'c',
    'ğĞ': 'g',
    'şŞ': 's',
    'üÜ': 'u',
    'ıİ': 'i',
    'öÖ': 'o'
  };
  let result = text;
  for (const key in trMap) {
    result = result.replace(new RegExp(`[${key}]`, 'g'), trMap[key]);
  }
  return result.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const products = new Map();
const categories = new Map();
const variants = [];

const csvPath = path.join(__dirname, '../user-added/ikas-urunler.csv');

fs.createReadStream(csvPath)
  .pipe(csv({ mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '').replace(/^"/, '').replace(/"$/, '') }))
  .on('data', (row) => {
    // Skip empty rows
    if (!row['Ürün Grup ID']) return;

    // 1. Process Category
    const catRaw = row['Kategoriler'] || 'Genel';
    const catName = catRaw.split(';')[0].split('>').join(' > ');
    let catSlug = slugify(catName);
    if (!catSlug) catSlug = 'genel';
    
    if (!categories.has(catSlug)) {
      categories.set(catSlug, {
        id: crypto.randomUUID(),
        name: catName,
        slug: catSlug
      });
    }
    
    const categoryId = categories.get(catSlug).id;

    // 2. Process Product
    const ikasGroupId = row['Ürün Grup ID'];
    let product;
    if (!products.has(ikasGroupId)) {
      product = {
        id: crypto.randomUUID(),
        ikas_id: ikasGroupId,
        name: row['İsim'] || 'İsimsiz',
        slug: row['Slug'] || slugify(row['İsim']),
        description: row['Açıklama'] || '',
        category_id: categoryId,
        images: row['Resim URL'] ? row['Resim URL'].split(';').filter(Boolean) : [],
        metadata_title: row['Metadata Başlık'] || '',
        metadata_description: row['Metadata Açıklama'] || '',
      };
      products.set(ikasGroupId, product);
    } else {
      product = products.get(ikasGroupId);
    }

    // 3. Process Variant
    const priceStr = String(row['Satış Fiyatı']).replace(',', '.');
    const discountStr = String(row['İndirimli Fiyatı']).replace(',', '.');
    const stockStr = row['Stok:Ana Depo'];
    
    variants.push({
      id: crypto.randomUUID(),
      product_id: product.id,
      ikas_variant_id: row['Varyant ID'],
      variant_type: row['Varyant Tip 1'] || 'Standart',
      variant_value: row['Varyant Değer 1'] || 'Standart',
      sku: row['SKU'] || '',
      price: parseFloat(priceStr) || 0,
      discount_price: parseFloat(discountStr) || null,
      stock: parseInt(stockStr, 10) || 0,
    });
  })
  .on('end', () => {
    let sql = `-- Otomatik oluşturulan Seed SQL\n\n`;

    // Write Categories
    sql += `-- Kategoriler\n`;
    for (const cat of categories.values()) {
      sql += `INSERT INTO categories (id, name, slug) VALUES ('${cat.id}', ${escapeSQL(cat.name)}, ${escapeSQL(cat.slug)}) ON CONFLICT (slug) DO NOTHING;\n`;
    }

    // Write Products
    sql += `\n-- Ürünler\n`;
    for (const prod of products.values()) {
      const imagesArray = prod.images.length > 0 
        ? `ARRAY[${prod.images.map(img => escapeSQL(img)).join(', ')}]` 
        : `'{}'`;
      
      sql += `INSERT INTO products (id, ikas_id, name, slug, description, category_id, images, metadata_title, metadata_description) VALUES ` +
             `('${prod.id}', ${escapeSQL(prod.ikas_id)}, ${escapeSQL(prod.name)}, ${escapeSQL(prod.slug)}, ${escapeSQL(prod.description)}, '${prod.category_id}', ${imagesArray}, ${escapeSQL(prod.metadata_title)}, ${escapeSQL(prod.metadata_description)}) ` +
             `ON CONFLICT (ikas_id) DO NOTHING;\n`;
    }

    // Write Variants
    sql += `\n-- Varyantlar\n`;
    for (const variant of variants) {
      const discount = isNaN(variant.discount_price) || variant.discount_price === null ? 'NULL' : variant.discount_price;
      
      sql += `INSERT INTO product_variants (id, product_id, ikas_variant_id, variant_type, variant_value, sku, price, discount_price, stock) VALUES ` +
             `('${variant.id}', '${variant.product_id}', ${escapeSQL(variant.ikas_variant_id)}, ${escapeSQL(variant.variant_type)}, ${escapeSQL(variant.variant_value)}, ${escapeSQL(variant.sku)}, ${variant.price}, ${discount}, ${variant.stock}) ` +
             `ON CONFLICT (ikas_variant_id) DO NOTHING;\n`;
    }

    const outPath = path.join(__dirname, '../seed.sql');
    fs.writeFileSync(outPath, sql, 'utf8');
    console.log(`Bitti! seed.sql dosyası oluşturuldu. Toplam ${products.size} ürün ve ${variants.length} varyant eklendi.`);
  });
