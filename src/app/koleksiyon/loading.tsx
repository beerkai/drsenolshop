import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SkeletonBox } from '@/components/SkeletonBox'

export default function KoleksiyonLoading() {
  return (
    <>
      <Header />
      <main style={{ backgroundColor: '#0A0908', minHeight: '70vh' }}>
        <div
          className="px-responsive"
          style={{ maxWidth: '1440px', margin: '0 auto', paddingTop: '48px', paddingBottom: '64px' }}
        >
          {/* Başlık skeleton */}
          <div style={{ marginBottom: '40px' }}>
            <SkeletonBox width={120} height={12} style={{ marginBottom: '14px' }} />
            <SkeletonBox width="60%" height={48} style={{ maxWidth: 480 }} />
            <SkeletonBox width="40%" height={16} style={{ marginTop: '14px', maxWidth: 320 }} />
          </div>

          {/* Filtre bar skeleton */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} width={90} height={36} />
            ))}
          </div>

          {/* Ürün grid skeleton */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1px',
              background: 'rgba(244,240,232,0.06)',
              border: '1px solid rgba(244,240,232,0.06)',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ background: '#0A0908', padding: '0' }}>
                <SkeletonBox width="100%" height={320} />
                <div style={{ padding: '18px 22px' }}>
                  <SkeletonBox width={80} height={10} style={{ marginBottom: '12px' }} />
                  <SkeletonBox width="75%" height={22} style={{ marginBottom: '10px' }} />
                  <SkeletonBox width="90%" height={14} style={{ marginBottom: '22px' }} />
                  <SkeletonBox width={100} height={22} />
                </div>
                <div style={{ borderTop: '1px solid rgba(244,240,232,0.08)', padding: '18px' }}>
                  <SkeletonBox width="50%" height={11} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
