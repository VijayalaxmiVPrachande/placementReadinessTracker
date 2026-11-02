import { NextResponse } from "next/server";
import { evaluateAnswerWithGemini } from "@/lib/gemini";

/**
 * POST /api/mockinterview/evaluate
 * Body: { question: string, answer: string }
 * Returns: { success: true, feedback: string }
 */
export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    // ✅ Validate inputs
    if (!question || !answer) {
      return NextResponse.json(
        { success: false, error: "Missing fields: question and answer are required." },
        { status: 400 }
      );
    }

    console.log("🧠 Evaluating mock interview answer...");
    console.log("Question:", question);
    console.log("Answer:", answer.substring(0, 80) + (answer.length > 80 ? "..." : ""));

    // ✅ Generate evaluation feedback using Gemini
    const feedback = await evaluateAnswerWithGemini(question, answer);

    // ✅ Return directly — no database writes
    return NextResponse.json({
      success: true,
      feedback: feedback || "⚠️ No feedback generated.",
    });
  } catch (err: any) {
    console.error("❌ Mock Interview Evaluation Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
