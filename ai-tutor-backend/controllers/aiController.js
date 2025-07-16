const axios = require('axios');
require('dotenv').config();

const handleDoubt = async (req, res) => {
  const { question } = req.body;

  // Debug: Log environment variables (remove in production)
  console.log('LLAMA_API_KEY:', process.env.LLAMA_API_KEY);
  console.log('SITE_URL:', process.env.SITE_URL);
  console.log('SITE_NAME:', process.env.SITE_NAME);

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    // Build headers dynamically
    const headers = {
      Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
      'Content-Type': 'application/json',
    };
    if (process.env.SITE_URL) headers['HTTP-Referer'] = process.env.SITE_URL;
    if (process.env.SITE_NAME) headers['X-Title'] = process.env.SITE_NAME;

    // Debug: Log headers (remove in production)
    console.log('Request headers:', headers);

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'system',
            content: "You're a friendly tutor. You explain concepts in detail because the student has little to no prior knowledge. You guide the student step-by-step through each topic, referencing page and paragraph numbers when applicable. Ask them to read specific sections before explaining with examples, analogies, and diagrams where needed."
          } ,
          {
            role: 'user',
            content: question,
          },
        ],
      },
      {
        headers,
      }
    );

    const answer = response.data.choices[0].message.content;
    res.status(200).json({ answer });
  } catch (err) {
    console.error('❌ Axios OpenRouter error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ error: err.response?.data || 'Unknown error' });
  }
};

module.exports = { handleDoubt };