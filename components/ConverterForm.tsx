// components/ConverterForm.js
import { useState } from 'react'

export default function ConverterForm({ placeholder, onSubmit, loading }) {
  const [url, setUrl] = useState('')

  return (
    <div style={{ margin: '1rem 0' }}>
      <form
        onSubmit={e => {
          e.preventDefault()
          onSubmit(url)
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <input
          type="url"
          value={url}
          placeholder={placeholder}
          onChange={e => setUrl(e.target.value)}
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
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'translateY(-2px)';
              target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              const target = e.target as HTMLButtonElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          {loading ? '🔄 Converting…' : '🚀 Convert to MP3'}
        </button>
      </form>
    </div>
  )
}