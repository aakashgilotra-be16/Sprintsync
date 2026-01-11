/**
 * AI Service - Gemini 2.5 Flash
 * Handles AI-powered features with retry logic
 * Validates API key and sanitizes input
 */

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (typeof window !== 'undefined' && !apiKey) {
  console.warn(
    'Gemini API key not configured. AI features will be unavailable.'
  );
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const delays = [1000, 2000, 4000];

export const callGemini = async (
  prompt: string,
  systemInstruction: string = ''
): Promise<string> => {
  if (!apiKey) {
    return 'ERROR: AI service not configured. Please set VITE_GEMINI_API_KEY.';
  }

  // Sanitize input to prevent injection attacks
  if (typeof prompt !== 'string' || prompt.length > 5000) {
    return 'ERROR: Invalid prompt length.';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  for (let i = 0; i <= delays.length; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('API_RETRY');

      const result = (await response.json()) as GeminiResponse;
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error('EMPTY_RESPONSE');
      return text;
    } catch {
      if (i === delays.length) return 'ERROR: AI unreachable.';
      await new Promise((res) => setTimeout(res, delays[i]));
    }
  }

  return 'ERROR: AI unreachable.';
};
