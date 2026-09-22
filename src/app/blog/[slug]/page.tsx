import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import StaticPageLayout from '@/components/StaticPageLayout'
import { P, Eyebrow } from '@/components/StaticContent'
import {
  formatMirasJournalDate,
  getMirasJournalPost,
  MIRAS_JOURNAL_POSTS,
} from '@/lib/miras-journal'

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return MIRAS_JOURNAL_POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getMirasJournalPost(slug)
  if (!post) return { title: 'Yazı bulunamadı' }
  return {
    title: `${post.title} · Blog · Dr. Şenol Shop`,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getMirasJournalPost(slug)
  if (!post) notFound()

  return (
    <StaticPageLayout
      eyebrow={post.category}
      title={post.title}
      intro={`${formatMirasJournalDate(post.publishedAt)} · Hasat günlüğü`}
      breadcrumbs={[
        { label: 'Blog', href: '/blog' },
        { label: post.title },
      ]}
    >
      {post.body.map((paragraph, i) => (
        <P key={i}>{paragraph}</P>
      ))}

      <Eyebrow>Blog</Eyebrow>
      <P>
        <Link href="/blog" style={{ color: 'var(--color-honey-amber)', textDecoration: 'underline' }}>
          ← Tüm yazılar
        </Link>
      </P>
    </StaticPageLayout>
  )
}
