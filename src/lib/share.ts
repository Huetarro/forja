/**
 * Comparte archivos con el menú de compartir de iOS (Web Share API): desde ahí se pueden
 * guardar en Archivos o iCloud Drive. Si no está disponible, se descargan.
 */
export async function shareOrDownload(
  files: File | File[],
  title: string,
): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const list = Array.isArray(files) ? files : [files]
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.share && nav.canShare?.({ files: list })) {
    try {
      await nav.share({ files: list, title })
      return 'shared'
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled'
      // si falla, se descarga
    }
  }
  for (const file of list) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
  return 'downloaded'
}
