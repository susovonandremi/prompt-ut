// lib/ai-service.ts
'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { normalizeResponse } from "./ui-schema";
import { SYSTEM_PROMPT, PROMPT_ENHANCER_SYSTEM_PROMPT, buildUserPrompt } from "./gemini-prompt";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
});

export interface GenerationResult {
  data: any;
  thinking: {
    enhancedPrompt: string;
  };
}

export async function generateUI(prompt: string, style: string, imageBase64?: string): Promise<GenerationResult> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  try {
    // 1. Enhance Prompt
    const enhancerParts = [
      { text: PROMPT_ENHANCER_SYSTEM_PROMPT },
      { text: `User Request: ${prompt}` }
    ];

    const enhancerResult = await model.generateContent(enhancerParts);
    const enhancedPrompt = enhancerResult.response.text();

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

    // Extract JSON if wrapped in markdown or has extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : null;

    if (!jsonString) {
      throw new Error("No JSON found in response");
    }

    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (e) {
      // Try to fix common JSON errors if needed, or just fail
      console.error("JSON Parse Error:", e);
      throw new Error("Generated content was not valid JSON");
    }

    // Validate and Normalize
    const normalizedData = normalizeResponse(json);

    return {
      data: normalizedData,
      thinking: {
        enhancedPrompt
      }
    };

  } catch (error: any) {
    console.error("AI Generation failed:", error);
    // Rethrow specific errors (like missing API key) directly
    if (error.message && (error.message.includes("API_KEY") || error.message.includes("quota"))) {
      throw error;
    }
    // For other errors, include the original message for debugging
    throw new Error(`Failed to generate UI: ${error.message || "Unknown error"}`);
  }
}
