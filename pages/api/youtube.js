// pages/api/youtube.js

import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { PassThrough } from 'stream'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// Disable Next.js’s default body parser; we only handle GET
export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).send('Method Not Allowed')
  }

  const { url } = req.query
  if (!url || typeof url !== 'string' || !ytdl.validateURL(url)) {
    return res.status(400).send('Invalid or missing URL query parameter')
  }

  // Extract the YouTube video ID
  let videoId
  try {
    const u = new URL(url)
    videoId =
      u.searchParams.get('v') ||
      (u.hostname.includes('youtu.be') && u.pathname.slice(1))
    if (!videoId) throw new Error()
  } catch {
    return res.status(400).send('Could not extract YouTube video ID')
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  // Set headers so browser treats it as a downloadable MP3
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${videoId}.mp3"`
  )

  try {
    // 1) Stream audio-only from YouTube
    const ytStream = ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25, // 32 MB buffer
    })

    // 2) Pipe into FFmpeg to transcode to MP3 on-the-fly
    const ffmpegStream = ffmpeg(ytStream)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('error', err => {
        console.error('FFmpeg error:', err)
        // we won't throw here to avoid unhandled exceptions
      })
      .pipe(new PassThrough(), { end: true })

    // 3) Pipe the resulting MP3 to the client
    ffmpegStream.pipe(res)
  } catch (err) {
    console.error('Conversion failed:', err)
    // Return a clean error response
    res.status(500).send(`Conversion failed: ${err.message}`)
  }
}