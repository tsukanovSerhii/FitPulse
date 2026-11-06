import nodemailer from 'nodemailer'
import { z } from 'zod'

export interface MailMessage {
  to: string
  subject: string
  text: string
  html: string
}

export interface Mailer {
  send(message: MailMessage): Promise<void>
}

export const mailEnvSchema = z
  .object({
    MAIL_PROVIDER: z.enum(['resend', 'smtp', 'log']).default('log'),
    MAIL_FROM: z.string().min(3).default('FitPulse <no-reply@fitpulse.app>'),
    RESEND_API_KEY: z.string().optional(),
    SMTP_URL: z.string().url().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.MAIL_PROVIDER === 'resend' && !env.RESEND_API_KEY) {
      ctx.addIssue({ code: 'custom', path: ['RESEND_API_KEY'], message: 'required when MAIL_PROVIDER=resend' })
    }
    if (env.MAIL_PROVIDER === 'smtp' && !env.SMTP_URL) {
      ctx.addIssue({ code: 'custom', path: ['SMTP_URL'], message: 'required when MAIL_PROVIDER=smtp' })
    }
  })

export type MailConfig = z.infer<typeof mailEnvSchema>

interface MailLog {
  info(obj: unknown, msg?: string): void
}

/** Resend in production, SMTP for Mailpit in development, the log everywhere else. */
export function createMailer(
  config: Pick<MailConfig, 'MAIL_PROVIDER' | 'MAIL_FROM' | 'RESEND_API_KEY' | 'SMTP_URL'>,
  { fetchFn = fetch, log }: { fetchFn?: typeof fetch; log: MailLog },
): Mailer {
  switch (config.MAIL_PROVIDER) {
    case 'resend':
      return {
        async send(message) {
          const res = await fetchFn('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${config.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: config.MAIL_FROM, to: [message.to], subject: message.subject, text: message.text, html: message.html }),
          })
          if (!res.ok) throw new Error(`Resend answered ${res.status}: ${await res.text()}`)
        },
      }
    case 'smtp': {
      const transport = nodemailer.createTransport(config.SMTP_URL!)
      return {
        async send(message) {
          await transport.sendMail({ from: config.MAIL_FROM, ...message })
        },
      }
    }
    case 'log':
      return {
        async send(message) {
          log.info({ to: message.to, subject: message.subject, text: message.text }, 'Email (MAIL_PROVIDER=log)')
        },
      }
  }
}
