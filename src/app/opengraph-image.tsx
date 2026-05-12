import { ImageResponse } from 'next/og'

export const alt = 'Dr. Şenol — The Honey Scientist'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0908',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          fontFamily: 'serif',
        }}
      >
        {/* Sol üst tag */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div style={{ width: 2, height: 36, background: '#C9A961' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                color: '#C9A961',
                fontSize: 14,
                letterSpacing: 4,
                fontFamily: 'monospace',
              }}
            >
              LOT NO. 2026/Q1
            </div>
            <div
              style={{
                color: '#9B9285',
                fontSize: 13,
                letterSpacing: 3,
                marginTop: 4,
                fontFamily: 'monospace',
              }}
            >
              HASAT · İLKBAHAR
            </div>
          </div>
        </div>

        {/* Sağ üst */}
        <div
          style={{
            position: 'absolute',
            top: 56,
            right: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              color: '#9B9285',
              fontSize: 13,
              letterSpacing: 3,
              fontFamily: 'monospace',
            }}
          >
            AKTİF KOVAN
          </div>
          <div
            style={{
              color: '#C9A961',
              fontSize: 28,
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            1,247
          </div>
        </div>

        {/* Orta */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              color: '#C9A961',
              fontSize: 16,
              letterSpacing: 6,
              marginBottom: 28,
              fontFamily: 'monospace',
            }}
          >
            THE HONEY SCIENTIST
          </div>
          <div
            style={{
              width: 80,
              height: 1,
              background: '#C9A961',
              marginBottom: 36,
            }}
          />
          <div
            style={{
              color: '#F4F0E8',
              fontSize: 130,
              fontWeight: 500,
              letterSpacing: -3,
              lineHeight: 1,
              display: 'flex',
              gap: 18,
              alignItems: 'baseline',
            }}
          >
            <span>Doğanın</span>
            <span style={{ color: '#C9A961', fontStyle: 'italic', fontWeight: 300 }}>en saf</span>
            <span>hâli.</span>
          </div>
          <div
            style={{
              color: '#B8B0A0',
              fontSize: 22,
              marginTop: 36,
              maxWidth: 720,
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            1985&apos;ten beri Saitabat Köyü&apos;nde, her damla balın arkasında bir bilim insanının imzası.
          </div>
        </div>

        {/* Alt bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            left: 60,
            right: 60,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 24,
            borderTop: '1px solid rgba(244,240,232,0.1)',
          }}
        >
          <div
            style={{
              color: '#9B9285',
              fontSize: 13,
              letterSpacing: 3,
              fontFamily: 'monospace',
            }}
          >
            EST. 1985 · SAITABAT, BURSA
          </div>
          <div
            style={{
              color: '#C9A961',
              fontSize: 13,
              letterSpacing: 3,
              fontFamily: 'monospace',
            }}
          >
            DRSENOL.SHOP
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
