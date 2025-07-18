// pages/youtube.js
import { useState } from 'react'
import Link from 'next/link'
import ConverterForm from '../components/ConverterForm'
import ResultLink    from '../components/ResultLink'
import TagForm       from '../components/TagForm'
import Footer        from '../components/Footer'

export default function YouTubePage() {
  const [mode,    setMode   ] = useState('convert') // 'convert' | 'download' | 'tag'
  const [origUrl, setOrigUrl] = useState(null)
  const [link,    setLink   ] = useState(null)
  const [error,   setError  ] = useState(null)
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
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Conversion failed')
      }

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        // Proxy fallback: fetch the real MP3 blob
        const { downloadUrl } = await res.json()
        const mp3Res = await fetch(downloadUrl)
        if (!mp3Res.ok) {
          throw new Error('Failed to fetch MP3 from proxy URL')
        }
        const mp3Blob = await mp3Res.blob()
        setLink(URL.createObjectURL(mp3Blob))
      } else {
        // Direct MP3 stream from our API
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: origUrl, ...metadata }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Tagging failed')
      }

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
      padding: '2rem 1rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Link
              href="/"
              style={{
                color: '#666',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                display: 'inline-block'
              }}
            >
              ← Back to Home
            </Link>
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            🎬 YouTube → MP3
          </h2>
          <p style={{ color: '#666', margin: 0 }}>
            Convert YouTube videos to MP3 format
          </p>
        </div>

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
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.4)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
            >
              🏷️ Tag it
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

        {error && (
          <div style={{
            color: '#e74c3c',
            background: '#fdf2f2',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <Footer />
      </div>
    </div>
  )
}

// Disable static prerendering—use SSR instead
export async function getServerSideProps() {
  return { props: {} }
}