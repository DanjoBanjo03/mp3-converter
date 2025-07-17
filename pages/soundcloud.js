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
        body:    JSON.stringify({ url }),
      })
      console.log('SoundCloud API status:', res.status, res.headers.get('content-type'))

      if (!res.ok) {
        let msg = 'Conversion failed'
        try { msg = (await res.json()).error || msg } catch {}
        throw new Error(msg)
      }

      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        // Proxy or JSON‐based API path (if you implement one)
        const data = await res.json()
        console.log('SoundCloud API JSON:', data)
        setLink(data.downloadUrl)
      } else if (ct.includes('audio')) {
        // Binary MP3 response
        console.log('Received audio blob of size:', (await res.clone().blob()).size)
        const blob = await res.blob()
        setLink(URL.createObjectURL(blob))
      } else {
        throw new Error('Unexpected response type: ' + ct)
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