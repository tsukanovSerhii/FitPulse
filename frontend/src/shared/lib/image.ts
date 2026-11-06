export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function validateImageFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!ACCEPTED.includes(file.type)) return 'Підтримуються JPG, PNG, WebP або GIF'
  if (file.size > MAX_IMAGE_BYTES) return 'Файл завеликий: максимум 5 МБ'
  return null
}

/** Center-crops the image to a square and re-encodes it small enough for localStorage. */
export async function toSquareDataUrl(file: File, size = 256): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported')
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.85)
}
