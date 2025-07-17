// lib/youtube.js
import ytdl from 'ytdl-core'
import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import NodeID3 from 'node-id3'

ffmpeg.setFfmpegPath(ffmpegPath)

async function getImageBuffer(coverData) {
  if (coverData.startsWith('data:')) {
    const [hdr, b64] = coverData.split(',')
    const mime = hdr.match(/data:(.*);base64/)[1]
    return { mime, buffer: Buffer.from(b64, 'base64') }
  } else {
    const resp = await fetch(coverData)
    if (!resp.ok) throw new Error('Cover fetch failed')
    const mime = resp.headers.get('content-type')
    const buf = Buffer.from(await resp.arrayBuffer())
    return { mime, buffer: buf }
  }
}

export async function convertYouTubeToMp3(url, res, metadata) {
  const videoId = ytdl.getURLVideoID(url)
  const tmpDir = '/tmp'
  const raw = path.join(tmpDir, `${videoId}.audio`)
  const out = path.join(tmpDir, `${videoId}.mp3`)

  // download raw audio
  await new Promise((r, x) => {
    ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
      .pipe(fs.createWriteStream(raw))
      .on('finish', r)
      .on('error', x)
  })

  // encode to MP3
  await new Promise((r, x) => {
    ffmpeg(raw)
      .audioCodec('libmp3lame')
      .audioQuality(4)
      .on('end', r)
      .on('error', x)
      .save(out)
  })

  // tag
  if (metadata) {
    const tags = {
      title: metadata.title,
      artist: metadata.artist,
      year: metadata.year
    }
    if (metadata.coverData) {
      const { mime, buffer } = await getImageBuffer(metadata.coverData)
      tags.image = {
        mime,
        type: { id: 3, name: 'front cover' },
        description: 'Cover',
        imageBuffer: buffer
      }
    }
    NodeID3.write(tags, out)
  }

  // stream
  res.setHeader('Content-Type', 'audio/mpeg')
  if (metadata?.title) {
    const safe = metadata.title.replace(/[^a-z0-9]/gi, '_')
    res.setHeader('Content-Disposition', `attachment; filename="${safe}.mp3"`)
  }
  fs.createReadStream(out).pipe(res)
}