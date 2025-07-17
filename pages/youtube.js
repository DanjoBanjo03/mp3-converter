// pages/youtube.js
import { useState } from 'react'
import ConverterForm from '../components/ConverterForm'
import ResultLink from '../components/ResultLink'
import TagForm from '../components/TagForm'

export default function YouTubePage() {
  const [mode, setMode] = useState('convert') // 'convert' | 'download' | 'tag'
  const [origUrl, setOrigUrl] = useState(null)
  const [link, setLink] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleConvert(url) {
    setLoading(true)
    setError(null)
    setLink(null)
    setOrigUrl(url)

    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Conversion failed')

      const ct = res.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        const { downloadUrl } = await res.json()
        setLink(downloadUrl)
      } else {
        const blob = await res.blob()
        setLink(URL.createObjectURL(blob))
      }
      setMode('download')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleTag(metadata) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: origUrl, ...metadata })
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Tagging failed')

      const blob = await res.blob()
      setLink(URL.createObjectURL(blob))
      setMode('download')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
        <>
          <ResultLink link={link} error={error} />
          <button
            onClick={() => setMode('tag')}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
          >
            Tag it
          </button>
        </>
      )}

      {mode === 'tag' && origUrl && (
        <TagForm
          origUrl={origUrl}
          onSubmit={handleTag}
          onBack={() => setMode('download')}
          apiEndpoint="/api/youtube"
          loading={loading}
        />
      )}

      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
    </div>
  )
}