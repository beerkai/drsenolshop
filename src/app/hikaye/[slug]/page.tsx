import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, Eyebrow } from '@/components/StaticContent'
import { getMirasJournalPost, listMirasJournalPosts, MIRAS_JOURNAL_POSTS } from '@/lib/miras-journal'
import { getSiteUrl } from '@/lib/site-url'

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return MIRAS_JOURNAL_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getMirasJournalPost(slug)
  if (!post) return { title: 'Yazı bulunamadı' }
  return {
    title: `${post.title} · Miras · Dr. Şenol Shop`,
    description: post.excerpt,
  }
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function MirasJournalPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getMirasJournalPost(slug)
  if (!post) notFound()

  const siteUrl = getSiteUrl()

  return (
    <StaticPageLayout
      eyebrow={post.category}
      title={post.title}
      intro={`${formatDate(post.publishedAt)} · Hasat günlüğü`}
      breadcrumbs={[
        { label: 'Hikâyemiz', href: '/hikaye' },
        { label: post.title },
      ]}
    >
      {post.body.map((paragraph, i) => (
        <P key={i}>{paragraph}</P>
      ))}

      <Eyebrow>Miras</Eyebrow>
      <P>
        <Link href="/hikaye" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          ← Tüm miras ve hasat günlüğü
        </Link>
        {' · '}
        <a href={siteUrl} style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          {siteUrl.replace(/^https:\/\//, '')}
        </a>
      </P>
    </StaticPageLayout>
  )
}
