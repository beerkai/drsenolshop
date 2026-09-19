import Link from 'next/link'
import { listMirasJournalPosts } from '@/lib/miras-journal'

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Hikâye (miras) sayfasında statik hasat günlüğü / blog listesi */
export default function MirasJournalSection() {
  const posts = listMirasJournalPosts()

  return (
    <section className="miras-journal" aria-labelledby="miras-journal-heading">
      <style>{`
        .miras-journal {
          margin-top: clamp(48px, 8vw, 72px);
          padding-top: clamp(32px, 6vw, 48px);
          border-top: 1px solid var(--color-hairline-light);
        }
        .miras-journal-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 24px;
        }
        .miras-journal-card {
          display: block;
          padding: 20px 0;
          border-bottom: 1px solid var(--color-hairline-light);
          text-decoration: none;
          color: inherit;
          transition: opacity 0.2s ease;
        }
        .miras-journal-card:hover {
          opacity: 0.85;
        }
        .miras-journal-card:focus-visible {
          outline: 2px solid var(--color-honey-amber);
          outline-offset: 4px;
        }
        @media (max-width: 640px) {
          .miras-journal-card { padding: 16px 0; }
        }
      `}</style>

      <p
        id="miras-journal-heading"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--color-on-surface-variant)',
          margin: 0,
        }}
      >
        Hasat günlüğü
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 5vw, 40px)',
          fontWeight: 400,
          margin: '12px 0 8px',
          color: 'var(--color-on-surface)',
        }}
      >
        Mirastan notlar
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          lineHeight: 1.65,
          color: 'var(--color-on-surface-variant)',
          maxWidth: '42rem',
          margin: 0,
        }}
      >
        Hasat, analiz ve köy hikâyeleri — blog altyapısının ilk kayıtları. Yeni yazılar burada listelenecek.
      </p>

      <div className="miras-journal-list">
        {posts.map((post) => (
          <Link key={post.slug} href={`/hikaye/${post.slug}`} className="miras-journal-card">
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
                  fontFamily: 'var(--font-mono)',
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
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                {formatDate(post.publishedAt)}
              </time>
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 4vw, 28px)',
                fontWeight: 500,
                margin: '0 0 8px',
                color: 'var(--color-on-surface)',
              }}
            >
              {post.title}
            </h3>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                lineHeight: 1.6,
                margin: 0,
                color: 'var(--color-on-surface-variant)',
              }}
            >
              {post.excerpt}
            </p>
            <span
              style={{
                display: 'inline-block',
                marginTop: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-on-surface)',
              }}
              lang="en"
            >
              Devamını oku →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
