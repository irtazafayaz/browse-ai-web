import { AiResponse, ChatMessage } from './types';
import { searchProducts } from './api';

// ── Fallback mock (used when backend is unreachable) ───────────────────
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

export async function sendMessage(_history: ChatMessage[], userMessage: string): Promise<AiResponse> {
  // Try Django backend first; fall back to mock if unreachable
  try {
    const data = await searchProducts(userMessage, 1);
    return {
      displayText: data.displayText,
      suggestedFilters: data.suggestedFilters ?? [],
    };
  } catch {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    console.warn(`[Browse AI] Backend at ${apiUrl} unreachable, using mock response.`);
    await new Promise(r => setTimeout(r, 800));
    return mockResponse(userMessage);
  }
}
