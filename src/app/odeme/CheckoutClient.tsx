'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/types'

interface ValidatedLine {
  productId: string
  variantId: string | null
  name: string
  slug: string
  image: string | null
  variantLabel: string | null
  unitPrice: number
  taxRate: number
  quantity: number
}
interface Totals {
  subtotal: number
  taxAmount: number
  shippingCost: number
  discountAmount: number
  total: number
}

type FormState = {
  email: string
  customer_name: string
  phone: string
  full_name: string
  address_line1: string
  address_line2: string
  city: string
  district: string
  postal_code: string
  notes: string
}

const initialForm: FormState = {
  email: '',
  customer_name: '',
  phone: '',
  full_name: '',
  address_line1: '',
  address_line2: '',
  city: '',
  district: '',
  postal_code: '',
  notes: '',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-jetbrains)',
  fontSize: '10px',
  letterSpacing: '0.22em',
  color: '#6E665A',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  backgroundColor: 'rgba(244,240,232,0.04)',
  border: '1px solid rgba(244,240,232,0.12)',
  color: '#F4F0E8',
  fontSize: '14px',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'border-color 0.2s',
}

export default function CheckoutClient() {
  const router = useRouter()
  const { items, dispatch } = useCart()
  const [validated, setValidated] = useState<{ lines: ValidatedLine[]; totals: Totals } | null>(null)
  const [validating, setValidating] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Sayfa yüklenince cart'ı doğrula
  useEffect(() => {
    if (items.length === 0) {
      setValidating(false)
      return
    }

    const cartItems = items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    }))

    fetch('/api/cart/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setValidated({ lines: data.lines, totals: data.totals })
        } else {
          setValidationError(data.message ?? 'Sepet doğrulanamadı')
        }
      })
      .catch(() => setValidationError('Sunucuya bağlanılamadı'))
      .finally(() => setValidating(false))
  }, [items])

  function updateField<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || !validated) return
    setSubmitting(true)
    setSubmitError(null)

    const payload = {
      customer_email: form.email,
      customer_name: form.customer_name,
      customer_phone: form.phone || undefined,
      shipping_address: {
        full_name: form.full_name || form.customer_name,
        phone: form.phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || undefined,
        city: form.city,
        district: form.district,
        postal_code: form.postal_code,
        country: 'TR',
      },
      payment_method: 'bank_transfer' as const,
      notes: form.notes || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setSubmitError(data.message ?? 'Sipariş oluşturulamadı')
        setSubmitting(false)
        return
      }

      // Başarılı — sepeti temizle, onay sayfasına yönlendir
      dispatch({ type: 'CLEAR' })
      router.push(`/siparis/${data.order_number}`)
    } catch {
      setSubmitError('Ağ hatası. Lütfen tekrar deneyin.')
      setSubmitting(false)
    }
  }

  // ─── Boş sepet
  if (!validating && items.length === 0) {
    return (
      <div className="px-responsive" style={{ maxWidth: '720px', margin: '0 auto', padding: '96px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Ödeme
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 500, margin: '0 0 24px' }}>
          Sepetiniz boş.
        </h1>
        <p style={{ color: '#B8B0A0', fontSize: '14px', marginBottom: '32px' }}>
          Önce sepetinize ürün ekleyin.
        </p>
        <Link href="/koleksiyon" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 28px', backgroundColor: '#C9A961', color: '#0A0908', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Koleksiyona Git →
        </Link>
      </div>
    )
  }

  // ─── Yükleniyor
  if (validating) {
    return (
      <div className="px-responsive" style={{ maxWidth: '720px', margin: '0 auto', padding: '96px 0', textAlign: 'center' }}>
        <p style={{ color: '#6E665A', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
          Sepet doğrulanıyor…
        </p>
      </div>
    )
  }

  // ─── Doğrulama hatası
  if (validationError || !validated) {
    return (
      <div className="px-responsive" style={{ maxWidth: '720px', margin: '0 auto', padding: '96px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C8472D', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Hata
        </p>
        <p style={{ color: '#F4F0E8', fontSize: '16px', marginBottom: '32px' }}>
          {validationError ?? 'Sepet doğrulanamadı.'}
        </p>
        <Link href="/koleksiyon" style={{ color: '#C9A961', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', textDecoration: 'none' }}>
          ← Alışverişe Dön
        </Link>
      </div>
    )
  }

  return (
    <div className="px-responsive" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '40px', paddingBottom: '80px' }}>
      <style>{`
        .checkout-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 48px;
          align-items: start;
        }
        .checkout-summary {
          position: sticky;
          top: 108px;
          background-color: #141210;
          padding: 28px;
          border: 1px solid rgba(244,240,232,0.06);
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr; gap: 32px; }
          .checkout-summary { position: static; padding: 20px; }
          .form-row-2 { grid-template-columns: 1fr; }
        }
        .ck-input:focus { border-color: #C9A961 !important; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 14px' }}>
          Adım 1 / 1 · Ödeme
        </p>
        <h1 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 500, lineHeight: 1.1, margin: 0 }}>
          Sipariş bilgileri.
        </h1>
      </div>

      <div className="checkout-grid">
        {/* SOL — Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* İletişim */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '20px', fontWeight: 500, marginBottom: '20px' }}>
              İletişim
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={LABEL_STYLE} htmlFor="email">E-mail</label>
              <input className="ck-input" id="email" type="email" required value={form.email} onChange={(e) => updateField('email', e.target.value)} style={INPUT_STYLE} placeholder="ornek@mail.com" />
            </div>
            <div className="form-row-2">
              <div>
                <label style={LABEL_STYLE} htmlFor="customer_name">Ad / Soyad</label>
                <input className="ck-input" id="customer_name" type="text" required value={form.customer_name} onChange={(e) => updateField('customer_name', e.target.value)} style={INPUT_STYLE} />
              </div>
              <div>
                <label style={LABEL_STYLE} htmlFor="phone">Telefon</label>
                <input className="ck-input" id="phone" type="tel" required value={form.phone} onChange={(e) => updateField('phone', e.target.value)} style={INPUT_STYLE} placeholder="0(5xx) xxx xx xx" />
              </div>
            </div>
          </section>

          {/* Teslimat Adresi */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '20px', fontWeight: 500, marginBottom: '20px' }}>
              Teslimat Adresi
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={LABEL_STYLE} htmlFor="address1">Adres (cadde, sokak, no)</label>
              <input className="ck-input" id="address1" type="text" required value={form.address_line1} onChange={(e) => updateField('address_line1', e.target.value)} style={INPUT_STYLE} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={LABEL_STYLE} htmlFor="address2">Apartman / Daire (ops.)</label>
              <input className="ck-input" id="address2" type="text" value={form.address_line2} onChange={(e) => updateField('address_line2', e.target.value)} style={INPUT_STYLE} />
            </div>
            <div className="form-row-2" style={{ marginBottom: '16px' }}>
              <div>
                <label style={LABEL_STYLE} htmlFor="district">İlçe</label>
                <input className="ck-input" id="district" type="text" required value={form.district} onChange={(e) => updateField('district', e.target.value)} style={INPUT_STYLE} />
              </div>
              <div>
                <label style={LABEL_STYLE} htmlFor="city">İl</label>
                <input className="ck-input" id="city" type="text" required value={form.city} onChange={(e) => updateField('city', e.target.value)} style={INPUT_STYLE} />
              </div>
            </div>
            <div>
              <label style={LABEL_STYLE} htmlFor="postal">Posta Kodu</label>
              <input className="ck-input" id="postal" type="text" value={form.postal_code} onChange={(e) => updateField('postal_code', e.target.value)} style={{ ...INPUT_STYLE, maxWidth: '200px' }} />
            </div>
          </section>

          {/* Notlar */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '20px', fontWeight: 500, marginBottom: '20px' }}>
              Sipariş Notu <span style={{ color: '#6E665A', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', marginLeft: '8px' }}>(ops.)</span>
            </h2>
            <textarea className="ck-input" rows={3} value={form.notes} onChange={(e) => updateField('notes', e.target.value)} style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: '90px', fontFamily: 'var(--font-sans)' }} placeholder="Teslimat tercihi, fatura bilgisi vb." />
          </section>

          {/* Ödeme yöntemi — şimdilik sadece havale */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '20px', fontWeight: 500, marginBottom: '20px' }}>
              Ödeme Yöntemi
            </h2>
            <div style={{ padding: '20px', border: '1px solid #C9A961', backgroundColor: 'rgba(201,169,97,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#C9A961', flexShrink: 0 }} />
                <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', letterSpacing: '0.18em', color: '#F4F0E8', textTransform: 'uppercase', margin: 0 }}>
                  Havale / EFT
                </p>
              </div>
              <p style={{ color: '#B8B0A0', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                Sipariş oluşturulduktan sonra banka bilgileri e-posta ile size iletilir. Ödemeniz onaylandıktan sonra kargoya verilir.
              </p>
            </div>
          </section>

          {submitError && (
            <div style={{ padding: '14px 16px', border: '1px solid #C8472D', backgroundColor: 'rgba(200,71,45,0.08)', color: '#F4F0E8', fontSize: '13px', marginBottom: '20px' }}>
              {submitError}
            </div>
          )}

          <button type="submit" disabled={submitting}
            style={{
              width: '100%',
              padding: '20px',
              backgroundColor: submitting ? '#9C7C3C' : '#C9A961',
              color: '#0A0908',
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '12px',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: submitting ? 'wait' : 'pointer',
            }}>
            {submitting ? 'Gönderiliyor…' : `Siparişi Tamamla · ${formatPrice(validated.totals.total)}`}
          </button>
        </form>

        {/* SAĞ — Özet */}
        <aside className="checkout-summary">
          <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.3em', color: '#C9A961', textTransform: 'uppercase', margin: '0 0 20px' }}>
            Sipariş Özeti
          </p>

          <div style={{ marginBottom: '24px' }}>
            {validated.lines.map((line) => (
              <div key={`${line.productId}:${line.variantId ?? 'base'}`} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(244,240,232,0.06)' }}>
                <div style={{ width: '60px', height: '75px', flexShrink: 0, backgroundColor: '#0A0908', position: 'relative' }}>
                  {line.image ? (
                    <Image src={line.image} alt={line.name} fill sizes="60px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3A3530', fontSize: '10px' }}>—</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '15px', fontWeight: 500, lineHeight: 1.3, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {line.name}
                  </p>
                  {line.variantLabel && (
                    <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', letterSpacing: '0.18em', color: '#6E665A', textTransform: 'uppercase', margin: '0 0 6px' }}>
                      {line.variantLabel}
                    </p>
                  )}
                  <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#B8B0A0', margin: 0 }}>
                    {line.quantity} × {formatPrice(line.unitPrice)}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <p style={{ fontFamily: 'var(--font-cormorant)', color: '#F4F0E8', fontSize: '15px', fontWeight: 500, margin: 0 }}>
                    {formatPrice(line.unitPrice * line.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(244,240,232,0.08)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: '#B8B0A0' }}>
              <span>Ara Toplam</span>
              <span>{formatPrice(validated.totals.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jetbrains)', fontSize: '11px', color: '#6E665A' }}>
              <span>· içerisinde KDV</span>
              <span>{formatPrice(validated.totals.taxAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jetbrains)', fontSize: '12px', color: '#B8B0A0' }}>
              <span>Kargo</span>
              <span style={{ color: '#5C7A3F' }}>Ücretsiz</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(244,240,232,0.12)', marginTop: '20px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '11px', letterSpacing: '0.22em', color: '#F4F0E8', textTransform: 'uppercase' }}>Toplam</span>
            <span style={{ fontFamily: 'var(--font-cormorant)', color: '#C9A961', fontSize: '28px', fontWeight: 500 }}>
              {formatPrice(validated.totals.total)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  )
}
