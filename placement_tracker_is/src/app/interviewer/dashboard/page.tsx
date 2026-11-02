'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { batchProgress } from '@/lib/mock-data';

interface TestData {
  id: string;
  testName: string;
  date: string;
  time: string;
  duration: number;
  company_name: string;
  interviewerName: string;
}

export default function InterviewerDashboardPage() {
  const [ongoingTests, setOngoingTests] = useState<TestData[]>([]);
  const [upcomingTests, setUpcomingTests] = useState<TestData[]>([]);
  const [closedTests, setClosedTests] = useState<TestData[]>([]);

  useEffect(() => {
    // Listen to Firestore in real-time
    const unsub = onSnapshot(collection(db, 'int_tests'), (snapshot) => {
      const now = new Date();
      const ongoing: TestData[] = [];
      const upcoming: TestData[] = [];
      const closed: TestData[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TestData;
        const testDateTime = new Date(`${data.date} ${data.time}`);
        if (isNaN(testDateTime.getTime())) return;

        const testEndTime = new Date(testDateTime.getTime() + (data.duration || 0) * 60000);

        if (now >= testDateTime && now <= testEndTime) {
          ongoing.push({ ...data, id: docSnap.id });
        } else if (now < testDateTime) {
          upcoming.push({ ...data, id: docSnap.id });
        } else {
          closed.push({ ...data, id: docSnap.id });
        }
      });

      setOngoingTests(ongoing);
      setUpcomingTests(upcoming);
      setClosedTests(closed);
    });

    // Re-evaluate every 30 seconds to auto-close tests as time progresses
    const timer = setInterval(() => {
      const now = new Date();
      setOngoingTests((tests) =>
        tests.filter((test) => {
          const start = new Date(`${test.date} ${test.time}`);
          const end = new Date(start.getTime() + (test.duration || 0) * 60000);
          return now < end;
        })
      );
    }, 30000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="grid gap-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Batch Performance Overview</CardTitle>
          <CardDescription>Monitor the overall progress of the current batch.</CardDescription>
        </CardHeader>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aptitude Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={batchProgress.aptitude}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="hsl(var(--primary))" name="Average Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Coding Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={batchProgress.coding}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="average" stroke="hsl(var(--primary))" name="Average Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Overall Skill Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Skill Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Aptitude', score: batchProgress.aptitude[5].average },
                { name: 'Coding', score: batchProgress.coding[5].average },
                { name: 'Soft Skills', score: batchProgress.softSkills[5].average },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 🟢 Ongoing Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Ongoing Tests</CardTitle>
          <CardDescription>Tests currently being conducted.</CardDescription>
        </CardHeader>
        <CardContent>
          {ongoingTests.length === 0 ? (
            <p className="text-gray-500">No ongoing tests right now.</p>
          ) : (
            <ul className="space-y-2">
              {ongoingTests.map((test) => (
                <li key={test.id} className="border rounded-lg p-3 bg-green-50">
                  <p className="font-medium">{test.testName}</p>
                  <p className="text-sm text-gray-600">
                    {test.company_name} — {test.date} {test.time} | Duration: {test.duration} min
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 🟠 Upcoming Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tests</CardTitle>
          <CardDescription>Tests scheduled for later.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingTests.length === 0 ? (
            <p className="text-gray-500">No upcoming tests scheduled.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingTests.map((test) => (
                <li key={test.id} className="border rounded-lg p-3 bg-yellow-50">
                  <p className="font-medium">{test.testName}</p>
                  <p className="text-sm text-gray-600">
                    {test.company_name} — {test.date} {test.time} | Duration: {test.duration} min
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* 🔴 Closed Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Closed Tests</CardTitle>
          <CardDescription>Tests that have ended.</CardDescription>
        </CardHeader>
        <CardContent>
          {closedTests.length === 0 ? (
            <p className="text-gray-500">No tests have been closed yet.</p>
          ) : (
            <ul className="space-y-2">
              {closedTests.map((test) => (
                <li key={test.id} className="border rounded-lg p-3 bg-gray-100">
                  <p className="font-medium">{test.testName}</p>
                  <p className="text-sm text-gray-600">
                    {test.company_name} — {test.date} {test.time} | Duration: {test.duration} min
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
