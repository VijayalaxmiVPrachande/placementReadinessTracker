import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const snap = await adminDB.collection("int_tests").limit(1).get();
    return NextResponse.json({
      success: true,
      sample: snap.docs.map((d) => d.data()),
    });
  } catch (e: any) {
    console.error("Admin test error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
