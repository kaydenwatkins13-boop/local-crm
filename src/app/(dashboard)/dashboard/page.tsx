import { createClient } from '@/lib/supabase/server'
import { STAGES, STAGE_COLORS, type Stage } from '@/lib/types'
import Link from 'next/link'
import { Users, AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: leads = [] } = await supabase.from('leads').select('*').order('created_at', { ascending: false })

  const total = leads?.length ?? 0
  const closed = leads?.filter(l => l.stage === 'Closed').length ?? 0
  const conversionRate = total > 0 ? Math.round((closed / total) * 100) : 0

  const today = new Date().toISOString().split('T')[0]
  const overdueFollowUps = leads?.filter(l =>
    l.follow_up_date && l.follow_up_date < today && l.stage !== 'Closed' && l.stage !== 'Lost'
  ) ?? []
  const todayFollowUps = leads?.filter(l => l.follow_up_date === today) ?? []

  const recentLeads = leads?.slice(0, 5) ?? []

  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s] = leads?.filter(l => l.stage === s).length ?? 0
    return acc
  }, {} as Record<Stage, number>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your leads and pipeline</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Closed', value: closed, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Conversion', value: `${conversionRate}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Follow-ups Today', value: todayFollowUps.length, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Pipeline Breakdown</h2>
          <div className="space-y-3">
            {STAGES.map(stage => (
              <div key={stage} className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STAGE_COLORS[stage]}`}>{stage}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-slate-400 h-1.5 rounded-full"
                      style={{ width: total > 0 ? `${(stageCounts[stage] / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700 w-4 text-right">{stageCounts[stage]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="text-red-500" />
            <h2 className="font-semibold text-slate-900">Overdue Follow-ups</h2>
            {overdueFollowUps.length > 0 && (
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{overdueFollowUps.length}</span>
            )}
          </div>
          {overdueFollowUps.length === 0 ? (
            <p className="text-sm text-slate-400">No overdue follow-ups 🎉</p>
          ) : (
            <div className="space-y-2">
              {overdueFollowUps.slice(0, 5).map(lead => (
                <Link key={lead.id} href={`/leads/${lead.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{lead.name}</div>
                    <div className="text-xs text-slate-500">{lead.service_needed}</div>
                  </div>
                  <span className="text-xs text-red-600 font-medium">
                    {format(parseISO(lead.follow_up_date!), 'MMM d')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recent Leads</h2>
          <Link href="/leads" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {recentLeads.length === 0 ? (
          <p className="text-sm text-slate-400">No leads yet. <Link href="/leads" className="text-blue-600 hover:underline">Add your first lead →</Link></p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentLeads.map(lead => (
              <Link key={lead.id} href={`/leads/${lead.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors">
                <div>
                  <div className="text-sm font-medium text-slate-900">{lead.name}</div>
                  <div className="text-xs text-slate-500">{lead.service_needed || 'No service specified'}</div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STAGE_COLORS[lead.stage as Stage]}`}>
                  {lead.stage}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}