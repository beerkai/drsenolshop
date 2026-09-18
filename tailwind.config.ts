import type { Config } from 'tailwindcss'

/**
 * Editorial Minimal (Stitch) — Tailwind v4
 *
 * Renk, tipografi ve spacing kaynağı: `src/app/globals.css` içindeki `@theme`.
 * Bu dosya content taraması ve IDE/tip uyumu için tutulur; token değerleri CSS'te.
 *
 * Referans: design/stitch-export/.../saitabat_minimal_luxury/DESIGN.md
 */
const config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        // Stitch: masaüstü düzen 1024px+
        lg: '64rem',
        md: '48rem',
      },
      maxWidth: {
        editorial: '90rem', // 1440px
      },
    },
  },
} satisfies Config

export default config
