import type { Metadata } from 'next'
import Link from 'next/link'
import { getLocale, type Locale } from '@/lib/i18n/locale'
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  SITE_DIRECTIONS_URL,
  SITE_EMAILS,
  SITE_WHATSAPP_DISPLAY,
  SITE_WHATSAPP_URL,
  mailto,
} from '@/lib/site-contact'

// Kavanoz QR'ları bu yolu basılıyor — pathname değişmez.
const PATH = '/pages/link-tree'

function localePath(path: string, locale: Locale): string {
  return locale === 'en' ? `/en${path}` : path
}

type LinkId = 'collection' | 'instagram' | 'whatsapp' | 'maps' | 'story'

interface TreeLink {
  id: LinkId
  label: string
  hint: string
  href: string
  external: boolean
  lang?: 'en'
  primary?: boolean
}

interface Copy {
  metaTitle: string
  metaDescription: string
  langLabel: string
  place: string
  links: TreeLink[]
  track: string
}

function whatsappHref(locale: Locale): string {
  const text =
    locale === 'en'
      ? 'Hello, I scanned the QR code on the jar.'
      : 'Merhaba, kavanoz üzerindeki QR kodundan yazıyorum.'
  return `${SITE_WHATSAPP_URL}?text=${encodeURIComponent(text)}`
}

function copyFor(locale: Locale): Copy {
  if (locale === 'en') {
    return {
      metaTitle: 'Links',
      metaDescription:
        'The Dr. Şenol collection, Instagram, WhatsApp, and directions to the Saitabat workshop.',
      langLabel: 'Language',
      place: 'Saitabat Village · Bursa',
      links: [
        {
          id: 'collection',
          label: 'Our Collection',
          hint: 'Shop the range',
          href: localePath('/koleksiyon', locale),
          external: false,
          lang: 'en',
          primary: true,
        },
        {
          id: 'instagram',
          label: 'Instagram',
          hint: INSTAGRAM_HANDLE,
          href: INSTAGRAM_URL,
          external: true,
          lang: 'en',
        },
        {
          id: 'whatsapp',
          label: 'WhatsApp',
          hint: SITE_WHATSAPP_DISPLAY,
          href: whatsappHref(locale),
          external: true,
          lang: 'en',
        },
        {
          id: 'maps',
          label: 'Google Maps',
          hint: 'Directions to the workshop',
          href: SITE_DIRECTIONS_URL,
          external: true,
          lang: 'en',
        },
        {
          id: 'story',
          label: 'Our Story',
          hint: 'Since 1985',
          href: localePath('/hikaye', locale),
          external: false,
          lang: 'en',
        },
      ],
      track: 'Track an order',
    }
  }

  return {
    metaTitle: 'Bağlantılar',
    metaDescription:
      'Dr. Şenol koleksiyonu, Instagram, WhatsApp ve Saitabat atölyesine yol tarifi.',
    langLabel: 'Dil',
    place: 'Saitabat Köyü · Bursa',
    links: [
      {
        id: 'collection',
        label: 'Koleksiyonumuz',
        hint: 'Tüm ürünler',
        href: localePath('/koleksiyon', locale),
        external: false,
        primary: true,
      },
      {
        id: 'instagram',
        label: 'Instagram',
        hint: INSTAGRAM_HANDLE,
        href: INSTAGRAM_URL,
        external: true,
        lang: 'en',
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        hint: SITE_WHATSAPP_DISPLAY,
        href: whatsappHref(locale),
        external: true,
        lang: 'en',
      },
      {
        id: 'maps',
        label: 'Google Maps',
        hint: 'Atölyeye yol tarifi',
        href: SITE_DIRECTIONS_URL,
        external: true,
        lang: 'en',
      },
      {
        id: 'story',
        label: 'Hikâyemiz',
        hint: "1985'ten beri",
        href: localePath('/hikaye', locale),
        external: false,
      },
    ],
    track: 'Sipariş takibi',
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const copy = copyFor(locale)
  const canonical = locale === 'en' ? `/en${PATH}` : PATH

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical,
      languages: {
        tr: PATH,
        en: `/en${PATH}`,
      },
    },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      locale: locale === 'en' ? 'en_US' : 'tr_TR',
    },
  }
}

