export type Stage = 'New Lead' | 'Contacted' | 'Appointment Set' | 'Closed' | 'Lost'

export interface Lead {
  id: string
  user_id: string
  name: string
  phone: string | null
  email: string | null
  service_needed: string | null
  notes: string | null
  stage: Stage
  follow_up_date: string | null
  created_at: string
  updated_at: string
}

export const STAGES: Stage[] = [
  'New Lead',
  'Contacted',
  'Appointment Set',
  'Closed',
  'Lost',
]

export const STAGE_COLORS: Record<Stage, string> = {
  'New Lead':        'bg-blue-100 text-blue-800 border-blue-200',
  'Contacted':       'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Appointment Set': 'bg-purple-100 text-purple-800 border-purple-200',
  'Closed':          'bg-green-100 text-green-800 border-green-200',
  'Lost':            'bg-red-100 text-red-800 border-red-200',
}