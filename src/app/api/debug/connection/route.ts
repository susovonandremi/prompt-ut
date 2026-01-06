import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("Debug: Starting Groq Connection Check...");

    const apiKey = process.env.GROQ_API_KEY;
    console.log("Debug: API Key present?", !!apiKey);

    if (!apiKey) {
        return NextResponse.json({ success: false, error: "GROQ_API_KEY is missing in env" }, { status: 500 });
    }

    try {
        const groq = new Groq({ apiKey });

        // Test Models
        const models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192"];

        let lastError;
        for (const model of models) {
            try {
                console.log(`Debug: Testing ${model}...`);
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: "Test" }],
                    model: model,
                    max_tokens: 10
                });
                const text = completion.choices[0]?.message?.content || "No content";
                console.log(`Debug: Success with ${model}`);
                return NextResponse.json({ success: true, message: `Connected to Groq (${model}): ${text}` });
            } catch (e: any) {
                console.warn(`Debug: Failed ${model}:`, e.message);
                lastError = e;
            }
        }

        throw lastError || new Error("All Groq models failed");

    } catch (error: any) {
        console.error("Debug: Connection Crash:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Unknown Error",
            stack: error.stack
        }, { status: 500 });
    }
}
