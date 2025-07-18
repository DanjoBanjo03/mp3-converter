// pages/api/youtube.js

export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' }, // small JSON only
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { url } = req.body || {}
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' })
  }

  // 1) Extract video ID
  let videoId
  try {
    const u = new URL(url)
    videoId =
      u.searchParams.get('v') ||
      (u.hostname.includes('youtu.be') && u.pathname.slice(1))
    if (!videoId) throw new Error()
  } catch {
    return res.status(400).json({ error: 'Invalid YouTube URL' })
  }

  // 2) Proxy via RapidAPI to get an MP3 URL
  let mp3Url
  try {
    const apiRes = await fetch(
      `https://${process.env.YOUTUBE_API_HOST}/dl?id=${encodeURIComponent(videoId)}`,
      {
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
    mp3Url = data.link || data.data.url
  } catch (err) {
    console.error('YouTube proxy error:', err)
    return res.status(500).json({ error: err.message || 'Proxy conversion failed' })
  }

  // 3) Fetch the MP3 server-side and stream it back
  try {
    const mp3Res = await fetch(mp3Url)
    if (!mp3Res.ok) {
      console.error(`Proxy MP3 fetch failed: ${mp3Res.status}`)
      throw new Error('Proxy MP3 fetch failed')
    }
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Disposition', `attachment; filename="${videoId}.mp3"`)
    return mp3Res.body.pipe(res)
  } catch (err) {
    console.error('Streaming error:', err)
    return res.status(500).json({ error: err.message || 'Failed to stream MP3' })
  }
}