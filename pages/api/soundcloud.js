// pages/api/soundcloud.js
import scdl from 'soundcloud-downloader'

const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { url } = req.body
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' })
  }

  try {
    const info   = await scdl.getInfo(url, CLIENT_ID)
    const title  = info.title.replace(/[\/\\?%*:|"<>]/g, '_')
    const stream = await scdl.download(url, CLIENT_ID)

    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(title)}.mp3"`
    )
    stream.pipe(res)
  } catch (err) {
    console.error('SoundCloud download error:', err)
    if (err.statusCode === 404) {
      res.status(404).json({ error: 'Track not found or not accessible' })
    } else {
      res.status(500).json({ error: 'Failed to download track' })
    }
  }
}