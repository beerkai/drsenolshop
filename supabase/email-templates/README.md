# Supabase Türkçe E-posta Template'leri

Bu klasördeki HTML dosyaları, Supabase Dashboard → **Authentication → Email Templates** altına yapıştırılacak.

## Yapıştırma sırası

Her template için:
1. **Authentication → Email Templates** sekmesinde ilgili template'i seç (Confirm signup, Magic Link, vb.)
2. **Subject** alanına aşağıdaki başlığı gir
3. **Message body** alanına ilgili `.html` dosyasının içeriğini yapıştır
4. **Save**

Aşağıdaki Supabase değişkenleri çalışır:
- `{{ .ConfirmationURL }}` — onay/sıfırlama/davet linki
- `{{ .Token }}` — 6 haneli OTP kodu (kullanmıyoruz)
- `{{ .Email }}` — kullanıcının e-postası
- `{{ .SiteURL }}` — Dashboard'daki Site URL değeri

## Template'ler

| Template | Subject | Dosya |
|----------|---------|-------|
| **Confirm signup** | Dr. Şenol — Hesabınızı onaylayın | `confirm-signup.html` |
| **Magic Link** | Dr. Şenol — Tek kullanımlık giriş linki | `magic-link.html` |
| **Reset Password** | Dr. Şenol — Şifre sıfırlama isteği | `reset-password.html` |
| **Change Email** | Dr. Şenol — E-posta adresinizi onaylayın | `change-email.html` |
| **Invite User** | Dr. Şenol — Hesap daveti | `invite-user.html` |

## Önemli

- Reset Password ve Confirm Signup template'lerindeki `{{ .ConfirmationURL }}`, bizim register/reset endpoint'lerinde `emailRedirectTo` olarak gönderdiğimiz URL'yi içerir → `https://drsenolnaturalhoney.shop/auth/callback?next=...`
- Site URL ve Redirect URLs Supabase Dashboard'da doğru ayarlı olmalı (yoksa Supabase Site URL'e fallback eder)
- Custom SMTP (Resend) bağlı — gönderici adresi orada belirlenir
