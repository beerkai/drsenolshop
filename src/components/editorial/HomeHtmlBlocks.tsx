import { sanitizeHomeHtml, type HomeHtmlBlock } from '@/lib/cms/home-html'

export default function HomeHtmlBlocks({ blocks }: { blocks: HomeHtmlBlock[] }) {
  const visible = blocks.filter((block) => block.enabled && block.html.trim().length > 0)
  if (visible.length === 0) return null

  return (
    <>
      <style>{`
        .home-html-block { width: 100%; overflow: hidden; }
        .home-html-block img,
        .home-html-block video { max-width: 100%; height: auto; }
      `}</style>
      {visible.map((block) => (
        <div
          key={block.id}
          className="home-html-block"
          dangerouslySetInnerHTML={{ __html: sanitizeHomeHtml(block.html) }}
        />
      ))}
    </>
  )
}
