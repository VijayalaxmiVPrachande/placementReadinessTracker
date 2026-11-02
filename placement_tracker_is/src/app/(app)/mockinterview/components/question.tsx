// app/(app)/mockinterview/components/Question.tsx
'use client';
import React from "react";

export default function Question({ text, index }: { text: string; index?: number }) {
  return (
    <div className="p-4 border rounded-md bg-white shadow-sm">
      {typeof index !== "undefined" && <div className="text-sm text-muted-foreground mb-1">Question {index + 1}</div>}
      <div className="text-lg font-medium">{text}</div>
    </div>
  );
}
