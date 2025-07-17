// pages/index.js
import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>MP3 Converter</h1>
      <div style={{ marginTop: '2rem' }}>
        <Link href="/youtube" style={{ marginRight: '1rem', fontSize: '1.25rem', textDecoration: 'underline' }}>
          YouTube → MP3
        </Link>
        <Link href="/soundcloud" style={{ fontSize: '1.25rem', textDecoration: 'underline' }}>
          SoundCloud → MP3
        </Link>
      </div>
    </main>
  )
}