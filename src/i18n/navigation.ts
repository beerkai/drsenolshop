import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Store bileşenleri `next/link` yerine buradan Link/usePathname/useRouter
// alır — mevcut locale'e göre href'i otomatik /en prefix'ler.
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
