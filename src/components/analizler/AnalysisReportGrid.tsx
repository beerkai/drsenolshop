import { analysisPdfUrl, type AnalysisSlot } from '@/lib/analysis-reports'

function slotLabel(slot: AnalysisSlot, index: number): string {
  const title = slot.title.trim()
  if (title) return title
  return `Boş slot ${String(index + 1).padStart(2, '0')}`
}

export default function AnalysisReportGrid({ slots }: { slots: AnalysisSlot[] }) {
  if (slots.length === 0) {
    return (
      <p style={{ margin: '8px 0 28px', color: 'var(--color-on-surface-variant)', fontFamily: 'var(--font-body-md)' }}>
        Yayımlanmış rapor henüz yok.
      </p>
    )
  }

  return (
    <div className="analiz-slots">
      <style>{`
        .analiz-slots {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin: 8px 0 36px;
        }
        @media (min-width: 640px) {
          .analiz-slots { grid-template-columns: 1fr 1fr; }
        }
        .analiz-slot {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
          min-height: 168px;
          padding: 20px;
          border: 1px solid var(--color-hairline-light);
          background: var(--color-surface-container-low);
          color: inherit;
          text-decoration: none;
        }
        .analiz-slot.is-empty {
          border-style: dashed;
          background: transparent;
        }
        a.analiz-slot:hover {
          border-color: var(--color-honey-amber);
        }
        .analiz-slot-kicker {
          margin: 0;
          font-family: var(--font-label-spec), ui-monospace, monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-honey-amber);
        }
        .analiz-slot-title {
          margin: 8px 0 0;
          font-family: var(--font-headline-sm), 'DM Sans', sans-serif;
          font-size: 22px;
          font-weight: 500;
          line-height: 1.2;
          color: var(--color-on-surface);
        }
        .analiz-slot-note {
          margin: 8px 0 0;
          font-family: var(--font-body-md), sans-serif;
          font-size: 14px;
          line-height: 1.45;
          color: var(--color-on-surface-variant);
        }
        .analiz-slot-meta {
          margin: 0;
          font-family: var(--font-label-spec), ui-monospace, monospace;
          font-size: 11px;
          line-height: 1.4;
          color: var(--color-on-surface-variant);
          word-break: break-all;
        }
      `}</style>

      {slots.map((slot, index) => {
        const url = analysisPdfUrl(slot.pdfPath)
        const title = slotLabel(slot, index)
        const body = (
          <>
            <div>
              <p className="analiz-slot-kicker" lang="en">
                {url ? 'PDF' : 'Slot'} · {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="analiz-slot-title">{title}</h3>
              {slot.note.trim() ? <p className="analiz-slot-note">{slot.note}</p> : null}
            </div>
            {url ? (
              <p className="analiz-slot-meta" lang="en">
                {url.replace(/^https:\/\//, '')}
              </p>
            ) : (
              <p className="analiz-slot-meta">
                <span lang="en">PDF</span> henüz yüklenmedi
              </p>
            )}
          </>
        )

        if (!url) {
          return (
            <article key={slot.id} className="analiz-slot is-empty">
              {body}
            </article>
          )
        }

        return (
          <a
            key={slot.id}
            className="analiz-slot"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {body}
          </a>
        )
      })}
    </div>
  )
}
