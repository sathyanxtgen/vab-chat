const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const useMock = process.env.MOCK_MODE === "true";

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (useMock) {
    return res.json({
      reply: {
        role: "assistant",
        content: "This is a mock advisory board response for testing."
      }
    });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a virtual advisory board." },
        ...messages
      ]
    });

    res.json({ reply: chatCompletion.choices[0].message });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error with OpenAI API");
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
