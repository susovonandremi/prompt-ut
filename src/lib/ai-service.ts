'use server';

import { normalizeResponse } from './ui-schema';
import { SYSTEM_PROMPT, FEW_SHOT_EXAMPLES, buildUserPrompt } from './gemini-prompt';

export type WrappedGenerationResult =
  | { success: true; data: any; thinking: { analysis: string; plan: string; design: string; enhancedPrompt: string } }
  | { success: false; error: string };

/**
 * Core AI generation function.
 * Supports both Groq and Grok (xAI) via OpenAI-compatible API.
 */
export async function generateUI(
  prompt: string,
  style: string = 'modern',
  imageBase64?: string,
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[]
): Promise<WrappedGenerationResult> {
  try {
    // Determine provider from environment
    const provider = process.env.AI_PROVIDER || 'groq';
    let apiKey: string | undefined;
    let baseURL: string;
    let model: string;

    if (provider === 'xai' || provider === 'grok') {
      apiKey = process.env.XAI_API_KEY;
      baseURL = 'https://api.x.ai/v1';
      model = process.env.AI_MODEL || 'grok-3-mini';
    } else {
      // Default: Groq
      apiKey = process.env.GROQ_API_KEY;
      baseURL = 'https://api.groq.com/openai/v1';
      model = process.env.AI_MODEL || 'llama-3.3-70b-versatile';
    }

    if (!apiKey) {
      return { success: false, error: `API key missing for provider: ${provider}. Set ${provider === 'xai' ? 'XAI_API_KEY' : 'GROQ_API_KEY'} in .env` };
    }

    // Build messages array with few-shot examples
    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add few-shot examples for better output quality
    for (const example of FEW_SHOT_EXAMPLES.slice(0, 2)) {
      messages.push({ role: 'user', content: `Create: ${example.user}` });
      messages.push({ role: 'assistant', content: JSON.stringify(example.output) });
    }

    // Add conversation history for iterative refinement
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push(msg);
      }
    }

    // Build the user prompt
    const userPrompt = buildUserPrompt(prompt);

    if (imageBase64) {
      const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Data}` } },
        ],
      });

      // Switch to vision model if available
      if (provider === 'groq') {
        model = 'llama-3.2-90b-vision-preview';
      }
    } else {
      messages.push({ role: 'user', content: userPrompt });
    }

    // Call the API using fetch (OpenAI-compatible endpoint)
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 8192,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    // Parse and normalize
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from potential markdown wrapping
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    const normalizedData = normalizeResponse(parsed);

    // Extract thinking from AI response if available
    const thinking = {
      analysis: parsed?.thinking?.analysis || 'Analyzed the design request',
      plan: parsed?.thinking?.plan || 'Structured the layout',
      design: parsed?.thinking?.design || 'Applied design system',
      enhancedPrompt: `Model: ${model} | Provider: ${provider}`,
    };

    return {
      success: true,
      data: normalizedData,
      thinking,
    };

  } catch (error: any) {
    console.error('AI Service Error:', error);
    return {
      success: false,
      error: error.message || 'Unknown generation error',
    };
  }
}
