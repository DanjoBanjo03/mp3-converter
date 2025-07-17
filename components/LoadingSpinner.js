// components/LoadingSpinner.js
import React from 'react'

export default function LoadingSpinner({ message = 'Processing...', size = 'medium' }) {
  const sizeMap = {
    small: '24px',
    medium: '40px',
    large: '60px'
  }
  
  const spinnerSize = sizeMap[size] || sizeMap.medium
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        width: spinnerSize,
        height: spinnerSize,
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      
      <p style={{
        margin: 0,
        color: '#666',
        fontSize: '1rem',
        fontWeight: '500'
      }}>
        {message}
      </p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
