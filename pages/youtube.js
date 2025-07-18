// pages/youtube.js

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ConverterForm from '../components/ConverterForm'
import ResultLink    from '../components/ResultLink'

export default function YouTubePage() {
  const [origin,        setOrigin       ] = useState('')
  const [downloadLink,  setDownloadLink ] = useState(null)
  const [error,         setError        ] = useState(null)
  const [loading,       setLoading      ] = useState(false)

  // Capture window.location.origin on the client
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  function handleConvert(inputUrl) {
    setError(null)
    setDownloadLink(null)

    try {
      // Validate & normalize YouTube URL
      const parsed = new URL(inputUrl)
      const videoId = parsed.searchParams.get('v')
        || (parsed.hostname.includes('youtu.be') && parsed.pathname.slice(1))
      if (!videoId) throw new Error('Invalid YouTube URL')

      // Build absolute GET link to your API
      const link = `${origin}/api/youtube?url=${encodeURIComponent(inputUrl)}`
      setDownloadLink(link)
    } catch (err) {
      setError(err.message)
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
          <Link href="/" style={{
            color: '#666',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-block'
          }}>
            ← Back to Home
          </Link>
          <h2 style={{
            fontSize: '2rem',
            margin: '0.5rem 0',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            🎬 YouTube → MP3
          </h2>
          <p style={{ color: '#666', margin: 0 }}>
            Paste a YouTube link below and click Convert.
          </p>
        </div>

        <ConverterForm
          placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
          onSubmit={async (url) => {
            setLoading(true)
            handleConvert(url)
            setLoading(false)
          }}
          loading={loading}
        />

        {/* The corrected ResultLink usage */}
        <ResultLink link={downloadLink} error={error} />
      </div>
    </div>
  )
}

// Force SSR so origin is grabbed client-side, not at build time
export async function getServerSideProps() {
  return { props: {} }
}