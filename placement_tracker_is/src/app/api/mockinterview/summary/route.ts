// app/api/mockinterview/summary/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { scores } = await req.json();
    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return NextResponse.json({ error: "Missing or invalid scores array" }, { status: 400 });
    }
    const sum = scores.reduce((a: number, b: number) => a + b, 0);
    const avg = +(sum / scores.length).toFixed(1);
    let remark = "Needs Improvement";
    if (avg >= 8) remark = "Excellent";
    else if (avg >= 6) remark = "Good";

    return NextResponse.json({ success: true, overall: avg, remark });
  } catch (err) {
    console.error("summary error", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
