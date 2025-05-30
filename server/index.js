import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const advisorPrompts = {
  strategy: "You are a strategic advisor. Provide vision and long-term guidance to startups.",
  marketing: "You are a marketing advisor. Give insights on branding, social media, and promotion.",
  operations: "You are an operations advisor. Help with internal processes and scaling.",
  finance: "You are a finance advisor. Give financial strategy, budgeting, and funding tips."
};

app.post('/api/chat', async (req, res) => {
  const { message, advisor } = req.body;

  if (!message || !advisor) {
    return res.status(400).json({ error: 'Message and advisor type are required.' });
  }

  const systemPrompt = advisorPrompts[advisor.toLowerCase()] || advisorPrompts['strategy'];
  const finalPrompt = `${systemPrompt}\n\nUser: ${message}`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: finalPrompt,
        stream: false
      })
    });

    const data = await response.json();

    return res.json({
      reply: {
        role: advisor,
        content: data.response
      }
    });

  } catch (error) {
    console.error('Ollama request failed:', error);
    return res.status(500).json({ error: 'Failed to get response from Ollama.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
