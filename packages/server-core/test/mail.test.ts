import { describe, expect, it } from 'vitest'
import { createMailer, mailEnvSchema, parseConfig } from '../src/index.js'

const message = { to: 'ira@mail.com', subject: 'Відновлення пароля FitPulse', text: 'link', html: '<p>link</p>' }
const quiet = { info: () => {}, warn: () => {} }

describe('mailer', () => {
  it('resend posts the message with the API key', async () => {
    const calls: { url: string; init: RequestInit }[] = []
    const fetchFn = (async (url: string, init: RequestInit) => {
      calls.push({ url, init })
      return new Response('{"id":"1"}', { status: 200 })
    }) as unknown as typeof fetch
    const mailer = createMailer(
      { MAIL_PROVIDER: 'resend', MAIL_FROM: 'FitPulse <no-reply@fitpulse.app>', RESEND_API_KEY: 're_test' },
      { fetchFn, log: quiet },
    )
    await mailer.send(message)
    expect(calls).toHaveLength(1)
    expect(calls[0]!.url).toBe('https://api.resend.com/emails')
    expect((calls[0]!.init.headers as Record<string, string>).Authorization).toBe('Bearer re_test')
    expect(JSON.parse(String(calls[0]!.init.body))).toEqual({
      from: 'FitPulse <no-reply@fitpulse.app>',
      to: ['ira@mail.com'],
      subject: message.subject,
      text: 'link',
      html: '<p>link</p>',
    })
  })

  it('resend throws on a non-2xx answer', async () => {
    const fetchFn = (async () => new Response('bad', { status: 422 })) as unknown as typeof fetch
    const mailer = createMailer({ MAIL_PROVIDER: 'resend', MAIL_FROM: 'a@b.c', RESEND_API_KEY: 'k' }, { fetchFn, log: quiet })
    await expect(mailer.send(message)).rejects.toThrow('422')
  })

  it('log mailer writes subject and recipient', async () => {
    const lines: unknown[] = []
    const mailer = createMailer({ MAIL_PROVIDER: 'log', MAIL_FROM: 'a@b.c' }, { log: { info: (obj: unknown) => lines.push(obj), warn: () => {} } })
    await mailer.send(message)
    expect(lines[0]).toMatchObject({ to: 'ira@mail.com', subject: message.subject })
  })

  it('config requires RESEND_API_KEY for resend', () => {
    expect(() => parseConfig(mailEnvSchema, { MAIL_PROVIDER: 'resend' })).toThrow(/RESEND_API_KEY/)
    expect(() => parseConfig(mailEnvSchema, { MAIL_PROVIDER: 'smtp' })).toThrow(/SMTP_URL/)
    expect(parseConfig(mailEnvSchema, {})).toMatchObject({ MAIL_PROVIDER: 'log', MAIL_FROM: 'FitPulse <no-reply@fitpulse.app>' })
  })
})
