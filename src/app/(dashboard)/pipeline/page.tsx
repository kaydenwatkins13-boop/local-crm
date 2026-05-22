'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STAGES, STAGE_COLORS, type Lead, type Stage } from '@/lib/types'
import LeadForm from '@/components/LeadForm'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PipelinePage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [showForm, setShowForm] = useState(false)
  const [dragging, setDragging] = useState<string | null>(null)

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
    setLeads(data ?? [])
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  async function handleDrop(stage: Stage, e: React.DragEvent) {
    e.preventDefault()
    if (!dragging) return
    const { error } = await supabase.from('leads').update({ stage }).eq('id', dragging)
    if (error) toast.error(error.message)
    else fetchLeads()
    setDragging(null)
  }

  const byStage = (stage: Stage) => leads.filter(l => l.stage === stage)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pipeline</h1>
          <p className="text-slate-500 text-sm">Drag leads between stages</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <div
            key={stage}
            className="flex-shrink-0 w-64"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(stage, e)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STAGE_COLORS[stage]}`}>{stage}</span>
              <span className="text-xs text-slate-400 font-medium">{byStage(stage).length}</span>
            </div>
            <div className="space-y-2 min-h-32 bg-slate-100/60 rounded-xl p-2">
              {byStage(stage).map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragging(lead.id)}
                  onDragEnd={() => setDragging(null)}
                  className={`bg-white rounded-lg border border-slate-200 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${dragging === lead.id ? 'opacity-50' : ''}`}
                >
                  <Link href={`/leads/${lead.id}`} onClick={e => dragging && e.preventDefault()}>
                    <div className="font-medium text-sm text-slate-900">{lead.name}</div>
                    {lead.service_needed && <div className="text-xs text-slate-500 mt-0.5">{lead.service_needed}</div>}
                    {lead.follow_up_date && (
                      <div className="text-xs text-slate-400 mt-1.5">📅 {lead.follow_up_date}</div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showForm && <LeadForm onClose={() => setShowForm(false)} onSave={fetchLeads} />}
    </div>
  )
}