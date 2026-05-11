'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/admin/toast/toast'
import { Badge } from '@/components/admin/ui/Badge'

interface AdminRow {
  id: string
  email: string
  full_name: string | null
  role: 'owner' | 'staff'
  is_active: boolean
  last_login_at: string | null
  created_at: string
}

export default function AdminsPanel({ initialAdmins, currentAdminId }: { initialAdmins: AdminRow[]; currentAdminId: string }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<'owner' | 'staff'>('staff')
  const [adding, setAdding] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail.trim(), full_name: newName.trim() || null, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Eklenemedi.')
      } else {
        toast.success('Admin eklendi. Şifre için Supabase Auth&apos;dan kullanıcı oluştur.')
        setNewEmail(''); setNewName(''); setNewRole('staff'); setShowAdd(false)
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    } finally {
      setAdding(false)
    }
  }

  async function handleToggleActive(admin: AdminRow) {
    if (admin.id === currentAdminId && admin.is_active) {
      toast.error('Kendinizi pasif yapamazsınız.')
      return
    }
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !admin.is_active }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Güncellenemedi.')
      } else {
        toast.success(admin.is_active ? `${admin.email} pasif yapıldı.` : `${admin.email} aktif yapıldı.`)
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    }
  }

  async function handleDelete(admin: AdminRow) {
    if (admin.id === currentAdminId) {
      toast.error('Kendinizi silemezsiniz.')
      return
    }
    if (!confirm(`${admin.email} silinsin mi?`)) return
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.message ?? 'Silinemedi.')
      } else {
        toast.success(`${admin.email} silindi.`)
        router.refresh()
      }
    } catch {
      toast.error('Ağ hatası.')
    }
  }

  return (
    <div>
      <div className="ad-table-wrap" style={{ marginBottom: '14px' }}>
        <table className="ad-table">
          <thead>
            <tr>
              <th>E-mail</th>
              <th>Ad</th>
              <th>Rol</th>
              <th>Son Giriş</th>
              <th>Durum</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {initialAdmins.map((a) => (
              <tr key={a.id}>
                <td style={{ color: 'var(--ad-fg)', fontSize: '12px' }}>
                  {a.email}
                  {a.id === currentAdminId && (
                    <span className="ad-mono" style={{ marginLeft: '6px', fontSize: '9px', color: 'var(--ad-gold-deep)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                      sen
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--ad-fg-muted)', fontSize: '12px' }}>{a.full_name ?? '—'}</td>
                <td><Badge tone={a.role === 'owner' ? 'gold' : 'neutral'} bracketed>{a.role}</Badge></td>
                <td className="ad-mono" style={{ fontSize: '11px', color: 'var(--ad-fg-faint)' }}>
                  {a.last_login_at ? new Date(a.last_login_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '—'}
                </td>
                <td>
                  <Badge tone={a.is_active ? 'success' : 'neutral'}>{a.is_active ? 'Aktif' : 'Pasif'}</Badge>
                </td>
                <td className="is-right">
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(a)}
                      className="ad-btn ad-btn-ghost ad-btn-sm"
                      disabled={a.id === currentAdminId && a.is_active}
                    >
                      {a.is_active ? 'Pasifleştir' : 'Aktif et'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a)}
                      className="ad-btn ad-btn-ghost ad-btn-sm"
                      style={{ color: 'var(--ad-danger)' }}
                      disabled={a.id === currentAdminId}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAdd ? (
        <button type="button" onClick={() => setShowAdd(true)} className="ad-btn ad-btn-secondary ad-btn-sm">
          + Yeni Admin Ekle
        </button>
      ) : (
        <form onSubmit={handleAdd} style={{ padding: '14px', backgroundColor: 'var(--ad-surface-2)', border: '1px solid var(--ad-line)' }}>
          <p className="ad-eyebrow-muted" style={{ marginBottom: '12px' }}>Yeni Admin</p>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px', gap: '8px', marginBottom: '10px' }}>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="email@drsenol.shop"
              className="ad-input"
              required
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ad soyad (ops.)"
              className="ad-input"
            />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'owner' | 'staff')} className="ad-select">
              <option value="staff">staff</option>
              <option value="owner">owner</option>
            </select>
          </div>
          <p className="ad-mono" style={{ fontSize: '10px', color: 'var(--ad-fg-faint)', marginBottom: '12px', letterSpacing: '0.05em' }}>
            ⚠ Buradan eklemek yetmez. Aynı email için Supabase Authentication&apos;dan da kullanıcı + şifre oluşturmalısın.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" disabled={adding} className="ad-btn ad-btn-primary ad-btn-sm">
              {adding ? 'Ekleniyor…' : 'Ekle'}
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setNewEmail(''); setNewName('') }} className="ad-btn ad-btn-ghost ad-btn-sm">
              Vazgeç
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
