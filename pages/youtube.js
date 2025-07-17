// pages/youtube.js
import { useState } from 'react'
import ConverterForm from '../components/ConverterForm'
import ResultLink    from '../components/ResultLink'
import TagForm       from '../components/TagForm'

export default function YouTubePage() {
  const [link,    setLink]    = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [origUrl, setOrigUrl] = useState(null)
  const [mode,    setMode]    = useState('convert') // 'convert' | 'download' | 'tag'

  async function handleConvert(url) {
    setLoading(true)
    setError(null)
    setLink(null)
    setOrigUrl(url)

    try {
      const res = await fetch('/api/youtube', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url }),
      })

      if (!res.ok) {
        let msg = 'Conversion failed'
        try {
          const errData = await res.json()
          msg = errData.error || msg
        } catch {}
        throw new Error(msg)
      }

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        // Proxy mode
        const { downloadUrl } = await res.json()
        setLink(downloadUrl)
      } else if (contentType.includes('audio')) {
        // Built-in blob mode
        const blob    = await res.blob()
        const blobUrl = URL.createObjectURL(blob)
        setLink(blobUrl)
      } else {
        throw new Error('Unexpected response type: ' + contentType)
      }

      setMode('download')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Tagging flow: show TagForm when in 'tag' mode
  if (mode === 'tag' && origUrl) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600, margin: 'auto' }}>
        <h2>Tag Your MP3</h2>
        <TagForm origUrl={origUrl} onBack={() => setMode('download')} />
      </div>
    )
  }

  // Default convert/download UI
  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: 'auto' }}>
      <h2>YouTube → MP3</h2>

      {mode === 'convert' && (
        <ConverterForm
          placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
          onSubmit={handleConvert}
          loading={loading}
        />
      )}

      {mode === 'download' && link && (
        <div style={{ marginTop: '1rem' }}>
          <a href={link} download>
            Download MP3
          </a>
          <button
            onClick={() => setMode('tag')}
            style={{ marginLeft: '1rem' }}
          >
            Tag It
          </button>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}