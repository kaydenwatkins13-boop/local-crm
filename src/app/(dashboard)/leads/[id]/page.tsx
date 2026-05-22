'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STAGES, STAGE_COLORS, type Lead, type Stage } from '@/lib/types'
import LeadForm from '@/components/LeadForm'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Phone, Mail, Wrench, Calendar, FileText } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LeadDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [lead, setLead] = useState<Lead | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchLead() {
    const { data, error } = await supabase.from('leads').select('*').eq('id', id).single()
    if (error) { toast.error('Lead not found'); router.push('/leads') }
    else setLead(data)
    setLoading(false)
  }

  useEffect(() => { fetchLead() }, [id])

  async function moveTo(stage: Stage) {
    const { error } = await supabase.from('leads').update({ stage }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success(`Moved to ${stage}`); fetchLead() }
  }

  async function deleteLead() {
    if (!confirm('Delete this lead?')) return
    await supabase.from('leads').delete().eq('id', id)
    toast.success('Lead deleted')
    router.push('/leads')
  }

  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>
  if (!lead) return null

  const isOverdue = lead.follow_up_date && lead.follow_up_date < new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/leads" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={15} /> Back to Leads
        </Link>
        <div className="flex gap-2">
          <button onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">
            <Edit size={14} /> Edit
          </button>
          <button onClick={deleteLead}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
            <span className={`mt-1 inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${STAGE_COLORS[lead.stage as Stage]}`}>
              {lead.stage}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Added {format(parseISO(lead.created_at), 'MMM d, yyyy')}
          </div>
        </div>

        <div className="grid gap-3">
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone size={14} className="text-slate-400" />
              <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a>
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-slate-400" />
              <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
            </div>
          )}
          {lead.service_needed && (
            <div className="flex items-center gap-2 text-sm">
              <Wrench size={14} className="text-slate-400" />
              <span className="text-slate-700">{lead.service_needed}</span>
            </div>
          )}
          {lead.follow_up_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className={isOverdue ? 'text-red-500' : 'text-slate-400'} />
              <span className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-700'}>
                Follow up: {format(parseISO(lead.follow_up_date), 'MMMM d, yyyy')}
                {isOverdue && ' (Overdue)'}
              </span>
            </div>
          )}
          {lead.notes && (
            <div className="flex gap-2 text-sm mt-1">
              <FileText size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-slate-700 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Move to Stage</h2>
        <div className="flex flex-wrap gap-2">
          {STAGES.map(stage => (
            <button
              key={stage}
              onClick={() => moveTo(stage)}
              disabled={stage === lead.stage}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors
                ${stage === lead.stage
                  ? `${STAGE_COLORS[stage]} opacity-60 cursor-default`
                  : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {showEdit && <LeadForm lead={lead} onClose={() => setShowEdit(false)} onSave={fetchLead} />}
    </div>
  )
}