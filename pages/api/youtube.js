// pages/api/youtube.js

export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' },
  },
}

// Helper to pull the MP3 URL from RapidAPI
async function fetchProxyMp3Url(videoId) {
  const resp = await fetch(
    `https://${process.env.YOUTUBE_API_HOST}/dl?id=${encodeURIComponent(videoId)}`,
    {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key':  process.env.YOUTUBE_API_KEY,
        'X-RapidAPI-Host': process.env.YOUTUBE_API_HOST,
      },
    }
  )
  const data = await resp.json()
  if (!resp.ok || (!data.link && !data.data?.url)) {
    throw new Error(data.message || 'No MP3 URL returned from proxy')
  }
  return data.link || data.data.url
}

export default async function handler(req, res) {
  // —— DOWNLOAD MODE ——  
  // GET /api/youtube?url=<YouTube URL>
  if (req.method === 'GET') {
    const rawUrl = req.query.url
    if (!rawUrl) {
      return res.status(400).send('No URL provided')
    }
    // extract videoId
    let videoId
    try {
      const u = new URL(rawUrl)
      videoId = u.searchParams.get('v') ||
                (u.hostname.includes('youtu.be') && u.pathname.slice(1))
      if (!videoId) throw new Error()
    } catch {
      return res.status(400).send('Invalid YouTube URL')
    }

    try {
      const mp3Url = await fetchProxyMp3Url(videoId)
      const mp3Res = await fetch(mp3Url)
      if (mp3Res.ok) {
        res.setHeader('Content-Type', 'audio/mpeg')
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${videoId}.mp3"`
        )
        return mp3Res.body.pipe(res)
      }
      // fallback to redirect
      res.setHeader('Location', mp3Url)
      return res.status(307).end()
    } catch (err) {
      console.error('Download error:', err)
      return res.status(500).send('Download failed')
    }
  }

  // —— PREVIEW MODE ——  
  // POST /api/youtube  { url }
  if (req.method === 'POST') {
    const { url } = req.body || {}
    if (!url) {
      return res.status(400).json({ error: 'No URL provided' })
    }
    try {
      new URL(url) // validate
    } catch {
      return res.status(400).json({ error: 'Invalid YouTube URL' })
    }
    const downloadLink = `/api/youtube?url=${encodeURIComponent(url)}`
    return res.status(200).json({ downloadUrl: downloadLink })
  }

  // —— METHOD NOT ALLOWED ——  
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}