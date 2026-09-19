import Image from 'next/image'
import { getImageUrl } from '@/lib/images'
import type { EditorialImage } from '@/types/editorial-home'

type Props = {
  image: EditorialImage
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
}

export default function EditorialPicture({
  image,
  className,
  priority,
  sizes = '(max-width: 1024px) 50vw, 380px',
  fill = true,
  width,
  height,
}: Props) {
  const src = getImageUrl(image.src)
  if (fill) {
    return (
      <Image
        src={src}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={className}
      />
    )
  }
  return (
    <Image
      src={src}
      alt={image.alt}
      width={width ?? 1200}
      height={height ?? 800}
      priority={priority}
      sizes={sizes}
      className={className}
    />
  )
}
