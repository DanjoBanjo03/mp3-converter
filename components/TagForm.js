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
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: '2px solid #e1e5e9',
          color: '#666',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          transition: 'all 0.3s ease',
          marginBottom: '1.5rem'
        }}
        onMouseOver={(e) => {
          e.target.style.borderColor = '#667eea';
          e.target.style.color = '#667eea';
        }}
        onMouseOut={(e) => {
          e.target.style.borderColor = '#e1e5e9';
          e.target.style.color = '#666';
        }}
      >
        ← Back
      </button>

      <div style={{
        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          color: '#333',
          fontSize: '1.2rem',
          fontWeight: '600'
        }}>
          🏷️ Add Metadata
        </h3>
        <p style={{
          margin: '0 0 1.5rem 0',
          color: '#666',
          fontSize: '0.9rem',
          lineHeight: '1.5'
        }}>
          Add custom metadata to your MP3 file for better organization
        </p>
      </div>

      <form onSubmit={handleTag} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Song Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            border: '2px solid #e1e5e9',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e1e5e9';
            e.target.style.boxShadow = 'none';
          }}
        />
        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={e => setArtist(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            border: '2px solid #e1e5e9',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e1e5e9';
            e.target.style.boxShadow = 'none';
          }}
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={e => setYear(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            border: '2px solid #e1e5e9',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.3s ease',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#667eea';
            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e1e5e9';
            e.target.style.boxShadow = 'none';
          }}
        />
        <div style={{
          border: '2px dashed #e1e5e9',
          borderRadius: '12px',
          padding: '1rem',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}>
          <input
            type="file"
            accept="image/*"
            onChange={e => setCoverFile(e.target.files?.[0] || null)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer'
            }}
          />
          <div style={{ pointerEvents: 'none' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              {coverFile ? coverFile.name : 'Click to upload cover art (optional)'}
            </p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #e74c3c, #c0392b)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(231, 76, 60, 0.3)',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(231, 76, 60, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
            }
          }}
        >
          {loading ? '🔄 Tagging…' : '🏷️ Tag & Download MP3'}
        </button>
      </form>
      {error && (
        <div style={{
          color: '#e74c3c',
          background: '#fdf2f2',
          padding: '1rem',
          borderRadius: '12px',
          marginTop: '1rem',
          border: '1px solid #fecaca',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}
    </div>
  )
}