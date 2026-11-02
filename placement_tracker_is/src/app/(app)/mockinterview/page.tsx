'use client';
import React, { useState } from "react";
import Question from "./components/question";
import Feedback from "./components/feedback";
import Summary from "./components/summary";

export default function MockInterviewPage() {
  const [type, setType] = useState("technical");
  const [domain, setDomain] = useState("cse");
  const [difficulty, setDifficulty] = useState("easy");

  const [questions, setQuestions] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [allAnswered, setAllAnswered] = useState(false);

  // Generate questions
  const startInterview = async () => {
    setLoading(true);
    setQuestions([]);
    setCurrent(0);
    setAnswer("");
    setFeedback(null);
    setScores([]);
    setSummary(null);
    setAnswered(false);
    setAllAnswered(false);

    const res = await fetch("/api/mockinterview/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, domain, difficulty, saveToFirestore: true }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) setQuestions(data.questions);
    else alert(data.error || "No questions returned.");
  };

  // Submit one answer
  const submitAnswer = async () => {
    if (!questions[current]) return;
    if (!answer.trim()) {
      alert("Please enter your answer before submitting.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/mockinterview/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: questions[current], answer }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setFeedback(data.feedback);
      setScores((s) => [...s, data.feedback.score]);
      setAnswered(true);
    } else alert(data.error || "Evaluation failed");
  };

  // Next question
  const nextQuestion = () => {
    if (!answered) {
      alert("Please submit your answer before proceeding.");
      return;
    }

    if (current + 1 < questions.length) {
      setFeedback(null);
      setAnswer("");
      setAnswered(false);
      setCurrent((c) => c + 1);
    } else {
      setAllAnswered(true);
    }
  };

  // Finish interview
  const finishInterview = async () => {
    const res = await fetch("/api/mockinterview/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores }),
    });
    const data = await res.json();
    setSummary(data);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 bg-gradient-to-b from-white to-gray-100 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center text-blue-700">AI Mock Interview</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        <select value={type} onChange={(e) => setType(e.target.value)} className="border p-2 rounded-lg shadow-sm">
          <option value="technical">Technical</option>
          {/* <option value="coding">Coding</option> */}
          <option value="HR Interview">HR Interview</option>
        </select>

        {/* <select value={domain} onChange={(e) => setDomain(e.target.value)} className="border p-2 rounded-lg shadow-sm">
          <option value="cse">CSE</option>
          <option value="ece">ECE</option>
          <option value="mech">MECH</option>
        </select> */}

        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="border p-2 rounded-lg shadow-sm">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button
          onClick={startInterview}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>
      </div>

      {/* Navigation Buttons */}
      {questions.length > 0 && !summary && (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              disabled={!answered && i !== current}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                i === current ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Question Section */}
      {questions.length === 0 && (
        <div className="text-gray-500 text-center text-lg">
          No questions yet — click Generate to start your interview.
        </div>
      )}

      {questions.length > 0 && !summary && (
        <div className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <div className="font-semibold text-gray-700">
            Question {current + 1} of {questions.length}
          </div>

          <Question text={questions[current]} index={current} className="text-black" />

          <textarea
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border rounded-lg p-3 text-gray-800 focus:ring-2 focus:ring-blue-400"
            placeholder="Type your answer here..."
          />

          {!feedback ? (
            <div className="flex gap-2">
              <button
                onClick={submitAnswer}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md"
                disabled={loading}
              >
                {loading ? "Evaluating..." : "Submit Answer"}
              </button>
            </div>
          ) : (
            <>
              <Feedback feedback={feedback} />
              <div className="flex justify-end gap-2">
                {!allAnswered ? (
                  <button
                    onClick={nextQuestion}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
                  >
                    {current + 1 < questions.length ? "Next Question" : "Finish All"}
                  </button>
                ) : (
                  <button
                    onClick={finishInterview}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md"
                  >
                    Submit Interview
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {summary && <Summary summary={summary} />}
    </div>
  );
}
