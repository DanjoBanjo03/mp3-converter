// pages/api/youtube.js
import NodeID3 from 'node-id3'
import { convertYouTubeToMp3 } from '../../lib/youtube'

const USE_PROXY = process.env.USE_YT_API === 'true'
const API_KEY   = process.env.YOUTUBE_API_KEY
const API_HOST  = process.env.YOUTUBE_API_HOST

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { url, title, artist, year } = req.body
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' })
  }

  // 1) If metadata is present, always run built-in converter + tagging
  if (title && artist && year) {
    try {
      await convertYouTubeToMp3(url, res, { title, artist, year })
    } catch (err) {
      console.error('Tagging converter error:', err)
      if (!res.headersSent) {
        res.status(500).json({ error: err.message })
      }
    }
    return
  }

  // 2) No metadata: you can proxy if flag is on
  if (USE_PROXY) {
    try {
      const vid = new URL(url).searchParams.get('v')
      if (!vid) throw new Error('Invalid YouTube URL (missing v= parameter)')

      // fetch MP3 link from RapidAPI
      const apiRes = await fetch(
        `https://${API_HOST}/dl?id=${encodeURIComponent(vid)}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': API_HOST
          }
        }
      )
      const data = await apiRes.json()
      if (!apiRes.ok) throw new Error(data.message || JSON.stringify(data))

      return res.status(200).json({ downloadUrl: data.link })
    } catch (err) {
      console.error('YouTube proxy error:', err)
      return res.status(500).json({ error: err.message })
    }
  }

  // 3) Built-in conversion (no tags)
  try {
    await convertYouTubeToMp3(url, res)
  } catch (err) {
    console.error('Built-in converter error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message })
    }
  }
}