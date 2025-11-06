// lib/ollama-json.ts
import { z } from "zod";

const HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:14b-instruct";

async function callOllama(prompt: string) {
  const res = await fetch(HOST.replace(/\/$/, "") + "/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, stream: false, options: { temperature: 0.25 } })
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}`);
  const json = await res.json();
  return String(json.response ?? "");
}

export async function jsonWithSchema<T>(args: { system: string; user: string; schema: z.ZodSchema<T>; retries?: number }) {
  const { system, user, schema } = args;
  let out = await callOllama(`${system}\n\nUSER:\n${user}\n\nReturn ONLY valid JSON.`);
  const tries = Math.max(0, args.retries ?? 1);

  for (let i = 0; i <= tries; i++) {
    try {
      out = out.trim().replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "");
      const parsed = JSON.parse(out);
      return schema.parse(parsed);
    } catch (e: any) {
      if (i === tries) throw e;
      const repair = `The JSON you returned did not validate. Error: ${e?.message}\nFix it and return ONLY the corrected JSON. Previous:\n${out}`;
      out = await callOllama(`${system}\n\n${repair}`);
    }
  }
  throw new Error("unreachable");
}
