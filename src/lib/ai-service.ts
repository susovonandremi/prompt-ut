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
  // Initialize specific for this request to handle env vars safely
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY is not set in environment variables (server-side)" };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
  });

  try {
    // 1. Enhance Prompt (SKIPPED to prevent Vercel 10s Timeout)
    const enhancedPrompt = prompt;
    /* 
    const enhancerParts = [
      { text: PROMPT_ENHANCER_SYSTEM_PROMPT },
      { text: `User Request: ${prompt}` }
    ];

    const enhancerResult = await model.generateContent(enhancerParts);
    const enhancedPrompt = enhancerResult.response.text();
    */

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
      return { success: false, error: "No JSON found in AI response" };
    }

    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return { success: false, error: "Generated content was not valid JSON" };
    }

    // Validate and Normalize
    const normalizedData = normalizeResponse(json);

    return {
      success: true,
      data: normalizedData,
      thinking: {
        enhancedPrompt
      }
    };

  } catch (error: any) {
    console.error("AI Generation failed:", error);
    // Return explicit error message to client
    const msg = error.message || "Unknown error";
    if (msg.includes("API_KEY") || msg.includes("quota") || msg.includes("401") || msg.includes("403")) {
      return { success: false, error: `Authentication Error: ${msg}` };
    }
    return { success: false, error: `Generation Failed: ${msg}` };
  }
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
