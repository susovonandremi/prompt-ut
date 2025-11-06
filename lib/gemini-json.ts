// lib/gemini-json.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY || "";
const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

export async function geminiJson(system: string, user: string) {
  if (!API_KEY) {
    throw new Error("NO_API_KEY");
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      topP: 0.95,
    },
  });

  // Single prompt is fine here
  const result = await model.generateContent([{ text: `${system}\n\n${user}` }]);
  const text = result.response.text();
  return text;
}
