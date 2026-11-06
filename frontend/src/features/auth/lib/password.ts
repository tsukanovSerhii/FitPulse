const ITERATIONS = 100_000

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('')

export function createSalt(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(16)).buffer)
}

/**
 * PBKDF2-SHA-256 hash. Accounts live in localStorage only, so this keeps
 * plain-text passwords out of storage but is not a substitute for server auth.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: ITERATIONS },
    key,
    256,
  )
  return toHex(bits)
}
