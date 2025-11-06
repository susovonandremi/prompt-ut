// app/api/generate/variants/route.ts (Enhanced)
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { normalizeResponse, selectBestVariant } from "../../../../lib/ui-schema";
import { SYSTEM_PROMPT, FEW_SHOT_EXAMPLES, buildUserPrompt } from "../../../../lib/gemini-prompt";


/**
 * Initialize Gemini model with optimal settings
 */
function getModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    },
  });
}

/**
 * Generate UI variants with enhanced prompting
 */
async function generateVariants(
  model: any,
  prompt: string,
  style: string
): Promise<any> {
  const userPrompt = buildUserPrompt(prompt, style);

  // Build conversation with few-shot examples
  const contents = [
    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    
    // Add few-shot examples
    { 
      role: "user", 
      parts: [{ text: `Example 1: ${FEW_SHOT_EXAMPLES[0].title}` }] 
    },
    { 
      role: "model", 
      parts: [{ text: JSON.stringify(FEW_SHOT_EXAMPLES[0].output) }] 
    },
    { 
      role: "user", 
      parts: [{ text: `Example 2: ${FEW_SHOT_EXAMPLES[1].title}` }] 
    },
    { 
      role: "model", 
      parts: [{ text: JSON.stringify(FEW_SHOT_EXAMPLES[1].output) }] 
    },
    
    // Actual request
    { role: "user", parts: [{ text: userPrompt }] },
  ];

  const result = await model.generateContent({ contents });
  let text = result.response.text().trim();

  // Clean markdown fences if present
  if (text.startsWith("```")) {
    text = text
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();
  }

  return JSON.parse(text);
}

/**
 * POST /api/generate/variants
 * Generate high-quality UI from text prompt
 */
export async function POST(req: Request) {
  try {
    const { prompt, style = "apple-min" } = await req.json();

    // Validate input
    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const model = getModel(apiKey);

    // Generate 3 variants
    console.log("[Generation] Starting for prompt:", prompt);
    const rawResponse = await generateVariants(model, prompt, style);

    // Normalize and clean the response
    console.log("[Generation] Normalizing response...");
    const normalized = normalizeResponse(rawResponse);

    if (normalized.variants.length === 0) {
      return NextResponse.json(
        { error: "No valid variants generated" },
        { status: 500 }
      );
    }

    // Select the best variant using intelligent ranking
    console.log("[Generation] Ranking variants...");
    const bestVariant = selectBestVariant(normalized.variants, prompt);

    if (!bestVariant) {
      return NextResponse.json(
        { error: "Failed to select best variant" },
        { status: 500 }
      );
    }

    // Return single best variant
    return NextResponse.json({
      version: "1",
      variants: [bestVariant],
    });
  } catch (error: any) {
    console.error("[Generation Error]", error);
    
    // Provide helpful error messages
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your GEMINI_API_KEY." },
        { status: 401 }
      );
    }

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Generation failed" },
      { status: 500 }
    );
  }
}
