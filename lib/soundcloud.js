// lib/soundcloud.js
import scdl from 'soundcloud-downloader';

const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

/**
 * Resolves a SoundCloud track URL and streams it as MP3 to `res`.
 *
 * @param {string} url   A public SoundCloud track URL
 * @param {object} res   Next.js API response object
 */
export async function downloadSoundCloudTrack(url, res) {
  // 1) Fetch metadata (to get a good filename)
  const info = await scdl.getInfo(url, CLIENT_ID);
  const title = info.title.replace(/[\/\\?%*:|"<>]/g, '_'); // sanitize

  // 2) Get the audio stream
  const stream = await scdl.download(url, CLIENT_ID);

  // 3) Pipe directly to the HTTP response
  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(title)}.mp3"`
  );
  stream.pipe(res);
}