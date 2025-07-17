// lib/youtube.js
import ytdl from '@distube/ytdl-core';import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

// Tell fluent-ffmpeg where to find the static binary
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Downloads a YouTube video’s audio, converts it to MP3, and streams it to `res`.
 *
 * @param {string} url   A valid YouTube URL or video ID
 * @param {object} res   Next.js API response object (so we can pipe data directly)
 */
export async function convertYouTubeToMp3(url, res) {
  // 1) Validate and extract ID
  const videoId = ytdl.getURLVideoID(url);

  // 2) Prepare temp file paths
  const tmpDir   = '/tmp';
  const audioIn  = path.join(tmpDir, `${videoId}.audio`);
  const audioOut = path.join(tmpDir, `${videoId}.mp3`);

  // 3) Download “audio only” stream
  await new Promise((resolve, reject) => {
    ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
      .pipe(fs.createWriteStream(audioIn))
      .on('finish',  resolve)
      .on('error',   reject);
  });

  // 4) Convert to MP3 via FFmpeg
  await new Promise((resolve, reject) => {
    ffmpeg(audioIn)
      .audioCodec('libmp3lame')
      .audioQuality(4)         // ~128kbps VBR
      .on('error', reject)
      .on('end',   resolve)
      .save(audioOut);
  });

  // 5) Stream MP3 back to the client
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${videoId}.mp3"`
  );
  fs.createReadStream(audioOut)
    .pipe(res)
    .on('finish', () => {
      // clean up temp files
      fs.unlink(audioIn,  () => {});
      fs.unlink(audioOut, () => {});
    });
}