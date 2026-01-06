
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

        // Try multiple models to find one that works
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-2.0-flash-exp"];
        let lastError;

        for (const modelName of models) {
            try {
                console.log("Debug: Trying model:", modelName);
                const model = genAI.getGenerativeModel({ model: modelName });

                console.log("Debug: Generating content with", modelName);
                const result = await model.generateContent("Test");
                const response = await result.response;
                const text = response.text();

                console.log("Debug: Success with", modelName);
                return NextResponse.json({ success: true, message: `Connected using ${modelName}` });
            } catch (e: any) {
                console.log(`Debug: Failed ${modelName}:`, e.message);
                lastError = e;
            }
        }

        throw lastError || new Error("All models failed");

    } catch (error: any) {
        console.error("Debug: Connection Crash:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Unknown Error",
            stack: error.stack
        }, { status: 500 });
    }
}
