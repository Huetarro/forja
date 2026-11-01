import { useEffect, useMemo, type ImgHTMLAttributes } from 'react'

/** Muestra una imagen guardada como Blob (crea y libera su URL temporal). */
export function BlobImage({ blob, ...rest }: { blob: Blob } & ImgHTMLAttributes<HTMLImageElement>) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  return <img src={url} {...rest} />
}
