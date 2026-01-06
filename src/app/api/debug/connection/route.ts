
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

export async function GET() {
    console.log("Debug: Starting Connection Check...");

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Debug: API Key present?", !!apiKey);

    if (!apiKey) {
        return NextResponse.json({ success: false, error: "GEMINI_API_KEY is missing in env" }, { status: 500 });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // 1. Diagnostic: List all available models for this key
        let availableModels: string[] = [];
        try {
            console.log("Debug: Fetching available models...");
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const listData = await listRes.json();

            if (listData.models) {
                availableModels = listData.models.map((m: any) => m.name.replace('models/', ''));
                console.log("Debug: Available Models:", availableModels);
            } else {
                console.warn("Debug: Could not list models:", listData);
            }
        } catch (e: any) {
            console.error("Debug: Failed to list models:", e);
        }

        // Expanded list including 8b and variants
        const models = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-1.5-pro",
            "gemini-1.5-flash-002",
            "gemini-pro"
        ];

        const errors: string[] = [];

        for (const modelName of models) {
            try {
                console.log("Debug: Trying model:", modelName);
                const model = genAI.getGenerativeModel({ model: modelName });

                // Helper to generate with retry for 429 (Exponential Backoff)
                const generateWithRetry = async () => {
                    let attempts = 0;
                    while (attempts < 3) {
                        try {
                            return await model.generateContent("Test");
                        } catch (e: any) {
                            if (e.message?.includes("429") || e.status === 429) {
                                attempts++;
                                const delay = Math.pow(2, attempts + 1) * 1000; // 4s, 8s, 16s
                                console.log(`Debug: Hit 429 on ${modelName}. Retry ${attempts}/3 in ${delay}ms...`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                                continue;
                            }
                            throw e;
                        }
                    }
                    throw new Error(`Failed after 3 retries (Rate Limited)`);
                };

                console.log("Debug: Generating content with", modelName);
                const result = await generateWithRetry();
                const response = await result.response;
                const text = response.text();

                console.log("Debug: Success with", modelName);
                return NextResponse.json({ success: true, message: `Connected using ${modelName}` });
            } catch (e: any) {
                const msg = `[${modelName}]: ${e.message}`;
                console.log("Debug: Failed:", msg);
                errors.push(msg);
            }
        }

        // Return detailed failure report
        return NextResponse.json({
            success: false,
            error: "All models failed. Details:\n" + errors.join("\n")
        }, { status: 500 });

    } catch (error: any) {
        console.error("Debug: Connection Crash:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Unknown Error",
            stack: error.stack
        }, { status: 500 });
    }
}
