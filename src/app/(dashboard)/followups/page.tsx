import { createClient } from '@/lib/supabase/server'
import { STAGE_COLORS, type Stage } from '@/lib/types'
import Link from 'next/link'
import { Calendar, AlertCircle } from 'lucide-react'
import { format, parseISO, isToday, isPast } from 'date-fns'

export default async function FollowUpsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: leads = [] } = await supabase
    .from('leads')
    .select('*')
    .lte('follow_up_date', today)
    .not('stage', 'in', '("Closed","Lost")')
    .order('follow_up_date', { ascending: true })

  const overdue = leads?.filter(l => l.follow_up_date < today) ?? []
  const dueToday = leads?.filter(l => l.follow_up_date === today) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Follow-ups</h1>
        <p className="text-slate-500 text-sm mt-1">
          {overdue.length} overdue · {dueToday.length} due today
        </p>
      </div>

      {leads?.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">All caught up!</p>
          <p className="text-slate-400 text-sm mt-1">No follow-ups due today or overdue.</p>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-red-500" />
            <h2 className="font-semibold text-slate-900 text-sm">Overdue</h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{overdue.length}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {overdue.map(lead => (
              <Link key={lead.id} href={`/leads/${lead.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{lead.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STAGE_COLORS[lead.stage as Stage]}`}>
                      {lead.stage}
                    </span>
                  </div>
                  {lead.service_needed && (
                    <div className="text-sm text-slate-500 mt-0.5">{lead.service_needed}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                  <Calendar size={12} />
                  {format(parseISO(lead.follow_up_date), 'MMM d')}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {dueToday.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-orange-500" />
            <h2 className="font-semibold text-slate-900 text-sm">Due Today</h2>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{dueToday.length}</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {dueToday.map(lead => (
              <Link key={lead.id} href={`/leads/${lead.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{lead.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STAGE_COLORS[lead.stage as Stage]}`}>
                      {lead.stage}
                    </span>
                  </div>
                  {lead.service_needed && (
                    <div className="text-sm text-slate-500 mt-0.5">{lead.service_needed}</div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                  <Calendar size={12} />
                  Today
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}