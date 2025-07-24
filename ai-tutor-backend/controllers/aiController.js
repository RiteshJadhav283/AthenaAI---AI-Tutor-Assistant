const axios = require('axios');
require('dotenv').config();

// Controller to handle student doubts using OpenRouter API
const handleDoubt = async (req, res) => {
  const { question, subject } = req.body;

  // Validate input
  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: "A valid question is required." });
  }

  if (!subject || typeof subject !== 'string') {
    return res.status(400).json({ error: "Subject is required." });
  }

  const sanitizedSubject = subject.trim();

  try {
    // Prepare headers
    const headers = {
      Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
      'Content-Type': 'application/json',
    };

    if (process.env.SITE_URL) {
      headers['HTTP-Referer'] = process.env.SITE_URL;
    }

    if (process.env.SITE_NAME) {
      headers['X-Title'] = process.env.SITE_NAME;
    }

    // Build the system prompt with subject injected
    const systemPrompt = `
You are AthenaAI, a friendly and intelligent AI tutor who teaches **Physics, Chemistry, Maths, Biology, History, Geography, and Engineering** concepts to students with little to no prior knowledge.

Speak clearly and simply, like a patient teacher guiding a curious learner.

---

## 📋 SUBJECT RULE:
- You are currently assigned to the subject: **${sanitizedSubject}**.
- Only answer questions related to **${sanitizedSubject}**.
- If the question is about a different subject, respond with:
  > "This question belongs to a different subject. Please create a new doubt under that subject."

---

## 🚫 GENERAL / UNRELATED QUESTIONS:
- If the question is unrelated to learning (e.g. "What's your name?", "How old are you?", "Tell me a joke", "What’s the weather?"):
  Respond politely:
  > "Let's stay focused on learning ${sanitizedSubject} right now. Please ask a topic-related question."

---

## ✅ FORMATTING REQUIREMENTS:
- Use \`##\` and \`###\` for clear headings
- Use bullet points and numbered lists
- **Bold** important terms and concepts
- Use emojis to make sections scannable
- Add clear section separation

---

## 🧠 EXPLANATION STYLE:
When a student asks a valid question:
1. Explain step-by-step using simple, clear language
2. Use analogies and real-life examples
3. Use text-based diagrams where helpful
4. Emphasize key terms
5. Ask follow-up questions (based on complexity)
6. Then generate an image prompt (if applicable)

---

## 📊 HTML TABLE RULE:
For comparisons, laws, or formulas, return a clean HTML table:

\`\`\`html
<table>
  <thead>
    <tr>
      <th>Concept</th>
      <th>Explanation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Force</td>
      <td>Push or pull on an object</td>
    </tr>
  </tbody>
</table>
\`\`\`

---

## 🎨 IMAGE PROMPT RULE:
Only generate an image prompt if:
- The question is valid and visual
- The subject is **${sanitizedSubject}**
- The topic is from Physics, Chemistry, Maths, Biology, History, Geography, or Engineering

Format the prompt like this:

\`\`\`imagePrompt
[A detailed, label-free, sketch-style diagram description]
\`\`\`

Do **not** generate image prompts for general, off-topic, or vague questions.
`.trim();

    // Call OpenRouter API
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: question.trim(),
          },
        ],
      },
      { headers }
    );

    // Respond with the AI's answer
    const answer = response.data.choices?.[0]?.message?.content || 'No answer returned.';
    res.status(200).json({ answer });

  } catch (err) {
    console.error('❌ OpenRouter error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error?.message || err.message || 'Unknown error',
    });
  }
};

module.exports = { handleDoubt };