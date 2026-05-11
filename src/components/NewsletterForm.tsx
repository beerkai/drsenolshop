'use client';

export default function NewsletterForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{ display: 'flex', maxWidth: '420px', width: '100%' }}
    >
      <input
        type="email"
        placeholder="e-posta adresiniz"
        required
        style={{
          flex: 1,
          padding: '14px 20px',
          backgroundColor: 'rgba(244,240,232,0.05)',
          border: '1px solid rgba(244,240,232,0.12)',
          borderRight: 'none',
          color: '#F4F0E8',
          fontSize: '13px',
          fontFamily: 'var(--font-sans)',
          outline: 'none',
          minWidth: 0,
        }}
      />
      <button
        type="submit"
        style={{
          padding: '14px 24px',
          backgroundColor: '#C9A961',
          color: '#0A0908',
          border: 'none',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background-color 0.2s',
          flexShrink: 0,
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#D4B570'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#C9A961'; }}
      >
        Kayıt Ol
      </button>
    </form>
  );
}
