// pages/api/youtube.js
import { spawn } from 'child_process'
import ffmpegPath from 'ffmpeg-static'
import ffmpeg     from 'fluent-ffmpeg'
import fs         from 'fs'
import os         from 'os'
import path       from 'path'
import NodeID3    from 'node-id3'
import youtubedl  from 'youtube-dl-exec'

// Point fluent-ffmpeg at the static binary
ffmpeg.setFfmpegPath(ffmpegPath)

// Allow large Base64 payloads (for cover art)
export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { url, title, artist, year, coverData } = req.body || {}
  if (!url) {
    return res.status(400).json({ error: 'No URL provided' })
  }

  // Normalize YouTube URL (strip extra params)
  let videoUrl
  try {
    const u = new URL(url)
    const v = u.searchParams.get('v')
    if (!v) throw new Error('Missing v parameter')
    videoUrl = `https://www.youtube.com/watch?v=${v}`
  } catch {
    return res.status(400).json({ error: 'Invalid YouTube URL' })
  }

  // Prepare temp output path
  const tmpDir  = os.tmpdir()
  const base    = (title || `yt-${Date.now()}`)
    .replace(/[\/\\?%*:|"<>]/g, '_')
  const mp3Path = path.join(tmpDir, `${base}.mp3`)

  try {
    // 1) Download & convert via youtube-dl-exec
    await youtubedl(videoUrl, {
      output: mp3Path,
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: '0',         // best quality
      noPlaylist: true,
      ffmpegLocation: ffmpegPath // <<< tell ytdl where ffmpeg lives
    })

    // 2) Embed ID3 tags if provided
    if (title && artist && year) {
      const tags = { title, artist, year }
      if (coverData) {
        const m = coverData.match(/data:(.+);base64,(.+)/)
        if (m) {
          tags.image = {
            mime: m[1],
            type: { id: 3, name: 'front cover' },
            description: 'Cover art',
            imageBuffer: Buffer.from(m[2], 'base64')
          }
        }
      }
      NodeID3.write(tags, mp3Path)
    }

    // 3) Stream back to client
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Disposition', `attachment; filename="${base}.mp3"`)
    fs.createReadStream(mp3Path)
      .pipe(res)
      .on('finish', () => {
        fs.unlink(mp3Path, () => {})
      })

  } catch (err) {
    console.error('youtube-dl error:', err)
    res.status(500).json({ error: err.message || 'Conversion failed' })
  }
}