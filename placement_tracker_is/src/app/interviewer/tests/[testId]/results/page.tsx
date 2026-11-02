'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Card,
  CardHeader,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface TestData {
  testName: string;
  date: string;
  time: string;
  duration: number;
  negativeMarks: number;
  numQuestions: number;
  company_name: string;
  interviewerName: string;
}

interface StudentResult {
  id: string;
  email: string;
  studentName: string;
  score: number;
  correct: number;
  wrong: number;
  submittedAt: string;
}

export default function TestResultsPage() {
  const { testId } = useParams();
  const [testData, setTestData] = useState<TestData | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (testId) {
      fetchTestDetails();
      fetchStudentResults();
    }
  }, [testId]);

  async function fetchTestDetails() {
    const testDoc = await getDoc(doc(db, 'int_tests', testId as string));
    if (testDoc.exists()) {
      setTestData(testDoc.data() as TestData);
    }
  }

  async function fetchStudentResults() {
    const attemptedRef = collection(db, 'int_tests', testId as string, 'student_attempted');
    const snapshot = await getDocs(query(attemptedRef));
    const tempResults: StudentResult[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const email = data.email;
      const score = data.score;
      const correct = data.correct ?? 0;
      const wrong = data.wrong ?? 0;
      const submittedAt = data.submittedAt?.toDate?.()?.toLocaleString?.() || '';

      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      const userSnap = await getDocs(userQuery);
      const studentName = userSnap.docs[0]?.data()?.name || '';

      tempResults.push({
        id: docSnap.id,
        email,
        score,
        correct,
        wrong,
        submittedAt,
        studentName,
      });
    }

    setResults(tempResults);
    setLoading(false);
  }

  // ✅ Generate PDF (after DOM fully rendered)
  const handleDownloadPDF = async () => {
    if (!pdfRef.current || loading) return;

    setGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for layout to stabilize

    const input = pdfRef.current;
    const canvas = await html2canvas(input, {
      scale: 1.5, // better text quality
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 10;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let y = 5;
    pdf.addImage(imgData, 'PNG', 5, y, imgWidth, imgHeight);

    // multi-page support
    let heightLeft = imgHeight;
    while (heightLeft > pageHeight) {
      heightLeft -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 5, -heightLeft + 5, imgWidth, imgHeight);
    }

    pdf.save(`${testData?.testName || 'Test_Results'}.pdf`);
    setGenerating(false);
  };

  return (
    <div className="p-6 space-y-8">
      {testData ? (
        <>
          {/* Header and Button */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">{testData.testName}</h1>
            <Button onClick={handleDownloadPDF} disabled={loading || generating}>
              {generating ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>

          {/* ✅ Printable section */}
          <div
            ref={pdfRef}
            className="space-y-6 mt-4 text-[14px] leading-relaxed bg-white p-4 rounded-md"
          >
            {/* Test Details */}
            <Card className="shadow-md">
              <CardHeader>
                <h2 className="text-xl font-semibold">Test Details</h2>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-2 text-sm">
                <p><strong>Date:</strong> {testData.date}</p>
                <p><strong>Time:</strong> {testData.time}</p>
                <p><strong>Duration:</strong> {testData.duration} min</p>
                <p><strong>Questions:</strong> {testData.numQuestions}</p>
                <p><strong>Company:</strong> {testData.company_name}</p>
                <p><strong>Interviewer:</strong> {testData.interviewerName}</p>
                <p><strong>Negative Marks:</strong> {testData.negativeMarks}</p>
              </CardContent>
            </Card>

            {/* Student Results Table */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Student Results</h2>
              {loading ? (
                <p>Loading results...</p>
              ) : results.length === 0 ? (
                <p className="text-gray-500">No students have attempted this test yet.</p>
              ) : (
                <div className="overflow-x-auto border rounded-md shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead>#</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-center">Attempted</TableHead>
                        <TableHead className="text-center">Correct</TableHead>
                        <TableHead className="text-center">Wrong</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead>Submitted At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((student, index) => (
                        <TableRow key={student.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{student.studentName || 'Unknown'}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell className="text-center">{student.correct + student.wrong}</TableCell>
                          <TableCell className="text-center">{student.correct}</TableCell>
                          <TableCell className="text-center">{student.wrong}</TableCell>
                          <TableCell className="text-center font-medium">{student.score}</TableCell>
                          <TableCell>{student.submittedAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
          </div>
        </>
      ) : (
        <p>Loading test details...</p>
      )}
    </div>
  );
}
