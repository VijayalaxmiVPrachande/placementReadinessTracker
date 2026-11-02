"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TestMeta {
  id: string;
  title: string;
  ques: number;
  duration: number;
}

export default function SoftSkillsTestsPage() {
  const [testId, setTestId] = useState("");
  const [title, setTitle] = useState("");
  const [ques, setQues] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadingTest, setLoadingTest] = useState(false);

  const [tests, setTests] = useState<TestMeta[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [addedQuestions, setAddedQuestions] = useState<number>(0);
  const [question, setQuestion] = useState("");
  const [ans, setAns] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const snapshot = await getDocs(collection(db, "softskill_test"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as TestMeta[];
        setTests(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTests();
  }, []);

  useEffect(() => {
    if (!selectedTestId) return;
    const fetchQuestionsCount = async () => {
      try {
        const q = query(collection(db, "softskill_test_ques"), where("id", "==", selectedTestId));
        const snapshot = await getDocs(q);
        setAddedQuestions(snapshot.size);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuestionsCount();
  }, [selectedTestId]);

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTest(true);
    try {
      await addDoc(collection(db, "softskill_test"), { id: testId, title, ques, duration });
      alert("Test added successfully!");
      setTestId(""); setTitle(""); setQues(0); setDuration(0);

      const snapshot = await getDocs(collection(db, "softskill_test"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as TestMeta[];
      setTests(data);
    } catch (error) {
      console.error(error);
      alert("Failed to add test");
    } finally {
      setLoadingTest(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTestId) return;
    const selectedTest = tests.find((t) => t.id === selectedTestId);
    if (!selectedTest) return;
    if (addedQuestions >= selectedTest.ques) {
      alert("Maximum questions reached!");
      return;
    }

    setLoadingQuestion(true);
    try {
      await addDoc(collection(db, "softskill_test_ques"), { id: selectedTestId, question, ans, options });
      alert("Question added!");
      setQuestion(""); setAns(""); setOptions(["", "", "", ""]);
      setAddedQuestions(prev => prev + 1);
    } catch (error) {
      console.error(error);
      alert("Failed to add question");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  return (
    <div className="bg-gray-50 min-h-screen p-6 space-y-10">
      {/* Add Test Metadata */}
      <section className="bg-white shadow-lg rounded-xl p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Add Test Metadata</h2>
        <form onSubmit={handleAddTest} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Test ID</label>
            <input type="text" value={testId} onChange={e => setTestId(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Test Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Number of Questions</label>
              <input type="number" value={ques} onChange={e => setQues(Number(e.target.value))} required className={inputClass} />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Duration (minutes)</label>
              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required className={inputClass} />
            </div>
          </div>
          <Button type="submit" className="w-full py-2" disabled={loadingTest}>
            {loadingTest ? "Adding..." : "Add Test"}
          </Button>
        </form>
      </section>

      {/* Add Test Question */}
      <section className="bg-white shadow-lg rounded-xl p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Add Test Question</h2>
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Select Test</label>
            <select value={selectedTestId || ""} onChange={e => setSelectedTestId(e.target.value)} required className={inputClass}>
              <option value="">Select Test</option>
              {tests.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} <Badge variant="secondary">{addedQuestions}/{t.ques} added</Badge>
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Question</label>
            <textarea value={question} onChange={e => setQuestion(e.target.value)} required className={inputClass + " h-24"} />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Correct Answer</label>
            <input type="text" value={ans} onChange={e => setAns(e.target.value)} required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((opt, i) => (
              <div key={i}>
                <label className="block mb-1 font-medium text-gray-700">Option {i + 1}</label>
                <input type="text" value={opt} onChange={e => handleOptionChange(i, e.target.value)} required className={inputClass} />
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full py-2" disabled={loadingQuestion || !selectedTestId}>
            {loadingQuestion ? "Adding..." : "Add Question"}
          </Button>
        </form>
      </section>
    </div>
  );
}
