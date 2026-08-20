import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, intention } = req.body || {};

  if (!intention || !intention.trim()) {
    return res.status(400).json({ error: 'Intention is required' });
  }

  try {
    const prompt = `Write a short, vivid manifestation story (120-180 words) for someone named ${name || 'this person'} whose intention is: "${intention}". Write entirely in past tense, as though the desire has already fully come true. Make it sensory, specific, and emotionally resonant, not generic. Then, on a new line starting with "AFFIRMATIONS:", list exactly 7 short first-person present-tense affirmations related to this intention, one per line, no numbering.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    return res.status(200).json({ text });
  } catch (err) {
    console.error('Anthropic API error:', err);
    return res.status(500).json({ error: 'Story generation failed' });
  }
}
