// pages/api/youtube.js

import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import { PassThrough } from 'stream'

ffmpeg.setFfmpegPath(ffmpegPath)

// Disable body parsing—this handler only supports GET
export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).send('Method Not Allowed')
  }

  const rawUrl = req.query.url
  if (!rawUrl) {
    return res.status(400).send('No URL provided')
  }

  let videoId
  try {
    const u = new URL(rawUrl)
    videoId =
      u.searchParams.get('v') ||
      (u.hostname.includes('youtu.be') && u.pathname.slice(1))
    if (!videoId) throw new Error()
  } catch {
    return res.status(400).send('Invalid YouTube URL')
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  res.setHeader('Content-Type', 'audio/mpeg')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${videoId}.mp3"`
  )

  // 1) Spawn ytdl audio-only stream
  const audioStream = ytdl(videoUrl, {
    filter: 'audioonly',
    quality: 'highestaudio',
    highWaterMark: 1 << 25, // 32 MB buffer
  })

  // 2) Pipe into ffmpeg to convert to mp3 on the fly
  const ffmpegStream = ffmpeg(audioStream)
    .audioCodec('libmp3lame')
    .format('mp3')
    .on('error', err => {
      console.error('ffmpeg error:', err)
      if (!res.headersSent) {
        res.status(500).end()
      }
    })
    .pipe(new PassThrough(), { end: true })

  // 3) Pipe ffmpeg output to the response
  ffmpegStream.pipe(res)
}