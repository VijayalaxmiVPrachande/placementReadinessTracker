// app/(app)/mockinterview/components/Feedback.tsx
'use client';
import React from "react";

export default function Feedback({ feedback }: { feedback: any }) {
  if (!feedback) return null;
  return (
    <div className="mt-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
      <div className="text-sm">⭐ <strong>Score:</strong> {feedback.score}/10</div>
      <div className="mt-2"><strong>Feedback:</strong> {feedback.feedback}</div>
      <div className="mt-1 text-sm text-muted-foreground"><strong>Tip:</strong> {feedback.improvement_tip}</div>
      {feedback.next_question && (
        <div className="mt-2 text-sm">🔁 <strong>Follow-up:</strong> {feedback.next_question}</div>
      )}
    </div>
  );
}
