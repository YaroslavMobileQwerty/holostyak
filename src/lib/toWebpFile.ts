/** Client-side WebP conversion for uploads (Supabase Storage). */
export async function toWebpFile(file: File, quality = 0.75): Promise<File> {
  if (file.type === 'image/webp') return file
  const bmp = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = bmp.width
    canvas.height = bmp.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bmp, 0, 0)
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, 'image/webp', quality),
    )
    if (!blob) return file
    const base = file.name.replace(/\.[^.]+$/, '')
    return new File([blob], `${base}.webp`, { type: 'image/webp' })
  } finally {
    bmp.close()
  }
}
