# Ortak tasarım notları

Tüm template'ler ortak bir HTML iskeletini kullanır:
- Tek sütun, max 560px genişlik, mobil uyumlu
- Inline CSS (Outlook & Gmail klasik uyum için)
- Renkler: koyu zemin yerine açık zemin (yazılım uyumluluğu için) — gold accent
- Display font: serif (Georgia fallback, çünkü Cormorant external font e-postada yok)
- Buton min 44px tıklanabilir alan
- Dark mode renkleri `@media (prefers-color-scheme: dark)` ile override edilmiyor — sade kalsın

Logo placeholder: text wordmark ("Dr. Şenol" + "THE HONEY SCIENTIST") kullanılır. PNG logo eklemek istersen önce `public/email-logo.png` koy + her template'te `{{ .SiteURL }}/email-logo.png` referansını ekle.
