import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface BaseProps {
  variant?: Variant
  size?: Size
  iconLeft?: ReactNode
  iconRight?: ReactNode
  kbd?: string
  children: ReactNode
}

const variantClass: Record<Variant, string> = {
  primary: 'ad-btn-primary',
  secondary: 'ad-btn-secondary',
  ghost: 'ad-btn-ghost',
  danger: 'ad-btn-danger',
}

function classes(variant: Variant, size: Size, extra?: string) {
  const cls = ['ad-btn', variantClass[variant]]
  if (size === 'sm') cls.push('ad-btn-sm')
  if (extra) cls.push(extra)
  return cls.join(' ')
}

export function Button({
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  kbd,
  children,
  className,
  ...rest
}: BaseProps & ComponentProps<'button'>) {
  return (
    <button {...rest} className={classes(variant, size, className)}>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
      {kbd && <span className="ad-kbd">{kbd}</span>}
    </button>
  )
}

export function LinkButton({
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  kbd,
  children,
  className,
  ...rest
}: BaseProps & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={classes(variant, size, className)}>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
      {kbd && <span className="ad-kbd">{kbd}</span>}
    </Link>
  )
}

export function IconButton({
  children,
  className,
  ...rest
}: { children: ReactNode } & ComponentProps<'button'>) {
  return (
    <button {...rest} className={['ad-icon-btn', className].filter(Boolean).join(' ')}>
      {children}
    </button>
  )
}
