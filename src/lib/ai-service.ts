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

    // Extract JSON if wrapped in markdown
    const jsonString = text.substring(
      text.indexOf("{"),
      text.lastIndexOf("}") + 1
    );

    if (!jsonString) {
      throw new Error("No JSON found in response");
    }

    const json = JSON.parse(jsonString);

    // Validate and Normalize
    const normalizedData = normalizeResponse(json);

    return {
      data: normalizedData,
      thinking: {
        enhancedPrompt
      }
    };

  } catch (error) {
    console.error("AI Generation failed:", error);
    throw new Error("Failed to generate UI. Please try again.");
  }
}
