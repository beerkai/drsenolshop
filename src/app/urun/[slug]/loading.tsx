import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SkeletonBox } from '@/components/SkeletonBox'

export default function UrunLoading() {
  return (
    <>
      <Header />
      <main>
        {/* Breadcrumb */}
        <div style={{ backgroundColor: '#0A0908', borderBottom: '1px solid rgba(244,240,232,0.05)' }}>
          <div className="px-responsive" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '14px', paddingBottom: '14px' }}>
            <SkeletonBox width={280} height={10} />
          </div>
        </div>

        {/* Ana ürün bölümü */}
        <section style={{ backgroundColor: '#0A0908', paddingTop: 'clamp(28px, 6vw, 48px)', paddingBottom: 'clamp(40px, 10vw, 80px)' }}>
          <div className="px-responsive" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div
              className="product-loading-grid"
              style={{ display: 'grid', gridTemplateColumns: '58% 1fr', gap: '56px', alignItems: 'start' }}
            >
              <style>{`
                @media (max-width: 768px) { .product-loading-grid { grid-template-columns: 1fr !important; gap: 28px !important; } }
              `}</style>

              {/* Galeri */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <SkeletonBox width="100%" height={undefined} style={{ aspectRatio: '4/5', height: 'auto' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBox key={i} width={68} height={85} />
                  ))}
                </div>
              </div>

              {/* Aksiyonlar */}
              <div>
                <SkeletonBox width={120} height={10} style={{ marginBottom: '20px' }} />
                <SkeletonBox width="90%" height={48} style={{ marginBottom: '12px' }} />
                <SkeletonBox width="70%" height={48} style={{ marginBottom: '28px' }} />
                <SkeletonBox width="100%" height={14} style={{ marginBottom: '8px' }} />
                <SkeletonBox width="80%" height={14} style={{ marginBottom: '28px' }} />
                <SkeletonBox width={36} height={1} style={{ marginBottom: '28px', background: '#C9A961' }} />
                <SkeletonBox width={160} height={36} style={{ marginBottom: '32px' }} />

                {/* Adet + buton */}
                <SkeletonBox width="100%" height={50} style={{ marginBottom: '12px' }} />
                <SkeletonBox width="100%" height={56} style={{ marginBottom: '28px' }} />

                {/* Meta */}
                <div style={{ borderTop: '1px solid rgba(244,240,232,0.08)', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <SkeletonBox width={80} height={10} />
                      <SkeletonBox width={120} height={12} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description placeholder */}
        <section style={{ backgroundColor: '#141210', paddingTop: '64px', paddingBottom: '64px', borderTop: '1px solid rgba(244,240,232,0.06)' }}>
          <div className="px-responsive" style={{ maxWidth: '760px', margin: '0 auto' }}>
            <SkeletonBox width={120} height={10} style={{ marginBottom: '32px' }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} width={i === 3 ? '60%' : '100%'} height={15} style={{ marginBottom: '12px' }} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
