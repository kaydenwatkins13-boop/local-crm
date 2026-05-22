import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('notify route hit')
  const { leadName, phone, email, serviceNeeded, type } = await request.json()

  const resendKey = process.env.RESEND_API_KEY
  const alertEmail = process.env.ALERT_EMAIL
  const alertPhone = process.env.ALERT_PHONE

  console.log('resendKey:', resendKey ? 'found' : 'missing')
  console.log('alertEmail:', alertEmail ? 'found' : 'missing')
  console.log('alertPhone:', alertPhone ? 'found' : 'missing')

  if (type === 'new_lead') {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LocalCRM <onboarding@resend.dev>',
        to: alertEmail,
        subject: `New Lead: ${leadName}`,
        html: `
          <h2>New Lead Added</h2>
          <p><strong>Name:</strong> ${leadName}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Service:</strong> ${serviceNeeded || 'N/A'}</p>
        `,
      }),
    })
    const emailData = await emailRes.json()
    console.log('email result:', JSON.stringify(emailData))
  }

  return NextResponse.json({ success: true })
}