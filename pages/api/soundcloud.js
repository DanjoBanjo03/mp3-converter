import { downloadSoundCloudTrack } from '../../lib/soundcloud';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    await downloadSoundCloudTrack(req.body.url, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}