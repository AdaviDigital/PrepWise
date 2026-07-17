const OpenAI = require("openai");
const env = require("../config/env");

const client = env.openai.apiKey ? new OpenAI({ apiKey: env.openai.apiKey }) : null;

const SYSTEM_PROMPT = `You are the PrepWise AI Study Assistant, a patient, encouraging tutor for
Nigerian students preparing for Common Entrance, BECE, WAEC, NECO, NABTEB, JAMB UTME,
Post-UTME and tertiary-level coursework. Always:
- Explain concepts step by step, the way a great Nigerian classroom teacher would.
- Reference the relevant Nigerian curriculum/exam body when useful (e.g. "This is a
  favourite WAEC Mathematics topic").
- Keep answers focused and exam-relevant; use worked examples for Mathematics/Science.
- If a student seems to be guessing or discouraged, add a short, genuine line of
  encouragement — never patronising.
- Never do a student's assignment word-for-word without explanation; teach first.`;

/**
 * Sends a chat completion request for the AI Study Assistant / Homework Helper.
 * `history` is an array of { role: 'user'|'assistant', content } from AiChatMessage.
 */
async function chatCompletion({ history, userMessage, subjectHint }) {
  if (!client) {
    // Local/dev fallback so the API is runnable without a paid key.
    return {
      content: `(Demo mode — no OPENAI_API_KEY configured) Here's how I'd approach "${userMessage}": break it into what's given, what's being asked, then apply the relevant formula or rule step by step. Add your real OpenAI key in .env to get live AI answers.`,
      tokensUsed: 0,
    };
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT + (subjectHint ? `\nCurrent subject focus: ${subjectHint}.` : "") },
    ...history.map((m) => ({ role: m.role.toLowerCase(), content: m.content })),
    { role: "user", content: userMessage },
  ];

  const completion = await client.chat.completions.create({
    model: env.openai.chatModel,
    messages,
    temperature: 0.4,
    max_tokens: 900,
  });

  return {
    content: completion.choices[0].message.content,
    tokensUsed: completion.usage?.total_tokens || 0,
  };
}

/** Generates an embedding vector for RAG (used with pgvector on Neon). */
async function embedText(text) {
  if (!client) return null;
  const res = await client.embeddings.create({
    model: env.openai.embeddingModel,
    input: text,
  });
  return res.data[0].embedding;
}

/** Generates an AI explanation for a single question bank item. */
async function explainQuestion({ prompt, options, correctKey }) {
  if (!client) {
    return `(Demo mode) The correct answer is ${correctKey}. Configure OPENAI_API_KEY for a full AI-generated explanation.`;
  }
  const optionsText = options.map((o) => `${o.key}) ${o.text}`).join("\n");
  const completion = await client.chat.completions.create({
    model: env.openai.chatModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Explain why option ${correctKey} is correct for this question, and briefly why the others are wrong.\n\nQuestion: ${prompt}\n${optionsText}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 400,
  });
  return completion.choices[0].message.content;
}

module.exports = { chatCompletion, embedText, explainQuestion };
