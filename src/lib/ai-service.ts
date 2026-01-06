'use server';

import { Groq } from "groq-sdk";
import { normalizeResponse } from "./ui-schema";
import { SYSTEM_PROMPT } from "./gemini-prompt"; // Re-using prompt, it's generic enough

export interface GenerationResult {
  data: any;
  thinking: {
    enhancedPrompt: string;
  };
}

export type WrappedGenerationResult =
  | { success: true; data: any; thinking: { enhancedPrompt: string } }
  | { success: false; error: string };

export async function generateUI(prompt: string, style: string, imageBase64?: string): Promise<WrappedGenerationResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GROQ_API_KEY is not set in environment variables" };
  }

  const groq = new Groq({ apiKey });

  // Select Model
  // If image -> Use Vision model
  // If text -> Use most powerful text model
  let modelName = "llama-3.3-70b-versatile";
  if (imageBase64) {
    modelName = "llama-3.2-90b-vision-preview";
  }

  try {
    console.log(`Attempting generation with Groq model: ${modelName}`);

    const systemInstruction = `${SYSTEM_PROMPT}\n\nIMPORTANT: Return ONLY valid JSON. Do not include markdown formatting like \`\`\`json.`;
    const userContent = `Style Preference: ${style}\n\nUser Request: ${prompt}`;

    const messages: any[] = [
      { role: "system", content: systemInstruction },
      { role: "user", content: userContent }
    ];

    if (imageBase64) {
      // Groq Vision Format
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      messages[1] = {
        role: "user",
        content: [
          { type: "text", text: userContent + "\n\nReplicate the attached image design." },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`
            }
          }
        ]
      };
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: modelName,
      temperature: 0.1,
      max_tokens: 8000,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" } // Force JSON
    });

    const content = chatCompletion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from Groq");
    }

    let json;
    try {
      json = JSON.parse(content);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      throw new Error("Invalid JSON generated");
    }

    // Validate and Normalize
    const normalizedData = normalizeResponse(json);

    return {
      success: true,
      data: normalizedData,
      thinking: {
        enhancedPrompt: `Used model: ${modelName}`
      }
    };

  } catch (error: any) {
    console.warn(`Groq Generation failed:`, error.message);
    const msg = error.message || "Unknown error";
    return { success: false, error: `Groq Error: ${msg}` };
  }
}

// Kept for backward compatibility imports, but updated logic
export async function checkConnection(): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { success: false, error: "Missing GROQ_API_KEY" };

    const groq = new Groq({ apiKey });
    await groq.chat.completions.create({
      messages: [{ role: "user", content: "Test" }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 5
    });
    return { success: true, message: "Connected to Llama 3 via Groq" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
