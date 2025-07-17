// pages/soundcloud.js
import { useState } from 'react'
import ConverterForm from '../components/ConverterForm'
import ResultLink    from '../components/ResultLink'

export default function SoundCloudPage() {
  const [link,    setLink]    = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleConvert(url) {
    setLoading(true)
    setError(null)
    setLink(null)

    try {
      const res = await fetch('/api/soundcloud', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url })
      })

      if (!res.ok) {
        let msg = 'Conversion failed'
        try { msg = (await res.json()).error || msg } catch {}
        throw new Error(msg)
      }

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const { downloadUrl } = await res.json()
        setLink(downloadUrl)
      } else if (contentType.includes('audio')) {
        const blob = await res.blob()
        setLink(URL.createObjectURL(blob))
      } else {
        throw new Error('Unexpected response type: ' + contentType)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: 'auto' }}>
      <h2>SoundCloud → MP3</h2>
      <ConverterForm
        placeholder="https://soundcloud.com/artist/track"
        onSubmit={handleConvert}
        loading={loading}
      />
      <ResultLink link={link} error={error} />
    </div>
  )
}