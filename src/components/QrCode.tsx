import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** Renders fully client-side — the invite link never leaves the device to generate this. */
export function QrCode({ value, label }: { value: string; label: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(value, { margin: 1, width: 168, color: { dark: '#2B2622', light: '#FFFFFF' } })
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [value])

  if (!dataUrl) return null
  return <img src={dataUrl} width={168} height={168} alt={label} className="rounded-lg border border-line" />
}
