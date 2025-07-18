// pages/api/youtube.js

import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { PassThrough } from 'stream'

ffmpeg.setFfmpegPath(ffmpegPath)

// Disable body parsing; we only support GET
export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  const { url } = req.query
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).end('Invalid or missing URL query parameter')
  }

  // Extract video ID from YouTube URL
  let videoId
  try {
    const u = new URL(url)
    videoId =
      u.searchParams.get('v') ||
      (u.hostname.includes('youtu.be') && u.pathname.slice(1))
  } catch {
    return res.status(400).end('Could not parse URL')
  }
  if (!videoId) {
    return res.status(400).end('Could not extract YouTube video ID')
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  // Tell the browser we’re sending back a downloadable MP3
  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${videoId}.mp3"`
  )

  // 1) Stream audio-only from YouTube
  const ytStream = ytdl(videoUrl, {
    filter: 'audioonly',
    quality: 'highestaudio',
    highWaterMark: 1 << 25, // 32 MB buffer
  })

  // 2) Pipe into FFmpeg to transcode on-the-fly
  const ffmpegStream = ffmpeg(ytStream)
    .audioCodec('libmp3lame')
    .format('mp3')
    .on('error', err => {
      console.error('FFmpeg error:', err)
      if (!res.headersSent) res.status(500).end()
    })
    .pipe(new PassThrough(), { end: true })

  // 3) Pipe the transcoded MP3 back to the client
  ffmpegStream.pipe(res)
}