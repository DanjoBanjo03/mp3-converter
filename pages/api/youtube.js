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

  // 1) Extract the YouTube video ID (supports full & youtu.be URLs)
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

  // 2) Proxy through RapidAPI
  try {
    const apiRes = await fetch(
      `https://${process.env.YOUTUBE_API_HOST}/dl?id=${encodeURIComponent(
        videoId
      )}`,
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
      throw new Error(data.message || 'No MP3 URL returned from proxy')
    }

    // 3) Return JSON with the direct download URL
    return res.status(200).json({
      downloadUrl: data.data?.url || data.link,
    })
  } catch (err) {
    console.error('YouTube proxy error:', err)
    return res
      .status(500)
      .json({ error: err.message || 'Proxy conversion failed' })
  }
}