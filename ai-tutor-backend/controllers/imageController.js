// controllers/imageController.js
const fetch = require('node-fetch');
const FormData = require('form-data');

const generateImageFromPrompt = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const form = new FormData();
    form.append('prompt', prompt.trim());

    const response = await fetch('https://clipdrop-api.co/text-to-image/v1', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
        ...form.getHeaders()
      },
      body: form
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Image generation failed',
        details: errorText
      });
    }

    const imageBuffer = await response.buffer();
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    return res.status(200).json({ imageUrl });

  } catch (err) {
    console.error('Image generation failed:', err.message);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};

module.exports = { generateImageFromPrompt };