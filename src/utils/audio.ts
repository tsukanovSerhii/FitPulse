/**
 * Генератор звукового сигналу за допомогою Web Audio API
 * Не потребує зовнішніх аудіофайлів
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playTimerBeep(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    // Подвійний приємний сигнал закінчення відпочинку
    const playTone = (frequency: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequency, startTime)

      gain.gain.setValueAtTime(0.001, startTime)
      gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const now = ctx.currentTime
    playTone(880, now, 0.15)        // A5
    playTone(1174.66, now + 0.2, 0.3) // D6
  } catch (e) {
    console.warn('[Audio] Помилка відтворення звуку:', e)
  }
}
