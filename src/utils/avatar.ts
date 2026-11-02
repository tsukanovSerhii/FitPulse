const PALETTES = [
  ['#1f1f22', '#e2b259', '#f4f4f2', '#b45309'],
  ['#865a0b', '#f4f4f2', '#1f1f22', '#ecc77f'],
  ['#2f3e46', '#e2b259', '#cad2c5', '#84a98c'],
  ['#3d2c2e', '#f4a259', '#f4f4f2', '#bc4b51'],
  ['#14213d', '#fca311', '#e5e5e5', '#4a6fa5'],
  ['#264653', '#e9c46a', '#f4f4f2', '#e76f51'],
  ['#3a3a3f', '#a3b18a', '#f4f4f2', '#e2b259'],
  ['#5f0f40', '#fb8b24', '#f4f4f2', '#e36414'],
]

function hashSeed(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** mulberry32: small deterministic PRNG so the same seed always yields the same avatar. */
function prng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface AvatarShapes {
  background: string
  circle: { cx: number; cy: number; r: number; fill: string }
  block: { x: number; y: number; size: number; rotate: number; fill: string }
  arc: { d: string; stroke: string }
}

export function avatarShapes(seed: string): AvatarShapes {
  const rand = prng(hashSeed(seed))
  const between = (min: number, max: number) => min + rand() * (max - min)
  const [background, a, b, c] = PALETTES[Math.floor(rand() * PALETTES.length)]
  const swap = rand() > 0.5

  const arcY = between(38, 52)
  return {
    background,
    circle: { cx: between(18, 46), cy: between(16, 34), r: between(12, 20), fill: swap ? a : b },
    block: { x: between(20, 40), y: between(30, 46), size: between(18, 30), rotate: between(-35, 35), fill: swap ? b : a },
    arc: { d: `M4 ${arcY} Q32 ${arcY - between(10, 22)} 60 ${arcY}`, stroke: c },
  }
}
