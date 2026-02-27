import { AiResponse, ChatMessage } from './types';

const SYSTEM_PROMPT = `You are a helpful fashion shopping assistant. Help users find clothing they'll love.
When responding:
1. Be friendly and conversational (2-3 sentences max).
2. At the END of every response, append a JSON block (no markdown) like:
{"filters": ["keyword1", "keyword2"]}
The filters should be lowercase style/color/fit keywords extracted from the conversation.
Example filters: wide leg, straight leg, relaxed fit, baggy, maroon, burgundy, blue, black, cargo, denim, high rise, flared
Only include filters relevant to what the user wants.`;

function mockResponse(userMessage: string): AiResponse {
  const lower = userMessage.toLowerCase();
  if (lower.includes('baggy') || lower.includes('wide') || lower.includes('loose'))
    return { displayText: "Love that vibe! I found some great wide-leg and baggy options for you.", suggestedFilters: ['wide leg', 'baggy', 'relaxed fit'] };
  if (lower.includes('maroon') || lower.includes('burgundy') || lower.includes('red'))
    return { displayText: "Rich tones — great choice! Here are the maroon and burgundy pieces I think you'll love.", suggestedFilters: ['maroon', 'burgundy'] };
  if (lower.includes('straight') || lower.includes('classic'))
    return { displayText: "Classic and clean — here are the straight-leg styles that fit the brief.", suggestedFilters: ['straight leg', 'classic'] };
  if (lower.includes('cargo'))
    return { displayText: "Cargo is so on-trend right now. Check out these picks!", suggestedFilters: ['cargo', 'wide leg'] };
  if (lower.includes('relaxed') || lower.includes('casual'))
    return { displayText: "Effortless and relaxed — here's what I found for you.", suggestedFilters: ['relaxed fit', 'casual'] };
  return { displayText: "Here are some great options based on what you're looking for!", suggestedFilters: [] };
}

export async function sendMessage(history: ChatMessage[], userMessage: string): Promise<AiResponse> {
  // If API key is set, use Claude; otherwise mock
  const apiKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY;
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    await new Promise(r => setTimeout(r, 900));
    return mockResponse(userMessage);
  }

  const messages = [
    ...history.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
    { role: 'user', content: userMessage },
  ];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: 'claude-opus-4-6', max_tokens: 512, system: SYSTEM_PROMPT, messages }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  const rawText: string = json.content[0].text;

  const jsonMatch = rawText.match(/\{[\s\S]*"filters"[\s\S]*\}/);
  let filters: string[] = [];
  let displayText = rawText.trim();
  if (jsonMatch) {
    displayText = rawText.substring(0, jsonMatch.index).trim();
    try { filters = JSON.parse(jsonMatch[0]).filters ?? []; } catch { /* ignore */ }
  }
  return { displayText, suggestedFilters: filters };
}
