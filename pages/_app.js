// pages/_app.js
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Add global styles
    const style = document.createElement('style')
    style.textContent = `
      * {
        box-sizing: border-box;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f8f9fa;
      }
      
      #__next {
        min-height: 100vh;
      }
      
      /* Smooth scrolling */
      html {
        scroll-behavior: smooth;
      }
      
      /* Focus styles for accessibility */
      *:focus {
        outline: 2px solid #667eea;
        outline-offset: 2px;
      }
      
      /* Remove default button styles */
      button {
        font-family: inherit;
      }
      
      /* Remove default input styles */
      input {
        font-family: inherit;
      }
      
      /* Responsive images */
      img {
        max-width: 100%;
        height: auto;
      }
      
      /* Loading animation */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loading {
        animation: spin 1s linear infinite;
      }
      
      /* Utility classes */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return <Component {...pageProps} />
}
