'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STAGES, STAGE_COLORS, type Lead, type Stage } from '@/lib/types'
import LeadForm from '@/components/LeadForm'
import Link from 'next/link'
import { Plus, Search, ChevronRight, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

export default function LeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<Stage | 'All'>('All')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('leads').select('*').order('created_at', { ascending: false })
    if (error) toast.error(error.message)
    else setLeads(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const filtered = leads.filter(l => {
    const matchStage = stageFilter === 'All' || l.stage === stageFilter
    const q = search.toLowerCase()
    const matchSearch = !q || l.name.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.includes(q) ||
      l.service_needed?.toLowerCase().includes(q)
    return matchStage && matchSearch
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 text-sm">{leads.length} total leads</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name, email, phone, service..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={stageFilter} onChange={e => setStageFilter(e.target.value as Stage | 'All')}
        >
          <option value="All">All Stages</option>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No leads found.</div>
        ) : filtered.map(lead => (
          <Link key={lead.id} href={`/leads/${lead.id}`}
            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{lead.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${STAGE_COLORS[lead.stage as Stage]}`}>
                  {lead.stage}
                </span>
              </div>
              <div className="text-sm text-slate-500 mt-0.5 flex gap-3">
                {lead.service_needed && <span>{lead.service_needed}</span>}
                {lead.phone && <span>{lead.phone}</span>}
                {lead.email && <span className="truncate">{lead.email}</span>}
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              {lead.follow_up_date && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar size={12} />
                  {format(parseISO(lead.follow_up_date), 'MMM d')}
                </div>
              )}
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </Link>
        ))}
      </div>

      {showForm && <LeadForm onClose={() => setShowForm(false)} onSave={fetchLeads} />}
    </div>
  )
}