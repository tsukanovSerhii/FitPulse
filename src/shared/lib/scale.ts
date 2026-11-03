/** Rounds a raw step up to 1, 2, 2.5 or 5 times a power of ten. */
function niceStep(raw: number): number {
  if (raw <= 0) return 1
  const power = 10 ** Math.floor(Math.log10(raw))
  const fraction = raw / power
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10
  return nice * power
}

/** Clean axis ticks covering [min, max]; a zero range still gets a usable axis. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (max === min) {
    max = min === 0 ? 1 : max + Math.abs(max) * 0.1
    min = min === 0 ? 0 : min - Math.abs(min) * 0.1
  }
  const step = niceStep((max - min) / count)
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let value = start; value <= end + step / 1e6; value += step) ticks.push(Number(value.toFixed(10)))
  return ticks
}

/** Linear mapping from a domain to a pixel range. */
export const linearScale = (domain: [number, number], range: [number, number]) => (value: number) =>
  domain[1] === domain[0] ? range[0] : range[0] + ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0])
