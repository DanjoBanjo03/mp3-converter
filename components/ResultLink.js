// components/ResultLink.js
import React from 'react'

export default function ResultLink({ link, error }) {
  if (error) return <div style={{ color: 'red' }}>{error}</div>
  if (!link) return null
  return (
    <div style={{ marginTop: '1rem' }}>
      <a href={link} download>
        Download MP3
      </a>
    </div>
  )
}