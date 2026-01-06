
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
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Debug: Generating content...");
        const result = await model.generateContent("Test");
        const response = await result.response;
        const text = response.text();

        console.log("Debug: Generation success:", text);
        return NextResponse.json({ success: true, message: "Connected: " + text.substring(0, 20) });

    } catch (error: any) {
        console.error("Debug: Connection Crash:", error);
        return NextResponse.json({
            success: false,
            error: error.message || "Unknown Error",
            stack: error.stack
        }, { status: 500 });
    }
}
