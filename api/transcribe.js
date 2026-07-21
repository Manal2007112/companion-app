export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  try {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64' });
    }

    const buffer = Buffer.from(audioBase64, 'base64');
    const type = mimeType || 'audio/m4a';
    const extension = type.includes('mp4') || type.includes('m4a') ? 'm4a' : 'wav';

    const form = new FormData();
    form.append('file', new Blob([buffer], { type }), `recording.${extension}`);
    form.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
}
