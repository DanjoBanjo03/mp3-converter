import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>MP3 Converter</h1>
      <div className="options">
        <Link href="/youtube">YouTube → MP3</Link>
        <br></br>
        <Link href="/soundcloud">SoundCloud → MP3</Link>
      </div>
    </main>
  );
}