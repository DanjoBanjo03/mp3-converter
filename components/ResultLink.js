// components/ResultLink.js
import React from 'react'

export default function ResultLink({ link, error }) {
  if (error) return (
    <div style={{
      color: '#e74c3c',
      background: '#fdf2f2',
      padding: '1rem',
      borderRadius: '12px',
      border: '1px solid #fecaca',
      fontWeight: '500'
    }}>
      {error}
    </div>
  )

  if (!link) return null

  const buttonStyles = {
    display: 'inline-block',
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
  }

  const hoverStyles = (e, hover) => {
    if (hover) {
      e.currentTarget.style.transform = 'translateY(-2px)'
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(52, 152, 219, 0.4)'
    } else {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)'
    }
  }

  return (
    <div style={{
      marginTop: '1rem',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
        padding: '1.5rem',
        borderRadius: '16px',
        marginBottom: '1rem',
        boxShadow: '0 4px 15px rgba(39, 174, 96, 0.2)'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '0.5rem'
        }}>
          ✅
        </div>
        <p style={{
          color: 'white',
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          Conversion Complete!
        </p>
      </div>

      <button
        onClick={() => window.open(link, '_blank')}
        style={buttonStyles}
        onMouseOver={e => hoverStyles(e, true)}
        onMouseOut={e => hoverStyles(e, false)}
      >
        📥 Download MP3
      </button>
    </div>
  )
}