export default async function LinkTreePage() {
  const locale = await getLocale()
  const copy = copyFor(locale)

  return (
    <main className="lt">
      <style>{`
        .lt {
          min-height: 100dvh;
          background: var(--color-bone);
          color: var(--color-ink);
          display: flex;
          justify-content: center;
          padding:
            max(20px, env(safe-area-inset-top))
            20px
            max(28px, env(safe-area-inset-bottom));
        }
        .lt-inner {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          padding-top: clamp(12px, 4vh, 48px);
          padding-bottom: 24px;
        }
        .lt-lang {
          display: flex;
          align-self: center;
          gap: 4px;
          margin: 0 0 36px;
          padding: 4px;
          border: 1px solid rgba(21, 17, 13, 0.16);
          background: rgba(255, 255, 255, 0.45);
        }
        .lt-lang a {
          min-width: 72px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          text-decoration: none;
          font-family: var(--font-label-spec);
          font-size: var(--text-label-spec);
          letter-spacing: 0.16em;
          color: var(--color-text-muted);
          -webkit-tap-highlight-color: transparent;
        }
        .lt-lang a[aria-current="page"] {
          background: var(--color-ink);
          color: var(--color-bone);
        }
        .lt-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          text-decoration: none;
          color: inherit;
          margin-bottom: 32px;
        }
        .lt-name {
          font-family: var(--font-nav-caps);
          font-weight: 400;
          font-size: 22px;
          line-height: 1;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }
        .lt-kicker {
          margin-top: 14px;
          font-family: var(--font-nav-caps);
          font-size: var(--text-nav-caps);
          font-weight: var(--text-nav-caps--font-weight);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--color-honey-amber);
        }
        .lt-place {
          margin-top: 8px;
          font-family: var(--font-body-sm);
          font-size: var(--text-body-sm);
          font-weight: var(--text-body-sm--font-weight);
          letter-spacing: var(--text-body-sm--letter-spacing);
          color: var(--color-text-muted);
        }
        .lt-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .lt-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 68px;
          padding: 12px 14px 12px 16px;
          text-decoration: none;
          color: var(--color-ink);
          background: #fff;
          border: 1px solid rgba(21, 17, 13, 0.12);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }
        .lt-btn-primary {
          background: var(--color-ink);
          border-color: var(--color-ink);
          color: var(--color-bone);
        }
        .lt-ico {
          width: 22px;
          height: 22px;
          flex: 0 0 22px;
          color: var(--color-gold-deep);
        }
        .lt-btn-primary .lt-ico { color: var(--color-gold); }
        .lt-copy {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lt-label {
          font-family: var(--font-nav-caps);
          font-size: 13px;
          font-weight: var(--text-nav-caps--font-weight);
          letter-spacing: 0.14em;
          line-height: 1.2;
          text-transform: uppercase;
        }
        .lt-hint {
          font-family: var(--font-body-sm);
          font-size: var(--text-body-sm);
          font-weight: var(--text-body-sm--font-weight);
          letter-spacing: var(--text-body-sm--letter-spacing);
          line-height: 1.3;
          color: var(--color-text-muted);
        }
        .lt-btn-primary .lt-hint { color: rgba(244, 240, 232, 0.62); }
        .lt-go {
          width: 16px;
          height: 16px;
          flex: 0 0 16px;
          opacity: 0.55;
        }
        .lt-btn:focus-visible {
          outline: 2px solid var(--color-gold);
          outline-offset: 3px;
        }
        .lt-btn:active {
          background: var(--color-ink);
          border-color: var(--color-ink);
          color: var(--color-bone);
        }
        .lt-btn:active .lt-ico { color: var(--color-gold); }
        .lt-btn:active .lt-hint { color: rgba(244, 240, 232, 0.62); }
        @media (hover: hover) {
          .lt-btn:hover {
            border-color: var(--color-ink);
          }
          .lt-btn-primary:hover {
            background: var(--color-ink-3);
          }
        }
        .lt-foot {
          margin-top: auto;
          padding-top: 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }
        .lt-foot a {
          font-family: var(--font-body-sm);
          font-size: var(--text-body-sm);
          color: var(--color-text-muted);
          text-decoration: none;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
        }
        .lt-foot a:hover { color: var(--color-ink); }
        .lt-year {
          font-family: var(--font-label-spec);
          font-size: var(--text-label-spec);
          letter-spacing: 0.16em;
          color: var(--color-text-faint);
        }
      `}</style>

      <div className="lt-inner">
        <nav className="lt-lang" aria-label={copy.langLabel}>
          <Link
            href={PATH}
            hrefLang="tr"
            lang="tr"
            aria-current={locale === 'tr' ? 'page' : undefined}
          >
            TR
          </Link>
          <Link
            href={`/en${PATH}`}
            hrefLang="en"
            lang="en"
            aria-current={locale === 'en' ? 'page' : undefined}
          >
            EN
          </Link>
        </nav>

        <Link href={localePath('/', locale)} className="lt-brand" aria-label="Dr. Şenol">
          <span className="lt-name" lang="tr">
            Dr. Şenol
          </span>
          <span className="lt-kicker" lang="en">
            The Honey Scientist
          </span>
          <span className="lt-place" lang={locale}>
            {copy.place}
          </span>
        </Link>

        <ul className="lt-list">
          {copy.links.map((link) => (
            <li key={link.id}>
              <TreeButton link={link} />
            </li>
          ))}
        </ul>

        <footer className="lt-foot">
          <Link href={localePath('/siparis-takibi', locale)}>{copy.track}</Link>
          <a href={mailto(SITE_EMAILS.hello)} lang="en">
            {SITE_EMAILS.hello}
          </a>
          <span className="lt-year">1985</span>
        </footer>
      </div>
    </main>
  )
}

