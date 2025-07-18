// pages/api/youtube.js

export const config = {
  api: {
    bodyParser: false, // we only handle GET
  },
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  const raw = req.query.url
  if (!raw) {
    return res.status(400).end('Missing URL query parameter')
  }

  // Extract the video ID
  let videoId
  try {
    const u = new URL(raw)
    videoId =
      u.searchParams.get('v') ||
      (u.hostname.includes('youtu.be') && u.pathname.slice(1))
    if (!videoId) throw new Error()
  } catch {
    return res.status(400).end('Invalid YouTube URL')
  }

  // Call your RapidAPI YouTube→MP3 proxy
  try {
    const apiRes = await fetch(
      `https://${process.env.YOUTUBE_API_HOST}/dl?id=${encodeURIComponent(videoId)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.YOUTUBE_API_KEY,
          'X-RapidAPI-Host': process.env.YOUTUBE_API_HOST,
        },
      }
    )
    const data = await apiRes.json()
    if (!apiRes.ok || (!data.link && !data.data?.url)) {
      throw new Error(data.message || 'No MP3 URL in proxy response')
    }

    // Redirect browser to the MP3 URL so it downloads directly
    const mp3Url = data.data?.url || data.link
    return res.redirect(307, mp3Url)
  } catch (err) {
    console.error('RapidAPI proxy error:', err)
    return res.status(500).json({ error: err.message || 'Proxy failed' })
  }
}