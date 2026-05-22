import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { leadName, phone, email, serviceNeeded, type } = await request.json()

  const resendKey = process.env.RESEND_API_KEY
  const alertEmail = process.env.ALERT_EMAIL
  const alertPhone = process.env.ALERT_PHONE

  if (type === 'new_lead') {
    // Email notification
    await fetch('https://api.resend.com/emails', {
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

    // SMS via email-to-text
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LocalCRM <onboarding@resend.dev>',
        to: alertPhone,
        subject: '',
        html: `New lead: ${leadName} - ${phone || email || serviceNeeded || 'No details'}`,
      }),
    })
  }

  if (type === 'follow_up_reminder') {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LocalCRM <onboarding@resend.dev>',
        to: alertEmail,
        subject: `Follow-up Reminder: ${leadName}`,
        html: `
          <h2>Follow-up Reminder</h2>
          <p>You have a follow-up due today with <strong>${leadName}</strong>.</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Service:</strong> ${serviceNeeded || 'N/A'}</p>
        `,
      }),
    })
  }

  return NextResponse.json({ success: true })
}