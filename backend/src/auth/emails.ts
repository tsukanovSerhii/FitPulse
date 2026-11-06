const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export function resetPasswordEmail({ name, link }: { name: string; link: string }) {
  const greeting = name ? `Вітаємо, ${name}!` : 'Вітаємо!'
  return {
    subject: 'Відновлення пароля FitPulse',
    text: [
      greeting,
      '',
      'Ви попросили відновити пароль до FitPulse. Щоб задати новий, відкрийте посилання:',
      link,
      '',
      'Посилання діє одну годину. Якщо ви не просили відновлення, просто проігноруйте цей лист.',
    ].join('\n'),
    html: `<p>${escape(greeting)}</p>
<p>Ви попросили відновити пароль до FitPulse. Щоб задати новий, натисніть кнопку:</p>
<p><a href="${escape(link)}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Задати новий пароль</a></p>
<p>Або відкрийте посилання: <a href="${escape(link)}">${escape(link)}</a></p>
<p>Посилання діє одну годину. Якщо ви не просили відновлення, просто проігноруйте цей лист.</p>`,
  }
}
