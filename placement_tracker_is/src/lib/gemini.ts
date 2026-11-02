// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
if (!key) throw new Error("Missing GEMINI API KEY env NEXT_PUBLIC_GEMINI_API_KEY");

const genAI = new GoogleGenerativeAI(key);
export const getModel = (modelName = "gemini-2.5-flash") =>
  genAI.getGenerativeModel({ model: modelName });

// generate multiple line-separated questions
export async function generateQuestionsFromGemini(type: string, domain: string, difficulty: string) {
  const prompt = `
You are an expert interviewer and question-generator.
Generate 8 short ${difficulty} ${type} interview questions for ${domain} students.
- Return one question per line.
- For coding: give concise problem statements.
- For behavioral: focus on situational / HR prompts.
- Do NOT add numbering or explanation.
`;
  const model = getModel();
  const resp = await model.generateContent(prompt);
  // plain text
  return resp.response.text();
}

// evaluate an answer and return JSON with score, feedback, tip, optional next_question
export async function evaluateAnswerWithGemini(question: string, answer: string) {
  const prompt = `
You are an experienced HR interviewer & evaluator.
Given the question and candidate's spoken/typed answer:
1) Provide a numeric score 1-10 (higher is better)
2) A short feedback sentence
3) One improvement tip
4) A relevant follow-up question if appropriate

Respond ONLY as a JSON object exactly like:
{ "score": number, "feedback": "string", "improvement_tip": "string", "next_question": "string" }

Question: ${question}
Answer: ${answer}
`;
  const model = getModel();
  const resp = await model.generateContent(prompt);
  const text = resp.response.text();

  // try to extract JSON from returned text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : text;
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    // fallback: return a safe structure
    return {
      score: 5,
      feedback: "Couldn't parse model output; answer processed partially.",
      improvement_tip: "Try to be more specific and use examples.",
      next_question: ""
    };
  }
}
