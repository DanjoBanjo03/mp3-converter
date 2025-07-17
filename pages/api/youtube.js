// pages/api/youtube.js
import { convertYouTubeToMp3 } from '../../lib/youtube';

const USE_PROXY = process.env.USE_YT_API === 'true';
const API_KEY   = process.env.YOUTUBE_API_KEY;
const API_HOST  = process.env.YOUTUBE_API_HOST;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' });
  }

  if (USE_PROXY) {
    // Proxy through RapidAPI
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (!videoId) {
        throw new Error('Invalid YouTube URL (missing v= parameter)');
      }

      const apiRes = await fetch(
        `https://${API_HOST}/dl?id=${encodeURIComponent(videoId)}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
          }
        }
      );

      const data = await apiRes.json();
      if (!apiRes.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }

      return res.status(200).json({ downloadUrl: data.link });
    } catch (err) {
      console.error('YouTube proxy error:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Built-in converter
    try {
      await convertYouTubeToMp3(url, res);
    } catch (err) {
      console.error('Built-in converter error:', err);
      // If convertYouTubeToMp3 writes directly to res and ends it, this may not run.
      return res.status(500).json({ error: err.message });
    }
  }
}