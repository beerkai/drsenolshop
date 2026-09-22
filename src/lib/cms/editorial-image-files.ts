// Editoryal görsel yükleme — istemci ve API'nin paylaştığı sınırlar.
// Sunucu modüllerini import etmez.

export const EDITORIAL_IMAGE_MAX_BYTES = 8 * 1024 * 1024

export const EDITORIAL_IMAGE_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/avif': 'avif',
}
