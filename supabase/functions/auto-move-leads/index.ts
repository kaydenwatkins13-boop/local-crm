import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = new Date()

  // Rule 1: New Lead → Contacted after 2 days
  const twoDaysAgo = new Date(now)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const { data: newLeads } = await supabase
    .from('leads')
    .select('id')
    .eq('stage', 'New Lead')
    .lte('created_at', twoDaysAgo.toISOString())

  if (newLeads && newLeads.length > 0) {
    await supabase
      .from('leads')
      .update({ stage: 'Contacted' })
      .in('id', newLeads.map(l => l.id))
    console.log(`Moved ${newLeads.length} leads from New Lead → Contacted`)
  }

  // Rule 2: Contacted → Lost after 7 days of no activity
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: contactedLeads } = await supabase
    .from('leads')
    .select('id')
    .eq('stage', 'Contacted')
    .lte('updated_at', sevenDaysAgo.toISOString())

  if (contactedLeads && contactedLeads.length > 0) {
    await supabase
      .from('leads')
      .update({ stage: 'Lost' })
      .in('id', contactedLeads.map(l => l.id))
    console.log(`Moved ${contactedLeads.length} leads from Contacted → Lost`)
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})