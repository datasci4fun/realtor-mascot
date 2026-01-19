import nodemailer from 'nodemailer'

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587')
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || 'noreply@artisticrealestate.com'
const FROM_NAME = process.env.FROM_NAME || 'Artistic Real Estate Group'

// Site info
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const REALTOR_NAME = process.env.NEXT_PUBLIC_REALTOR_NAME || 'Greg Knapp'
const REALTOR_PHONE = process.env.NEXT_PUBLIC_REALTOR_PHONE || '(469) 485-7313'
const BROKERAGE = process.env.NEXT_PUBLIC_BROKERAGE || 'Artistic Real Estate Group'

// Create transporter (lazy init)
let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (!SMTP_USER || !SMTP_PASS) {
      // Development mode - use console logging
      console.warn('SMTP credentials not configured. Emails will be logged to console.')
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      })
    } else {
      transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    }
  }
  return transporter
}

// Email template styles
const emailStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #0066cc; }
  .logo { font-size: 24px; font-weight: bold; color: #0066cc; }
  .content { padding: 30px 0; }
  .button { display: inline-block; background: #0066cc; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; }
  .button:hover { background: #0052a3; }
  .footer { padding: 20px 0; border-top: 1px solid #eee; text-align: center; font-size: 14px; color: #666; }
  .footer a { color: #0066cc; }
`

// Base email template
function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${BROKERAGE}</title>
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">${BROKERAGE}</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p><strong>${REALTOR_NAME}</strong><br>${BROKERAGE}</p>
          <p>${REALTOR_PHONE}</p>
          <p><a href="${SITE_URL}">${SITE_URL.replace('https://', '').replace('http://', '')}</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Send email
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text?: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transport = getTransporter()

    const info = await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    // In development, log the email content
    if (!SMTP_USER || !SMTP_PASS) {
      console.log('\n========== EMAIL SENT (DEV MODE) ==========')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      console.log('===========================================\n')
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}

// Send magic link email
export async function sendMagicLinkEmail(
  email: string,
  token: string,
  clientName?: string | null
): Promise<{ success: boolean; error?: string }> {
  const magicLink = `${SITE_URL}/portal/verify?token=${token}`

  const greeting = clientName ? `Hi ${clientName},` : 'Hi,'

  const content = `
    <h2 style="margin-top: 0;">Sign in to Your Portal</h2>
    <p>${greeting}</p>
    <p>Click the button below to securely sign in to your client portal. This link will expire in 15 minutes.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${magicLink}" class="button">Sign In to Portal</a>
    </p>
    <p style="font-size: 14px; color: #666;">
      If you didn't request this link, you can safely ignore this email.
    </p>
    <p style="font-size: 12px; color: #999; word-break: break-all;">
      Or copy this link: ${magicLink}
    </p>
  `

  const text = `
Sign in to Your Portal

${greeting}

Click the link below to securely sign in to your client portal. This link will expire in 15 minutes.

${magicLink}

If you didn't request this link, you can safely ignore this email.

${REALTOR_NAME}
${BROKERAGE}
${REALTOR_PHONE}
  `.trim()

  return sendEmail({
    to: email,
    subject: `Sign in to ${BROKERAGE} Portal`,
    html: baseTemplate(content),
    text,
  })
}

// Send welcome email after first login
export async function sendWelcomeEmail(
  email: string,
  clientName?: string | null
): Promise<{ success: boolean; error?: string }> {
  const greeting = clientName ? `Welcome ${clientName}!` : 'Welcome!'

  const content = `
    <h2 style="margin-top: 0;">${greeting}</h2>
    <p>Thank you for creating your client portal account with ${BROKERAGE}.</p>
    <p>Your portal gives you access to:</p>
    <ul>
      <li><strong>Property Search</strong> - Browse and save your favorite listings</li>
      <li><strong>Transaction Tracking</strong> - Follow your home buying/selling progress</li>
      <li><strong>Document Center</strong> - Access and upload important documents</li>
      <li><strong>Direct Messaging</strong> - Communicate with ${REALTOR_NAME}</li>
    </ul>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${SITE_URL}/portal" class="button">Go to Portal</a>
    </p>
    <p>
      If you have any questions, don't hesitate to reach out. I'm here to help make your
      real estate journey as smooth as possible.
    </p>
    <p>Best regards,<br>${REALTOR_NAME}</p>
  `

  return sendEmail({
    to: email,
    subject: `Welcome to ${BROKERAGE}!`,
    html: baseTemplate(content),
  })
}

// Send notification about new message
export async function sendMessageNotificationEmail(
  email: string,
  clientName: string | null,
  messagePreview: string
): Promise<{ success: boolean; error?: string }> {
  const greeting = clientName ? `Hi ${clientName},` : 'Hi,'

  const content = `
    <h2 style="margin-top: 0;">New Message from ${REALTOR_NAME}</h2>
    <p>${greeting}</p>
    <p>You have a new message in your client portal:</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; font-style: italic;">"${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}"</p>
    </div>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${SITE_URL}/portal/messages" class="button">View Message</a>
    </p>
  `

  return sendEmail({
    to: email,
    subject: `New Message from ${REALTOR_NAME}`,
    html: baseTemplate(content),
  })
}

// Send viewing confirmation email
export async function sendViewingConfirmationEmail(
  email: string,
  clientName: string | null,
  propertyAddress: string,
  scheduledDate: string,
  scheduledTime: string
): Promise<{ success: boolean; error?: string }> {
  const greeting = clientName ? `Hi ${clientName},` : 'Hi,'

  const content = `
    <h2 style="margin-top: 0;">Viewing Confirmed!</h2>
    <p>${greeting}</p>
    <p>Your property viewing has been scheduled:</p>
    <div style="background: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Property:</strong> ${propertyAddress}</p>
      <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${scheduledDate}</p>
      <p style="margin: 0;"><strong>Time:</strong> ${scheduledTime}</p>
    </div>
    <p>I look forward to showing you this property!</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="${SITE_URL}/portal/viewings" class="button">View Details</a>
    </p>
    <p>Best regards,<br>${REALTOR_NAME}</p>
  `

  return sendEmail({
    to: email,
    subject: `Viewing Confirmed: ${propertyAddress}`,
    html: baseTemplate(content),
  })
}
