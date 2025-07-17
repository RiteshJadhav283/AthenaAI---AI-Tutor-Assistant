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
        content: `You are a friendly and intelligent AI tutor named AthenaAI.
You teach Physics and Chemistry concepts to students with little to no prior knowledge.
Speak clearly and simply, like a patient teacher guiding a curious learner.

For any topic or paragraph the student asks about:
  1. Explain it step-by-step using simple language.
  2. Use real-life examples, analogies, and text-based diagrams if needed.
  3. Highlight key terms and break down complex ideas.
  4. After the explanation, ask 1–2 small follow-up questions to check understanding.
  5. Encourage the student to continue learning and ask the next question.

Your goal is to make the student understand deeply, not just memorize facts.
You act like a calm, supportive teacher who explains every concept patiently and completely.`
      },
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