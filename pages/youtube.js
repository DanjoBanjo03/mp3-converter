// pages/youtube.js
import { useState } from 'react'
import ConverterForm from '../components/ConverterForm'
import ResultLink    from '../components/ResultLink'

export default function YouTubePage() {
  const [link,    setLink]    = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleConvert(url) {
    setLoading(true)
    setError(null)
    setLink(null)

    try {
      const res = await fetch('/api/youtube', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url }),
      })

      if (!res.ok) {
        // Try parsing JSON error
        let errMsg = 'Conversion failed'
        try {
          const errData = await res.json()
          errMsg = errData.error || errMsg
        } catch {}
        throw new Error(errMsg)
      }

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        // Proxy path: parse downloadUrl
        const { downloadUrl } = await res.json()
        setLink(downloadUrl)
      } else if (contentType.includes('audio')) {
        // Built-in path: create a Blob URL from the MP3 stream
        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        setLink(blobUrl)
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
      <h2>YouTube → MP3</h2>
      <ConverterForm
        placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
        onSubmit={handleConvert}
        loading={loading}
      />
      <ResultLink link={link} error={error} />
    </div>
  )
}