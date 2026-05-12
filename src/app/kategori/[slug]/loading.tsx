import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SkeletonBox } from '@/components/SkeletonBox'

export default function KategoriLoading() {
  return (
    <>
      <Header />
      <main style={{ backgroundColor: '#0A0908', minHeight: '70vh' }}>
        {/* Kategori Hero */}
        <section style={{ paddingTop: 'clamp(48px, 8vw, 96px)', paddingBottom: 'clamp(40px, 6vw, 72px)' }}>
          <div className="px-responsive" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <SkeletonBox width={140} height={11} style={{ marginBottom: '20px' }} />
            <SkeletonBox width={60} height={1} style={{ marginBottom: '32px', background: '#C9A961' }} />
            <SkeletonBox width="60%" height={56} style={{ maxWidth: 520, marginBottom: '20px' }} />
            <SkeletonBox width="45%" height={16} style={{ maxWidth: 420 }} />
          </div>
        </section>

        {/* Grid */}
        <section style={{ paddingBottom: '96px' }}>
          <div className="px-responsive" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1px',
                background: 'rgba(244,240,232,0.06)',
                border: '1px solid rgba(244,240,232,0.06)',
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: '#0A0908' }}>
                  <SkeletonBox width="100%" height={320} />
                  <div style={{ padding: '18px 22px' }}>
                    <SkeletonBox width={80} height={10} style={{ marginBottom: '12px' }} />
                    <SkeletonBox width="75%" height={22} style={{ marginBottom: '10px' }} />
                    <SkeletonBox width="90%" height={14} style={{ marginBottom: '22px' }} />
                    <SkeletonBox width={100} height={22} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
