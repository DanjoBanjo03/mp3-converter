// pages/api/youtube.js

import ytdl    from 'ytdl-core'
import ffmpeg  from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import fs      from 'fs'
import os      from 'os'
import path    from 'path'
import NodeID3 from 'node-id3'

// Tell fluent-ffmpeg where to find the binary
ffmpeg.setFfmpegPath(ffmpegPath)

// Allow big cover-art payloads
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { url, title, artist, year, coverData } = req.body || {}
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' })
  }

  // Normalize to bare watch URL
  let videoId
  try {
    const u = new URL(url)
    videoId = u.searchParams.get('v') || (u.hostname.includes('youtu.be') && u.pathname.slice(1))
    if (!videoId) throw new Error()
  } catch {
    return res.status(400).json({ error: 'Could not extract video ID' })
  }
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  // Fetch metadata so we can name/tag the file
  let info
  try {
    info = await ytdl.getInfo(videoUrl)
  } catch (err) {
    console.error('ytdl-core metadata error:', err)
    return res.status(500).json({ error: 'Failed to retrieve YouTube metadata' })
  }

  // Build safe file names
  const base = (title || info.videoDetails.title || `yt-${videoId}`)
    .replace(/[\/\\?%*:|"<>]/g, '_')
  const tmpDir  = os.tmpdir()
  const rawPath = path.join(tmpDir, `${base}.raw`)
  const mp3Path = path.join(tmpDir, `${base}.mp3`)

  try {
    // 1) Download raw audio (.raw)
    await new Promise((resolve, reject) => {
      ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' })
        .pipe(fs.createWriteStream(rawPath))
        .on('finish', resolve)
        .on('error', reject)
    })

    // 2) Convert to MP3
    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioCodec('libmp3lame')
        .audioQuality(4)
        .on('end', resolve)
        .on('error', reject)
        .save(mp3Path)
    })

    // 3) Tag if requested
    if (title && artist && year) {
      const tags = { title, artist, year }
      if (coverData) {
        const m = coverData.match(/data:(.+);base64,(.+)/)
        if (m) {
          tags.image = {
            mime: m[1],
            type: { id: 3, name: 'front cover' },
            description: 'Cover art',
            imageBuffer: Buffer.from(m[2], 'base64'),
          }
        }
      }
      NodeID3.write(tags, mp3Path)
    }

    // 4) Stream MP3 back
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Disposition', `attachment; filename="${base}.mp3"`)
    const stream = fs.createReadStream(mp3Path)
    stream.pipe(res)
    stream.on('finish', () => {
      fs.unlink(rawPath, () => {})
      fs.unlink(mp3Path,  () => {})
    })
  } catch (err) {
    console.error('Conversion error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal server error' })
    }
  }
}