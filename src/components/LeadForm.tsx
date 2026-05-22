'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STAGES, type Lead, type Stage } from '@/lib/types'
import toast from 'react-hot-toast'
import { X } from 'lucide-react'

interface Props {
  lead?: Lead
  onClose: () => void
  onSave: () => void
}

export default function LeadForm({ lead, onClose, onSave }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: lead?.name ?? '',
    phone: lead?.phone ?? '',
    email: lead?.email ?? '',
    service_needed: lead?.service_needed ?? '',
    notes: lead?.notes ?? '',
    stage: (lead?.stage ?? 'New Lead') as Stage,
    follow_up_date: lead?.follow_up_date ?? '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        follow_up_date: form.follow_up_date || null,
        phone: form.phone || null,
        email: form.email || null,
        service_needed: form.service_needed || null,
        notes: form.notes || null,
      }
      if (lead) {
        const { error } = await supabase.from('leads').update(payload).eq('id', lead.id)
        if (error) throw error
        toast.success('Lead updated')
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase.from('leads').insert({ ...payload, user_id: user!.id })
        if (error) throw error
        toast.success('Lead added')
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_lead',
            leadName: payload.name,
            phone: payload.phone,
            email: payload.email,
            serviceNeeded: payload.service_needed,
          }),
        })
      }
      onSave()
      onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-xs font-medium text-slate-600 mb-1"

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Name *</label>
            <input required className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" className={inputClass} value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Service Needed</label>
            <input className={inputClass} value={form.service_needed} onChange={e => set('service_needed', e.target.value)} placeholder="e.g. Lawn care, HVAC repair..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Stage</label>
              <select className={inputClass} value={form.stage} onChange={e => set('stage', e.target.value)}>
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Follow-up Date</label>
              <input type="date" className={inputClass} value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea rows={3} className={inputClass} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional details..." />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Saving...' : lead ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}