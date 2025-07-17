// components/TagForm.js
import { useState } from 'react'

export default function TagForm({
  origUrl,
  onBack,
  apiEndpoint = '/api/youtube',
  loading,
  onSubmit
}) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [year, setYear] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [error, setError] = useState(null)

  async function handleTag(e) {
    e.preventDefault()
    setError(null)

    // read cover as base64 if provided
    let coverData = null
    if (coverFile) {
      coverData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(coverFile)
      })
    }

    onSubmit({ title, artist, year, coverData })
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
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={e => setArtist(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={e => setYear(e.target.value)}
          required
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => setCoverFile(e.target.files?.[0] || null)}
          style={{ display: 'block', width: '100%', marginBottom: 8 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Tagging…' : 'Tag & Download MP3'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
    </div>
  )
}