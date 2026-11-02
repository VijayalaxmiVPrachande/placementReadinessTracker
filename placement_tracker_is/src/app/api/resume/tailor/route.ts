import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const { resumeData, jobDescription } = await req.json();

        if (!resumeData || !jobDescription) {
            return NextResponse.json({ error: "Missing resume data or job description" }, { status: 400 });
        }

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        const prompt = `
      You are an expert resume writer. I will provide you with a candidate's resume data (JSON) and a Job Description.
      Your task is to rewrite the "Professional Summary" and "Skills" sections to better align with the Job Description. 
      Do NOT invent false information. Only highlight existing experience and skills that are relevant. Upgrade the professional summary to be impactful.
      
      Resume Data:
      ${JSON.stringify(resumeData)}

      Job Description:
      ${jobDescription}

      Return ONLY a JSON object with this structure:
      {
        "summary": "Updated professional summary...",
        "skills": ["Skill 1", "Skill 2", "Skill 3", ...]
      }
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up markdown code blocks if present
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

        const tailoredData = JSON.parse(cleanText);

        return NextResponse.json(tailoredData);

    } catch (error: any) {
        console.error("AI Resume Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate tailored resume" }, { status: 500 });
    }
}
