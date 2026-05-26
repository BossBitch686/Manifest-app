const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/generate", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model"claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: req.body.prompt }],
      }),
    });
    const data = await response.json();
if (!response.ok) {
  return res.status(500).json({ error: data.error?.message || JSON.stringify(data) });
}
res.json(data);
  
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});
app.post("/speak", async (req, res) => {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/t8NcHYEGAYn7YYhEYKed`, {
      method: "POST",
      headers: {"Content-Type": "application/json", "xi-api-key": process.env.ELEVENLABS_API_KEY},
      body: JSON.stringify({text: req.body.text, model_id: "eleven_monolingual_v1", voice_settings: {stability: 0.5, similarity_boost: 0.75}})
    });
    const buf = await response.arrayBuffer();
    res.set("Content-Type", "audio/mpeg");
    res.send(Buffer.from(buf));
  } catch(err) { res.status(500).json({error: err.message}); }
});
app.listen(process.env.PORT || 3000);
