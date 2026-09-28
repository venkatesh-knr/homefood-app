// Re-encodes a photo through a <canvas> before it's uploaded. Canvas re-encoding
// drops all EXIF metadata — including GPS location — which is how
// supabase/migrations/0002_storage.sql's comment ("strips location (GPS) data
// from photos before upload") is actually satisfied, without needing an EXIF
// parsing library just to delete a few fields.
export async function stripPhotoMetadata(file: File, maxSize = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  if (!blob) throw new Error('Could not process the photo')
  return blob
}
