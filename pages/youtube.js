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
      // Ask your API for the download URL (always a link back to /api/youtube?url=...)
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
      setLink(downloadUrl)
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
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link href="/">← Back Home</Link>
      </div>
    </div>
  )
}

// Prevent static prerendering
export async function getServerSideProps() {
  return { props: {} }
}