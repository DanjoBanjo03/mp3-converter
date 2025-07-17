// components/TagForm.js
import { useState } from 'react'
import ResultLink from './ResultLink'

export default function TagForm({ origUrl, onBack }) {
  const [title,   setTitle]   = useState('')
  const [artist,  setArtist]  = useState('')
  const [year,    setYear]    = useState('')
  const [link,    setLink]    = useState(null)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleTag(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setLink(null)

    try {
      const res = await fetch('/api/youtube', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ url: origUrl, title, artist, year })
      })

      if (!res.ok) {
        let msg = 'Tagging failed'
        try { msg = (await res.json()).error || msg } catch {}
        throw new Error(msg)
      }

      // get the tagged MP3 blob
      const blob = await res.blob()
      setLink(URL.createObjectURL(blob))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <button onClick={onBack}>&larr; Back</button>

      <form onSubmit={handleTag} style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Song Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          style={{ display:'block', width:'100%', marginBottom:8 }}
        />
        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={e => setArtist(e.target.value)}
          required
          style={{ display:'block', width:'100%', marginBottom:8 }}
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={e => setYear(e.target.value)}
          required
          style={{ display:'block', width:'100%', marginBottom:8 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Tagging…' : 'Tag & Download MP3'}
        </button>
      </form>

      {/* Render the download link via ResultLink */}
      <ResultLink link={link} error={error} />
    </div>
  )
}