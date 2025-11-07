// app/api/generate/variants/route.ts

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { normalizeResponse, selectBestVariant } from "../../../../lib/ui-schema";
import { generateBestVariant } from "../../../../lib/local.archetypes";

const GENERATION_DISABLED = true; // TURN ON to block generation

export async function POST(req: Request) {
  // ✅ If we disabled generation, stop here
  if (GENERATION_DISABLED) {
    return NextResponse.json(
      { error: "Generation temporarily disabled. Please try again later." },
      { status: 503 }
    );
  }

  // ✅ Otherwise continue with your original logic
  try {
    const { prompt, style = "apple-min" } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Local fallback
      return NextResponse.json({
        version: "1",
        variants: [generateBestVariant(prompt, style)]
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const raw = result.response.text() || "";
    const data = normalizeResponse(JSON.parse(raw));
    const best = selectBestVariant(data.variants, prompt);

    return NextResponse.json({ version: "1", variants: [best] });

  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
