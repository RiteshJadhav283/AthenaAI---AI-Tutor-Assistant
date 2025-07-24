document.getElementById('askBtn').addEventListener('click', async () => {
  const question = document.getElementById('questionInput').value.trim();
  const responseBox = document.getElementById('responseBox');
  responseBox.innerHTML = "Thinking...";

  if (!question) {
    responseBox.innerHTML = "❗ Please enter a question.";
    return;
  }

  try {
    const res = await fetch('/api/ai/doubt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question })
    });

    const data = await res.json();

    if (res.ok) {
      responseBox.innerHTML = `<p><strong>AthenaAI:</strong> ${data.answer}</p>`;
    } else {
      responseBox.innerHTML = `❌ Error: ${data.error}`;
    }
  } catch (err) {
    responseBox.innerHTML = `❌ Network error: ${err.message}`;
  }
});