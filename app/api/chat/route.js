import { profileContext } from '../../../data/profile';

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const OPENAI_DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const GEMINI_DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

function buildSystemPrompt() {
  return [
    'You are a portfolio assistant for the owner of this website.',
    'Answer only using the profile context provided below.',
    'If details are missing, say you are not sure and suggest contacting directly.',
    'Keep answers concise (2-5 sentences).',
    '',
    `Name: ${profileContext.name}`,
    `Role: ${profileContext.role}`,
    `Summary: ${profileContext.summary}`,
    `Skills: ${profileContext.skills.join(', ')}`,
    `Projects: ${profileContext.projects
      .map((project) => `${project.name} (${project.stack.join(', ')}): ${project.description}`)
      .join(' | ')}`,
    `Contact: Email ${profileContext.contact.email}, LinkedIn ${profileContext.contact.linkedin}, GitHub ${profileContext.contact.github}`,
  ].join('\n');
}

function cleanApiKey(value) {
  if (!value) return '';
  return value.trim().replace(/^['\"]|['\"]$/g, '');
}

function getOpenAIErrorMessage(payload, fallback) {
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (payload?.error?.message) return payload.error.message;
  return fallback;
}

async function callOpenAI({ apiKey, message }) {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_DEFAULT_MODEL,
      input: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: message.trim() },
      ],
      max_output_tokens: 300,
    }),
  });

  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    const statusPrefix = response.status === 401 ? 'Invalid OpenAI API key.' : 'OpenAI request failed.';
    const details = getOpenAIErrorMessage(data, 'No error details were returned.');
    return { status: response.status, error: `${statusPrefix} ${details}` };
  }

  return { reply: data?.output_text?.trim() || '' };
}

async function callGemini({ apiKey, message }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_DEFAULT_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${buildSystemPrompt()}\n\nUser question: ${message.trim()}`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.4,
      },
    }),
  });

  const raw = await response.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    const details = data?.error?.message || (typeof data === 'string' ? data : 'No error details were returned.');
    const statusPrefix = response.status === 401 || response.status === 403 ? 'Invalid Gemini API key.' : 'Gemini request failed.';
    return { status: response.status, error: `${statusPrefix} ${details}` };
  }

  const reply = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('').trim();
  return { reply: reply || '' };
}

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return Response.json({ error: 'Message is required.' }, { status: 400 });
    }

    const geminiApiKey = cleanApiKey(process.env.GEMINI_API_KEY);
    const openAiApiKey = cleanApiKey(process.env.OPENAI_API_KEY);

    if (!geminiApiKey && !openAiApiKey) {
      return Response.json(
        {
          error:
            'Missing API key. Add GEMINI_API_KEY (recommended) or OPENAI_API_KEY to .env.local, then restart `npm run dev`.',
        },
        { status: 500 },
      );
    }

    const result = geminiApiKey
      ? await callGemini({ apiKey: geminiApiKey, message })
      : await callOpenAI({ apiKey: openAiApiKey, message });

    if (result.error) {
      return Response.json({ error: result.error }, { status: result.status || 500 });
    }

    return Response.json({
      reply: result.reply || "I'm sorry, I couldn't generate an answer right now.",
      provider: geminiApiKey ? 'gemini' : 'openai',
    });
  } catch {
    return Response.json(
      {
        error:
          'Unexpected server error while generating assistant response. Check server logs and environment variables.',
      },
      { status: 500 },
    );
  }
}