// lib/youtube.js
import ytdl from '@distube/ytdl-core'
import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import NodeID3 from 'node-id3'

// Tell ffmpeg-static where ffmpeg lives
ffmpeg.setFfmpegPath(ffmpegPath)

/**
 * Decode Base64 data URL or fetch remote URL into a Buffer
 */
async function getImageBuffer(coverData) {
  if (coverData.startsWith('data:')) {
    const [header, base64] = coverData.split(',')
    const mime = header.match(/data:(.*);base64/)[1]
    return { mime, buffer: Buffer.from(base64, 'base64') }
  } else {
    const resp = await fetch(coverData)
    if (!resp.ok) throw new Error('Could not fetch cover image')
    const mime = resp.headers.get('content-type') || 'image/jpeg'
    const array = await resp.arrayBuffer()
    return { mime, buffer: Buffer.from(array) }
  }
}

/**
 * Download audio, convert to MP3, optionally tag with ID3 (including cover),
 * and stream back via the Next.js API response.
 */
export async function convertYouTubeToMp3(url, res, metadata) {
  // 1) Download raw audio to temp
  const videoId = ytdl.getURLVideoID(url)
  const tmpDir   = '/tmp'
  const rawPath  = path.join(tmpDir, `${videoId}.audio`)
  const mp3Path  = path.join(tmpDir, `${videoId}.mp3`)

  await new Promise((r,e) => {
    ytdl(url, { filter:'audioonly', quality:'highestaudio' })
      .pipe(fs.createWriteStream(rawPath))
      .on('finish', r).on('error', e)
  })

  // 2) Convert to MP3
  await new Promise((r,e) => {
    ffmpeg(rawPath)
      .audioCodec('libmp3lame')
      .audioQuality(4)
      .on('end', r).on('error', e)
      .save(mp3Path)
  })

  // 3) Tagging
  if (metadata) {
    const tags = {
      title:  metadata.title,
      artist: metadata.artist,
      year:   metadata.year
    }
    if (metadata.coverData) {
      const { mime, buffer } = await getImageBuffer(metadata.coverData)
      tags.image = {
        mime,
        type: { id: 3, name: 'front cover' },
        description: 'Cover art',
        imageBuffer: buffer
      }
    }
    console.log('🔖 Writing ID3 tags:', tags)
    NodeID3.write(tags, mp3Path)
  }

  // 4) Stream MP3
  res.setHeader('Content-Type', 'audio/mpeg')
  if (metadata?.title) {
    const safe = metadata.title.replace(/[^a-z0-9]/gi, '_')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safe}.mp3"`
    )
  }
  fs.createReadStream(mp3Path)
    .pipe(res)
    .on('finish', () => {
      fs.unlink(rawPath, () => {})
      fs.unlink(mp3Path,  () => {})
    })
}