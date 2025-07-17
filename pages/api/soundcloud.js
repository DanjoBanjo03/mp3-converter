// pages/api/soundcloud.js
import scdl from 'soundcloud-downloader'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID
ffmpeg.setFfmpegPath(ffmpegPath)

export const config = {
  api: { bodyParser: { sizeLimit: '5mb' } }
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

  try {
    // 1) Get track info
    const info = await scdl.getInfo(url, CLIENT_ID)
    const safeTitle = (info.title || 'track')
      .replace(/[\/\\?%*:|"<>]/g, '_') + '.mp3'

    // 2) Try progressive preview
    const prog = info.media.transcodings.find(t =>
      t.format?.protocol === 'progressive'
    )
    if (prog) {
      const progRes = await fetch(`${prog.url}?client_id=${CLIENT_ID}`)
      if (!progRes.ok) throw new Error('Failed to resolve preview URL')
      const { url: previewUrl } = await progRes.json()
      const mp3Res = await fetch(previewUrl)
      if (!mp3Res.ok) throw new Error('Failed to download preview MP3')

      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(safeTitle)}"`
      )
      return mp3Res.body.pipe(res)
    }

    // 3) Fallback: resolve HLS transcoding endpoint
    const hls = info.media.transcodings.find(t =>
      t.format?.protocol === 'hls'
    )
    if (!hls) {
      throw new Error('No HLS stream available for full download')
    }

    // Fetch the JSON that gives the playlist URL
    const hlsRes = await fetch(`${hls.url}?client_id=${CLIENT_ID}`)
    if (!hlsRes.ok) throw new Error('Failed to resolve HLS URL')
    const { url: playlistUrl } = await hlsRes.json()

    // Stream the HLS playlist through FFmpeg
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(safeTitle)}"`
    )

    ffmpeg(playlistUrl)
      .inputOptions([
        '-protocol_whitelist', 'file,http,https,tcp,tls',
        '-timeout', '3000000'
      ])
      .format('mp3')
      .audioCodec('libmp3lame')
      .on('start', cmd => console.log('FFmpeg start:', cmd))
      .on('error', err => {
        console.error('FFmpeg error:', err)
        if (!res.headersSent) res.status(500).end()
      })
      .on('end', () => console.log('FFmpeg finished'))
      .pipe(res, { end: true })

  } catch (err) {
    console.error('Error in /api/soundcloud:', err)
    const status = err.statusCode === 404 ? 404 : 500
    res.status(status).json({ error: err.message })
  }
}