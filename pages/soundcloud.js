import ConverterForm from '../components/ConverterForm';
import ResultLink    from '../components/ResultLink';
import { useState }  from 'react';

export default function SoundCloudPage() {
  const [url, setUrl]       = useState('');
  const [link, setLink]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  async function handleConvert(trackUrl) {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/soundcloud', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: trackUrl })
    });
    const data = await res.json();
    if (res.ok) setLink(data.downloadUrl);
    else        setError(data.error);
    setLoading(false);
  }

  return (
    <>
      <h2>SoundCloud → MP3</h2>
      <ConverterForm
        placeholder="https://soundcloud.com/…"
        onSubmit={handleConvert}
        loading={loading}
      />
      <ResultLink link={link} error={error} />
    </>
  );
}