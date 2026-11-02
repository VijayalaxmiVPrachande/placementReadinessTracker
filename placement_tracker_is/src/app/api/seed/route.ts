import { seedQuestions } from '@/lib/seed-questions';

export async function GET() {
  const result = await seedQuestions();
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
}