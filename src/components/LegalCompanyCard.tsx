// ═══════════════════════════════════════════════════════════════
// Yasal sayfalarda satıcı / veri sorumlusu kimlik kartı
// ─ Boş veya env ile doldurulmamış alanlar basılmaz
// ═══════════════════════════════════════════════════════════════

import { getLegalCompany } from '@/lib/legal-info'
import { InfoBox } from '@/components/StaticContent'

interface Props {
  title?: string
}

export default function LegalCompanyCard({ title = 'Satıcı' }: Props) {
  const co = getLegalCompany()

  return (
    <InfoBox title={title}>
      <p style={{ margin: 0 }}>
        {co.legal_name}
        <br />
        {co.address}
        {co.city_country ? (
          <>
            <br />
            {co.city_country}
          </>
        ) : null}
        <br />
        E-posta:{' '}
        <a href={`mailto:${co.email}`} style={{ color: 'var(--color-honey-amber)' }} lang="en">
          {co.email}
        </a>
        {co.phone ? (
          <>
            <br />
            Telefon: {co.phone}
          </>
        ) : null}
        {co.tax_office || co.tax_number ? (
          <>
            <br />
            Vergi Dairesi / VKN: {[co.tax_office, co.tax_number].filter(Boolean).join(' / ')}
          </>
        ) : null}
        {co.mersis ? (
          <>
            <br />
            MERSIS: {co.mersis}
          </>
        ) : null}
        {co.kep ? (
          <>
            <br />
            KEP: {co.kep}
          </>
        ) : null}
      </p>
    </InfoBox>
  )
}
