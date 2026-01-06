// lib/ai-service.ts
'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { normalizeResponse } from "./ui-schema";
import { SYSTEM_PROMPT, PROMPT_ENHANCER_SYSTEM_PROMPT, buildUserPrompt } from "./gemini-prompt";



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
  // Initialize specific for this request
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not set in environment variables (server-side)" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Strategy: Try preferred model, then fallback to stable models if 404
  const modelsToTry = [
    process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ];

  // Remove duplicates
  const uniqueModels = [...new Set(modelsToTry)];

  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      console.log(`Attempting generation with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      // 1. Enhance Prompt (SKIPPED to prevent Vercel 10s Timeout)
      const enhancedPrompt = prompt;

      // 2. Generate UI
      const systemInstruction = `${SYSTEM_PROMPT}\n\nIMPORTANT: The user may provide an image. Analyze it and replicate its layout, content, and style using the DSL.`;

      const parts: any[] = [
        { text: systemInstruction },
        { text: `Style Preference: ${style}` },
        { text: `Enhanced Prompt: ${enhancedPrompt}` }
      ];

      if (imageBase64) {
        const base64Data = imageBase64.split(',')[1] || imageBase64;
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/png"
          }
        });
        parts.push({ text: "Replicate this image design as closely as possible using the DSL." });
      }

      const result = await model.generateContent(parts);
      const text = result.response.text();

      // Extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : null;

      if (!jsonString) {
        throw new Error("No JSON found in response");
      }

      let json;
      try {
        json = JSON.parse(jsonString);
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
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;

      // If it's NOT a 404/Not Found, it might be a real error (like quota), so maybe don't retry?
      // But for robustness, we'll traverse the list unless it's an Auth error.
      const msg = error.message || "";
      if (msg.includes("API_KEY") || msg.includes("401")) {
        return { success: false, error: `Authentication Error: ${msg}` };
      }

      // If 404 or other generic error, continue to next model
      continue;
    }
  }

  // If we get here, all models failed
  const msg = lastError?.message || "Unknown error";
  return { success: false, error: `All models failed. Last error: ${msg}` };
}

export async function checkConnection(): Promise<{ success: true; message: string } | { success: false; error: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is missing (server-side check)" };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use cheapest/fastest model for check
    const result = await model.generateContent("Test connection");
    const response = await result.response;
    return { success: true, message: "Connected: " + response.text().substring(0, 20) };
  } catch (error: any) {
    console.error("Connection Check Failed:", error);
    return { success: false, error: error.message || "Connection failed" };
  }
}
