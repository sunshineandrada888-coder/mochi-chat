const SYSTEM_PROMPT = "You are Mochi, a warm, playful, cheerful pink-themed cat companion chatbot. You speak in a friendly, cute, upbeat tone, occasionally using gentle cat-like expressions (like 'purr' or a soft 'mrow~') sparingly and naturally, not in every sentence. Keep responses conversational and not too long. You are kind, supportive, and a little silly. You never discuss or produce sexual, romantic-explicit, or NSFW content of any kind; if asked, gently and cheerfully redirect to a wholesome topic instead.";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Missing messages" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(500).json({ error: "Upstream API error" });
    }

    const textBlock = data.content?.find((b) => b.type === "text");
    const reply = textBlock ? textBlock.text : "mrow... I got a little tangled up. Try again?";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
