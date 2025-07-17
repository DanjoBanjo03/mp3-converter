// pages/api/youtube.js
import { convertYouTubeToMp3 } from '../../lib/youtube'

const USE_PROXY = process.env.USE_YT_API === 'true'
const API_KEY   = process.env.YOUTUBE_API_KEY
const API_HOST  = process.env.YOUTUBE_API_HOST

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { url, title, artist, year, coverData } = req.body
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' })
  }

  // 1) If metadata (including coverData) is present, always tag via built-in converter
  if (title && artist && year && coverData) {
    try {
      await convertYouTubeToMp3(url, res, { title, artist, year, coverData })
    } catch (err) {
      console.error('Tagging converter error:', err)
      if (!res.headersSent) {
        res.status(500).json({ error: err.message })
      }
    }
    return
  }

  // 2) No metadata: proxy via RapidAPI if enabled
  if (USE_PROXY) {
    try {
      const vid = new URL(url).searchParams.get('v')
      if (!vid) throw new Error('Invalid YouTube URL (missing v= parameter)')

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

  // 3) Built-in conversion without tags
  try {
    await convertYouTubeToMp3(url, res)
  } catch (err) {
    console.error('Built-in converter error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message })
    }
  }
}

// Increase Next.js API body size limit to allow large Base64 images
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust as needed
    },
  },
}