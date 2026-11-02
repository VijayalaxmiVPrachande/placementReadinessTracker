// app/(app)/mockinterview/components/Summary.tsx
'use client';
import React from "react";

export default function Summary({ summary }: { summary: any }) {
  if (!summary) return null;
  return (
    <div className="p-6 bg-green-50 border rounded">
      <h3 className="text-xl font-semibold">Interview Summary</h3>
      <p className="mt-2">Average Score: <strong>{summary.overall}</strong></p>
      <p className="mt-1 italic">{summary.remark}</p>
    </div>
  );
}
