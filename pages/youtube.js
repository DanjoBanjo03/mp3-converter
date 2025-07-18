// pages/youtube.js

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ConverterForm from '../components/ConverterForm'
import ResultLink    from '../components/ResultLink'

export default function YouTubePage() {
  const [origin,  setOrigin ] = useState('')
  const [link,    setLink   ] = useState(null)
  const [error,   setError  ] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // only runs in browser
    setOrigin(window.location.origin)
  }, [])

  async function handleConvert(url) {
    setLoading(true)
    setError(null)
    setLink(null)

    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Conversion failed')
      }
      const { downloadUrl } = await res.json()
      // prefix with origin
      setLink(origin + downloadUrl)
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
          <Link href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
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

// This page must be SSR so window is defined only on client
export async function getServerSideProps() {
  return { props: {} }
}