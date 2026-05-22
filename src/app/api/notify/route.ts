import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('notify route hit')
  const { leadName, phone, email, serviceNeeded, type } = await request.json()

  const resendKey = process.env.RESEND_API_KEY
  const alertEmail = process.env.ALERT_EMAIL
  const alertPhone = process.env.ALERT_PHONE

  console.log('resendKey:', resendKey ? 'found' : 'missing')
  console.log('alertEmail:', alertEmail ? 'found' : 'missing')

  if (type === 'new_lead') {
    // Email to you
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

    // SMS to you via email-to-text
    if (alertPhone) {
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

    // Welcome email to customer
    if (email) {
      const serviceText = serviceNeeded ? ` for ${serviceNeeded}` : ''
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'LocalCRM <onboarding@resend.dev>',
          to: email,
          subject: 'Thanks for reaching out!',
          html: `
            <p>Hi ${leadName},</p>
            <p>Thanks for reaching out! We received your request${serviceText} and will be in touch shortly.</p>
            <p>We look forward to working with you!</p>
          `,
        }),
      })
      console.log('welcome email sent to customer:', email)
    } else {
      console.log('no customer email provided, skipping welcome email')
    }
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