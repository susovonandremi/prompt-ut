'use server';

import { Groq } from "groq-sdk";
import { normalizeResponse } from "./ui-schema";
import { SYSTEM_PROMPT } from "./gemini-prompt";

export type WrappedGenerationResult =
  | { success: true; data: any; thinking: { enhancedPrompt: string } }
  | { success: false; error: string };

export async function generateUI(prompt: string, style: string, imageBase64?: string): Promise<WrappedGenerationResult> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return { success: false, error: "GROQ_API_KEY missing" };

    const groq = new Groq({ apiKey });
    let modelName = "llama-3.3-70b-versatile";
    if (imageBase64) modelName = "llama-3.2-90b-vision-preview";

    const systemInstruction = `${SYSTEM_PROMPT}\n\nIMPORTANT: Return ONLY valid JSON.`;
    const userContent = `Style: ${style}\nRequest: ${prompt}`;

    const messages: any[] = [
      { role: "system", content: systemInstruction },
      { role: "user", content: userContent }
    ];

    if (imageBase64) {
      const base64Data = imageBase64.split(',')[1] || imageBase64;
      messages[1] = {
        role: "user",
        content: [
          { type: "text", text: userContent },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
        ]
      };
    }

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: modelName,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("No content received");

    const json = JSON.parse(content);
    const normalizedData = normalizeResponse(json);

    return {
      success: true,
      data: normalizedData,
      thinking: { enhancedPrompt: `Used model: ${modelName}` }
    };

  } catch (error: any) {
    console.error("AI Service Error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
