import { Link } from '@/i18n/navigation'
import { formatMirasJournalDate, listMirasJournalPosts } from '@/lib/miras-journal'

/** Hikâye sayfasında siyah bant; tam liste /blog */
export default function MirasJournalSection() {
  const posts = listMirasJournalPosts()

  return (
    <section className="miras-journal" aria-labelledby="miras-journal-heading">
      <style>{`
        .miras-journal {
          background-color: var(--color-charcoal-pure);
          color: var(--color-surface-container-lowest);
        }
        .miras-journal-inner {
          display: flex;
          flex-direction: column;
          gap: clamp(28px, 4vw, 40px);
        }
        .miras-journal-head {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
        }
        .miras-journal-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid var(--color-surface-container-lowest);
          padding: 14px 22px;
          font-family: var(--font-label-spec);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--color-surface-container-lowest);
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .miras-journal-cta:hover {
          color: var(--color-honey-amber);
          border-color: var(--color-honey-amber);
        }
        .miras-journal-cta:focus-visible {
          outline: 2px solid var(--color-honey-amber);
          outline-offset: 4px;
        }
        .miras-journal-list {
          display: flex;
          flex-direction: column;
        }
        .miras-journal-card {
          display: block;
          padding: 22px 0;
          border-bottom: 1px solid rgb(255 255 255 / 0.16);
          text-decoration: none;
          color: inherit;
          transition: opacity 0.2s ease;
        }
        .miras-journal-card:first-child {
          border-top: 1px solid rgb(255 255 255 / 0.16);
        }
        .miras-journal-card:hover {
          opacity: 0.82;
        }
        .miras-journal-card:focus-visible {
          outline: 2px solid var(--color-honey-amber);
          outline-offset: 4px;
        }
        @media (min-width: 720px) {
          .miras-journal-head {
            flex-direction: row;
            align-items: flex-end;
            justify-content: space-between;
            gap: 32px;
          }
        }
        @media (max-width: 640px) {
          .miras-journal-card { padding: 16px 0; }
        }
      `}</style>

      <div className="ed-section-inner ed-section-y">
        <div className="miras-journal-inner">
          <div className="miras-journal-head">
            <div>
              <p
                id="miras-journal-heading"
                style={{
                  fontFamily: 'var(--font-label-spec)',
                  fontSize: '11px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--color-honey-amber)',
                  margin: 0,
                }}
              >
                Hasat günlüğü
              </p>
              <h2
                style={{
                  fontFamily: 'var(--font-headline-md)',
                  fontSize: 'clamp(28px, 5vw, 40px)',
                  fontWeight: 400,
                  margin: '12px 0 8px',
                  color: 'var(--color-surface-container-lowest)',
                }}
              >
                Mirastan notlar
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-body-md)',
                  fontSize: '15px',
                  lineHeight: 1.65,
                  color: 'var(--color-surface-dim)',
                  maxWidth: '42rem',
                  margin: 0,
                }}
              >
                Hasat defterinden laboratuvar notlarına: Saitabat&apos;ın mevsimlik kayıtları.
              </p>
            </div>
            <Link href="/blog" className="miras-journal-cta">
              Tüm yazılar
            </Link>
          </div>

          <div className="miras-journal-list">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="miras-journal-card">
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px 16px',
                    alignItems: 'baseline',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-label-spec)',
                      fontSize: '10px',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--color-honey-amber)',
                    }}
                  >
                    {post.category}
                  </span>
                  <time
                    dateTime={post.publishedAt}
                    style={{
                      fontFamily: 'var(--font-label-spec)',
                      fontSize: '11px',
                      color: 'var(--color-surface-dim)',
                    }}
                  >
                    {formatMirasJournalDate(post.publishedAt)}
                  </time>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-headline-sm)',
                    fontSize: 'clamp(22px, 4vw, 28px)',
                    fontWeight: 500,
                    margin: '0 0 8px',
                    color: 'var(--color-surface-container-lowest)',
                  }}
                >
                  {post.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body-md)',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    margin: 0,
                    color: 'var(--color-surface-dim)',
                  }}
                >
                  {post.excerpt}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '12px',
                    fontFamily: 'var(--font-label-spec)',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-surface-container-lowest)',
                  }}
                >
                  Devamını oku →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
