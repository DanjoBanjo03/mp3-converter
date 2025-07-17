// components/Footer.js
import React from 'react'

export default function Footer() {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '2rem 1rem',
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '0.9rem'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>
          Made with ❤️ for music lovers
        </p>
        <p style={{ 
          margin: 0, 
          fontSize: '0.8rem',
          opacity: 0.7
        }}>
          Convert responsibly and respect copyright laws
        </p>
      </div>
    </footer>
  )
}
