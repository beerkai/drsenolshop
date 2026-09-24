import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import StaticPageLayout from '@/components/StaticPageLayout'
import { formatMirasJournalDate, listMirasJournalPosts } from '@/lib/miras-journal'

export const metadata: Metadata = {
  title: 'Blog · Dr. Şenol Shop',
  description:
    "Hasat defterinden laboratuvar notlarına: Saitabat'ın mevsimlik kayıtları.",
}

export default function BlogPage() {
  const posts = listMirasJournalPosts()

  return (
    <StaticPageLayout
      eyebrow="Hasat günlüğü"
      title="Mirastan notlar"
      intro="Hasat defterinden laboratuvar notlarına: Saitabat'ın mevsimlik kayıtları."
      breadcrumbs={[{ label: 'Blog' }]}
    >
      <style>{`
        .blog-list {
          display: flex;
          flex-direction: column;
          margin-top: 8px;
        }
        .blog-card {
          display: block;
          padding: 22px 0;
          border-bottom: 1px solid var(--color-hairline-light);
          text-decoration: none;
          color: inherit;
          transition: opacity 0.2s ease;
        }
        .blog-card:first-child {
          border-top: 1px solid var(--color-hairline-light);
        }
        .blog-card:hover { opacity: 0.82; }
        .blog-card:focus-visible {
          outline: 2px solid var(--color-honey-amber);
          outline-offset: 4px;
        }
        @media (max-width: 640px) {
          .blog-card { padding: 16px 0; }
        }
      `}</style>

      <div className="blog-list">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
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
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                {formatMirasJournalDate(post.publishedAt)}
              </time>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-headline-sm)',
                fontSize: 'clamp(22px, 4vw, 28px)',
                fontWeight: 500,
                margin: '0 0 8px',
                color: 'var(--color-on-surface)',
              }}
            >
              {post.title}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body-md)',
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
                fontFamily: 'var(--font-label-spec)',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-on-surface)',
              }}
            >
              Devamını oku →
            </span>
          </Link>
        ))}
      </div>
    </StaticPageLayout>
  )
}
