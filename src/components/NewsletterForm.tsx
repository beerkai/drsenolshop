'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'already' | 'error';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading') return;
    if (!email.trim()) return;

    setStatus('loading');
    setMessage(null);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus('error');
        setMessage(data.message ?? 'Abone olunamadı.');
        return;
      }
      setStatus(data.already ? 'already' : 'success');
      setMessage(data.already
        ? 'Bu e-posta zaten kayıtlı. Hasat bildirimlerinde sizi unutmayız.'
        : 'Teşekkürler. Yeni hasat döneminde ilk siz haberdar olacaksınız.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Sunucuya ulaşılamadı. Lütfen tekrar deneyin.');
    }
  }

  const submitted = status === 'success' || status === 'already';
  const isError = status === 'error';

  return (
    <div style={{ maxWidth: '420px', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e-posta adresiniz"
          required
          autoComplete="email"
          disabled={status === 'loading'}
          aria-label="E-posta adresiniz"
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
          disabled={status === 'loading' || !email.trim()}
          style={{
            padding: '14px 24px',
            backgroundColor: status === 'loading' ? '#9C7C3C' : '#C9A961',
            color: '#0A0908',
            border: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: status === 'loading' || !email.trim() ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s',
            flexShrink: 0,
            opacity: !email.trim() ? 0.7 : 1,
          }}
        >
          {status === 'loading' ? 'Gönderiliyor…' : 'Kayıt Ol'}
        </button>
      </form>

      {message && (
        <p
          role={isError ? 'alert' : 'status'}
          style={{
            marginTop: '10px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            lineHeight: 1.6,
            color: isError ? '#D17B6A' : submitted ? '#C9A961' : 'rgba(244,240,232,0.5)',
          }}
        >
          {submitted && (
            <span aria-hidden style={{ marginRight: '6px' }}>✓</span>
          )}
          {message}
        </p>
      )}
    </div>
  );
}
