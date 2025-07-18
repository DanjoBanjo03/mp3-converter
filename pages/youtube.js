// pages/youtube.js

import { useState } from 'react'
import Link from 'next/link'
import ConverterForm from '../components/ConverterForm'
import ResultLink    from '../components/ResultLink'

export default function YouTubePage() {
  const [link,    setLink   ] = useState(null)
  const [error,   setError  ] = useState(null)
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
        let errMsg = 'Conversion failed'
        try {
          const errData = await res.json()
          errMsg = errData.error || errMsg
        } catch {}
        throw new Error(errMsg)
      }

      // Always an MP3 stream
      const mp3Blob = await res.blob()
      const blobUrl = URL.createObjectURL(mp3Blob)
      setLink(blobUrl)
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

        <ConverterForm
          placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
          onSubmit={handleConvert}
          loading={loading}
        />

        <ResultLink link={link} error={error} />
      </div>
    </div>
  )
}

// Prevent static prerendering
export async function getServerSideProps() {
  return { props: {} }
}