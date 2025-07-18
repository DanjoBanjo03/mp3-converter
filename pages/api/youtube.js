// pages/api/youtube.js

import ytdl from 'play-dl'                   // we’ll use play-dl for reliability
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

// Turn off body parsing; we only handle GET
export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).send('Method Not Allowed')
  }

  const raw = req.query.url
  if (!raw || typeof raw !== 'string') {
    return res.status(400).send('Missing or invalid URL query parameter')
  }

  // Extract video ID
  let videoId
  try {
    const u = new URL(raw)
    videoId =
      u.searchParams.get('v') ||
      (u.hostname.includes('youtu.be') && u.pathname.slice(1))
    if (!videoId) throw new Error()
  } catch {
    return res.status(400).send('Invalid YouTube URL')
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  // Set headers to force download of MP3
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${videoId}.mp3"`
  )

  try {
    // 1) Get an audio-only stream from YouTube
    const ply = await ytdl.stream(videoUrl, { quality: 2 })  
    if (!ply.stream) throw new Error('Could not get audio stream')

    // 2) Transcode on-the-fly and pipe directly into res
    ffmpeg(ply.stream)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('start', cmd => console.log('FFmpeg start:', cmd))
      .on('error', err => {
        console.error('FFmpeg Error:', err)
        // If headers not yet sent, return an error code
        if (!res.headersSent) res.status(500).end(`Conversion error: ${err.message}`)
      })
      .on('end', () => {
        console.log('FFmpeg finished successfully')
      })
      .pipe(res, { end: true })

  } catch (err) {
    console.error('Conversion failed:', err)
    return res.status(500).send(`Conversion failed: ${err.message}`)
  }
}