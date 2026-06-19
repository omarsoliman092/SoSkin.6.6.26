import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI not configured' });
  }

  try {
    const { image, prompt } = req.body;
    const imageUrl = image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error: `AI Error: ${error}` });
    }

    const data = await response.json();
    return res.status(200).json({ text: data.choices[0].message.content });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
