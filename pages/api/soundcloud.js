// pages/api/soundcloud.js
import scdl from 'soundcloud-downloader'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import fs from 'fs'
import os from 'os'
import path from 'path'
import NodeID3 from 'node-id3'

const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID
ffmpeg.setFfmpegPath(ffmpegPath)

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

  // normalize URL
  let trackUrl
  try {
    const u = new URL(url)
    trackUrl = u.origin + u.pathname
  } catch {
    return res.status(400).json({ error: 'Invalid SoundCloud URL' })
  }

  try {
    // 1) Info + HLS endpoint
    const info = await scdl.getInfo(trackUrl, CLIENT_ID)
    const hlsTrans = info.media.transcodings.find(t => t.format?.protocol === 'hls')
    if (!hlsTrans) throw new Error('No HLS stream available')

    const uobj = new URL(hlsTrans.url)
    uobj.searchParams.set('client_id', CLIENT_ID)
    const pr = await fetch(uobj.toString())
    if (!pr.ok) throw new Error('Failed to resolve HLS URL')
    const { url: playlistUrl } = await pr.json()

    // 2) Transcode to temp MP3
    const tmpFile = path.join(os.tmpdir(), `${Date.now()}.mp3`)
    await new Promise((r, x) => {
      ffmpeg(playlistUrl)
        .inputOptions('-protocol_whitelist', 'file,http,https,tcp,tls')
        .format('mp3')
        .audioCodec('libmp3lame')
        .on('end', r)
        .on('error', x)
        .save(tmpFile)
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
            description: 'Cover',
            imageBuffer: Buffer.from(m[2], 'base64')
          }
        }
      }
      NodeID3.write(tags, tmpFile)
    }

    // 4) Stream back
    const safe = (title || info.title || 'track').replace(/[\/\\?%*:|"<>]/g, '_')
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Disposition', `attachment; filename="${safe}.mp3"`)

    fs.createReadStream(tmpFile)
      .pipe(res)
      .on('finish', () => fs.unlink(tmpFile, () => {}))

  } catch (err) {
    console.error('SoundCloud API error:', err)
    res.status( err.statusCode === 404 ? 404 : 500 ).json({ error: err.message })
  }
}