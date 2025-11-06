import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { normalizeResponse, selectBestVariant } from "./../../../../lib/ui-schema";
import { generateBestVariant } from "./../../../../lib/local.archetypes";

type GenModel = "gemini-2.5-flash" | "gemini-2.5-flash-lite" | "gemini-2.5-pro";

const FALLBACK_MODELS: GenModel[] = [
  (process.env.GEMINI_MODEL as GenModel) || "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
];

// simple dev cache to avoid re-hitting API during a session
const memoryCache = new Map<string, any>();

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

function isTransient(msg: string) {
  return /429|quota|rate|503|overload|unavailable|timeout/i.test(msg);
}

function stripFences(s: string) {
  let t = (s || "").trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  }
  return t;
}

async function callGeminiOnce(
  apiKey: string,
  modelName: GenModel,
  prompt: string,
  style: string
) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
      topP: 0.9,
      topK: 32,
    },
  });

  const system = `
Return ONLY JSON. Keys: "version","variants".
Use nodes: container, card, text, button, input, image.
Each node must be { "type": "...", "props": {...}, "children": [...] }.
For text: props.value; button: props.label; image: props.src, props.alt.
Output format:
{ "version":"1", "variants":[ <ONE good root layout> ] }
The layout must be clean, cohesive, production-ready.
Style: ${style}.
`;

  const user = `Prompt: ${prompt}`;

  const res = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: system }] },
      { role: "user", parts: [{ text: user }] },
    ],
  });

  const raw = stripFences(res.response.text() ?? "");
  const json = JSON.parse(raw);
  return json;
}

async function generateWithRetry(
  apiKey: string,
  prompt: string,
  style: string
) {
  // cache key by prompt+style
  const key = `${prompt}||${style}`;
  if (memoryCache.has(key)) return memoryCache.get(key);

  let lastErr: any;
  for (const model of FALLBACK_MODELS) {
    // exponential backoff tries for this model
    const tries = [300, 800, 1500, 3000]; // ms
    for (let i = 0; i < tries.length; i++) {
      try {
        const raw = await callGeminiOnce(apiKey, model, prompt, style);
        memoryCache.set(key, raw);
        return raw;
      } catch (e: any) {
        lastErr = e;
        const msg = String(e?.message || e);
        const transient = isTransient(msg);
        if (!transient) {
          // non-transient; break to next model
          break;
        }
        await sleep(tries[i]);
      }
    }
  }
  throw lastErr;
}

export async function POST(req: Request) {
  try {
    const { prompt, style = "apple-min" } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // still return local best so the demo never blocks
      const local = generateBestVariant(prompt, style);
      return NextResponse.json({ version: "1", variants: [local], note: "Missing GEMINI_API_KEY; using local generator" }, { status: 200 });
    }

    // try API with retries + model fallback
    let raw: any;
    try {
      raw = await generateWithRetry(apiKey, prompt, style);
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (isTransient(msg)) {
        // API overloaded or quota → graceful local fallback
        const local = generateBestVariant(prompt, style);
        return NextResponse.json(
          { version: "1", variants: [local], note: "Gemini overloaded; using local generator" },
          { status: 200 }
        );
      }
      // non-transient error
      throw e;
    }

    // normalize and pick best variant (we only want 1)
    const normalized = normalizeResponse(raw);
    const best = selectBestVariant(normalized.variants, prompt) ?? normalized.variants[0];
    return NextResponse.json({ version: "1", variants: [best] }, { status: 200 });
  } catch (error: any) {
    // final emergency fallback
    const prompt = "Untitled UI";
    const local = generateBestVariant(prompt, "apple-min");
    return NextResponse.json(
      { version: "1", variants: [local], note: error?.message || "Generation failed; local fallback used." },
      { status: 200 }
    );
  }
}
