// pages/api/youtube.js

export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' }, // allow JSON in POST
  },
}

async function getMp3Url(videoId) {
  const apiRes = await fetch(
    `https://${process.env.YOUTUBE_API_HOST}/dl?id=${encodeURIComponent(videoId)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key':  process.env.YOUTUBE_API_KEY,
        'X-RapidAPI-Host': process.env.YOUTUBE_API_HOST,
      },
    }
  )
  const data = await apiRes.json()
  if (!apiRes.ok || (!data.link && !data.data?.url)) {
    throw new Error(data.message || 'No MP3 URL from proxy')
  }
  return data.link || data.data.url
}

export default async function handler(req, res) {
  // Support GET for direct download link
  if (req.method === 'GET') {
    const { url } = req.query
    if (!url) return res.status(400).send('No URL provided')
    let videoId
    try {
      const u = new URL(url)
      videoId = u.searchParams.get('v') ||
                (u.hostname.includes('youtu.be') && u.pathname.slice(1))
      if (!videoId) throw new Error()
    } catch {
      return res.status(400).send('Invalid YouTube URL')
    }

    try {
      const mp3Url = await getMp3Url(videoId)
      const mp3Res = await fetch(mp3Url)
      if (!mp3Res.ok) {
        // Redirect the browser to the proxy directly
        res.setHeader('Location', mp3Url)
        return res.status(307).end()
      }
      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Content-Disposition', `attachment; filename="${videoId}.mp3"`)
      return mp3Res.body.pipe(res)
    } catch (err) {
      console.error('Stream/download error:', err)
      return res.status(500).send('Download failed')
    }
  }

  // Otherwise POST JSON for preview
  if (req.method === 'POST') {
    const { url } = req.body || {}
    if (!url) return res.status(400).json({ error: 'No URL provided' })

    let videoId
    try {
      const u = new URL(url)
      videoId = u.searchParams.get('v') ||
                (u.hostname.includes('youtu.be') && u.pathname.slice(1))
      if (!videoId) throw new Error()
    } catch {
      return res.status(400).json({ error: 'Invalid YouTube URL' })
    }

    try {
      const downloadUrl = `/api/youtube?url=${encodeURIComponent(url)}`
      return res.status(200).json({ downloadUrl })
    } catch (err) {
      console.error('Proxy JSON error:', err)
      return res.status(500).json({ error: 'Could not generate download link' })
    }
  }

  // Everything else:
  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end()
}