// pages/api/youtube.js

import ytdl from '@distube/ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import fs from 'fs'
import os from 'os'
import path from 'path'
import NodeID3 from 'node-id3'

ffmpeg.setFfmpegPath(ffmpegPath)
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { url, title, artist, year, coverData } = req.body || {}
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' })
  }

  // Strip extra params, pull bare video ID
  let videoId
  try {
    const u = new URL(url)
    videoId = u.searchParams.get('v') ||
              (u.hostname.includes('youtu.be') && u.pathname.slice(1))
    if (!videoId) throw new Error()
  } catch {
    return res.status(400).json({ error: 'Could not extract video ID' })
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  // Step #1: try to fetch full metadata
  console.log('▶️ Normalized videoUrl:', videoUrl)
  let info
  try {
    info = await ytdl.getInfo(videoUrl)
  } catch (err1) {
    console.warn('ytdl.getInfo failed, trying getBasicInfo:', err1.message)
    try {
      info = await ytdl.getBasicInfo(videoUrl)
    } catch (err2) {
      console.warn('Both ytdl methods failed, falling back to RapidAPI proxy:', err2)

      // RapidAPI proxy branch
      try {
        const vid = encodeURIComponent(videoId)
        const apiRes = await fetch(
          `https://${process.env.YOUTUBE_API_HOST}/dl?id=${vid}`, {
            method: 'GET',
            headers: {
              'X-RapidAPI-Key':  process.env.YOUTUBE_API_KEY,
              'X-RapidAPI-Host': process.env.YOUTUBE_API_HOST,
            }
          }
        )
        const data = await apiRes.json()
        if (!apiRes.ok || (!data.link && !data.data?.url)) {
          throw new Error(data.message || 'No MP3 URL in proxy response')
        }
        return res.status(200).json({
          downloadUrl: data.data?.url || data.link
        })
      } catch (proxyErr) {
        console.error('RapidAPI proxy also failed:', proxyErr)
        return res.status(500).json({
          error: proxyErr.message || 'Both ytdl and proxy failed'
        })
      }
    }
  }

  // At this point `info` is set
  const base = (title || info.videoDetails.title || `yt-${videoId}`)
    .replace(/[\/\\?%*:|"<>]/g, '_')
  const tmpDir  = os.tmpdir()
  const rawPath = path.join(tmpDir, `${base}.raw`)
  const mp3Path = path.join(tmpDir, `${base}.mp3`)

  try {
    // 2) Download raw audio
    await new Promise((resolve, reject) => {
      ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' })
        .pipe(fs.createWriteStream(rawPath))
        .on('finish', resolve)
        .on('error', reject)
    })

    // 3) Transcode to MP3
    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioCodec('libmp3lame')
        .audioQuality(4)
        .on('end', resolve)
        .on('error', reject)
        .save(mp3Path)
    })

    // 4) Tag if requested
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

    // 5) Stream MP3 back
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