import { NextResponse } from "next/server";
import { generateUI } from "../../../../lib/ai-service"; // Uses the robust Zod service
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 1. Check Auth (Optional: remove if you want public generation)
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Request
    const { prompt, style = "apple-min" } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 3. Call Gemini via our robust service
    const result = await generateUI(prompt, style);

    if (!result.success) {
      // Pass the actual error message from the service
      throw new Error(result.error);
    }

    // 4. Return standard response
    return NextResponse.json({
      version: "1",
      variants: result.data.variants
    });

  } catch (error: any) {
    console.error("Generation API Error:", error);

    // Nice error handling for the frontend
    return NextResponse.json(
      { error: error.message || "Failed to generate UI" },
      { status: 500 }
    );
  }
}