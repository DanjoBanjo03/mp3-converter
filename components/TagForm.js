// components/TagForm.js
import { useState } from 'react'

export default function TagForm({ origUrl, onBack }) {
  const [title,    setTitle]    = useState('')
  const [artist,   setArtist]   = useState('')
  const [year,     setYear]     = useState('')
  const [coverFile,setCoverFile]= useState(null)
  const [link,     setLink]     = useState(null)
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function handleTag(e) {
    e.preventDefault()
    if (!coverFile) {
      setError('Please select a cover image.')
      return
    }
    setLoading(true)
    setError(null)
    setLink(null)

    // Read file as Base64
    const coverData = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(coverFile)
    })

    try {
      const res = await fetch('/api/youtube', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          url:       origUrl,
          title,
          artist,
          year,
          coverData
        }),
      })

      if (!res.ok) {
        let msg = 'Tagging failed'
        try { msg = (await res.json()).error || msg } catch {}
        throw new Error(msg)
      }

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
        <input
          type="file"
          accept="image/*"
          onChange={e => setCoverFile(e.target.files?.[0] || null)}
          required
          style={{ display:'block', width:'100%', marginBottom:8 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Tagging…' : 'Tag & Download MP3'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {link && (
        <div style={{ marginTop: '1rem' }}>
          <a href={link} download={`${title.replace(/[^a-z0-9]/gi, '_')}.mp3`}>
            Download Tagged MP3
          </a>
        </div>
      )}
    </div>
)
}