function TreeButton({ link }: { link: TreeLink }) {
  const className = link.primary ? 'lt-btn lt-btn-primary' : 'lt-btn'
  const inner = (
    <>
      <LinkIcon id={link.id} />
      <span className="lt-copy">
        <span className="lt-label">{link.label}</span>
        <span className="lt-hint" lang={link.id === 'instagram' || link.id === 'whatsapp' ? 'en' : undefined}>
          {link.hint}
        </span>
      </span>
      {link.external ? <ExternalIcon /> : <ChevronIcon />}
    </>
  )

  if (link.external) {
    return (
      <a
        className={className}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        lang={link.lang}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link className={className} href={link.href} lang={link.lang}>
      {inner}
    </Link>
  )
}

function LinkIcon({ id }: { id: LinkId }) {
  const common = {
    className: 'lt-ico',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  if (id === 'collection') {
    return (
      <svg {...common}>
        <path d="M8 9h8v10.2a1.8 1.8 0 0 1-1.8 1.8h-4.4A1.8 1.8 0 0 1 8 19.2V9z" />
        <path d="M9.2 9V7.2A1.2 1.2 0 0 1 10.4 6h3.2a1.2 1.2 0 0 1 1.2 1.2V9" />
        <path d="M8 13.2h8" />
      </svg>
    )
  }
  if (id === 'instagram') {
    return (
      <svg {...common}>
        <rect x="4.5" y="4.5" width="15" height="15" rx="4" />
        <circle cx="12" cy="12" r="3.4" />
        <circle cx="16.6" cy="7.5" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (id === 'whatsapp') {
    return (
      <svg {...common}>
        <path d="M7.2 17.8 5.4 19.2c-.3.2-.7 0-.7-.4V16A7.2 7.2 0 1 1 8 18.6" />
        <path d="M9.2 10.2c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.6 1.4c.1.2 0 .5-.2.6l-.5.4c.4.8 1.1 1.4 1.9 1.8l.5-.4c.2-.2.5-.2.7 0l1.3.7c.2.1.3.4.3.6v.5c0 .3-.2.6-.6.7-.9.2-2.6.1-4.4-1.6-1.6-1.5-2-3-1.9-3.9z" />
      </svg>
    )
  }
  if (id === 'maps') {
    return (
      <svg {...common}>
        <path d="M12 20.5s5.5-4.6 5.5-9.1A5.5 5.5 0 0 0 6.5 11.4C6.5 15.9 12 20.5 12 20.5z" />
        <circle cx="12" cy="11.2" r="1.8" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M5.5 6.5h5.2A2.8 2.8 0 0 1 13.5 9v9.5" />
      <path d="M18.5 6.5h-5.2A2.8 2.8 0 0 0 10.5 9v9.5" />
      <path d="M5.5 6.5v12" />
      <path d="M18.5 6.5v12" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg className="lt-go" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg className="lt-go" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4H4.5A1.5 1.5 0 0 0 3 5.5v6A1.5 1.5 0 0 0 4.5 13h6a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8.5 3H13v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 3 7.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}
