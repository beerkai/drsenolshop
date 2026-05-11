import type { ReactNode } from 'react'

export function P({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'clamp(15px, 2.5vw, 17px)',
        lineHeight: 1.8,
        color: '#D4CFC2',
        margin: '0 0 24px',
      }}
    >
      {children}
    </p>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(24px, 4vw, 36px)',
        fontWeight: 500,
        lineHeight: 1.2,
        color: '#F4F0E8',
        margin: '48px 0 20px',
        letterSpacing: '-0.005em',
      }}
    >
      {children}
    </h2>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.25em',
        color: '#C9A961',
        textTransform: 'uppercase',
        margin: '32px 0 12px',
      }}
    >
      {children}
    </p>
  )
}

export function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 3vw, 28px)',
        fontStyle: 'italic',
        fontWeight: 300,
        lineHeight: 1.5,
        color: '#C9A961',
        borderLeft: '2px solid #C9A961',
        padding: '8px 0 8px 24px',
        margin: '32px 0',
      }}
    >
      {children}
    </blockquote>
  )
}

export function List({ items }: { items: string[] }) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0' }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            lineHeight: 1.8,
            color: '#D4CFC2',
            padding: '8px 0 8px clamp(20px, 4vw, 24px)',
            position: 'relative',
            borderBottom: i === items.length - 1 ? 'none' : '1px solid rgba(244,240,232,0.06)',
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: '14px',
              width: '8px',
              height: '1px',
              background: '#C9A961',
            }}
          />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        background: '#141210',
        border: '1px solid rgba(244,240,232,0.08)',
        padding: 'clamp(24px, 4vw, 36px)',
        margin: '32px 0',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.25em',
          color: '#C9A961',
          textTransform: 'uppercase',
          margin: '0 0 12px',
        }}
      >
        {title}
      </p>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          lineHeight: 1.7,
          color: '#D4CFC2',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div
      style={{
        padding: '24px 0',
        borderBottom: '1px solid rgba(244,240,232,0.08)',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(18px, 3vw, 22px)',
          fontWeight: 500,
          color: '#F4F0E8',
          margin: '0 0 12px',
          lineHeight: 1.3,
        }}
      >
        {question}
      </h3>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          lineHeight: 1.7,
          color: '#B8B0A0',
          margin: 0,
        }}
      >
        {answer}
      </p>
    </div>
  )
}
