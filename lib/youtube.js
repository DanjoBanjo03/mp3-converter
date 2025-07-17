// lib/youtube.js
import ytdl from '@distube/ytdl-core'      // or 'ytdl-core' if you're not using the fork
import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import NodeID3 from 'node-id3'

// tell ffmpeg-static where ffmpeg lives
ffmpeg.setFfmpegPath(ffmpegPath)

/**
 * Download audio, convert to MP3, tag it, and stream back.
 * @param {string} url       YouTube URL
 * @param {import('next').NextApiResponse} res
 * @param {{title:string,artist:string,year:string}} [metadata]
 */
export async function convertYouTubeToMp3(url, res, metadata) {
  const videoId = ytdl.getURLVideoID(url)
  const tmpDir   = '/tmp'
  const audioRaw = path.join(tmpDir, `${videoId}.audio`)
  const audioMp3 = path.join(tmpDir, `${videoId}.mp3`)

  // 1) Download audio-only
  await new Promise((resolve, reject) => {
    ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
      .pipe(fs.createWriteStream(audioRaw))
      .on('finish', resolve)
      .on('error', reject)
  })

  // 2) Convert to MP3
  await new Promise((resolve, reject) => {
    ffmpeg(audioRaw)
      .audioCodec('libmp3lame')
      .audioQuality(4)
      .on('end', resolve)
      .on('error', reject)
      .save(audioMp3)
  })

  // 3) Embed ID3 tags if provided
  if (metadata) {
    const tags = {
      title:  metadata.title,
      artist: metadata.artist,
      year:   metadata.year,
      // you can add album, comment, etc. here if you like
    }
    console.log('🔖 Writing ID3 tags:', tags)
    const success = NodeID3.write(tags, audioMp3)
    console.log('🔖 ID3 write success?', success)
    if (!success) {
      console.warn('⚠️ ID3 tagging failed for', audioMp3)
    }
  }

  // 4) Stream MP3 to client
  res.setHeader('Content-Type', 'audio/mpeg')
  if (metadata) {
    const safeName = metadata.title.replace(/[^a-z0-9]/gi, '_')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeName}.mp3"`
    )
  }
  fs.createReadStream(audioMp3)
    .pipe(res)
    .on('finish', () => {
      fs.unlink(audioRaw,  () => {})
      fs.unlink(audioMp3, () => {})
    })
}