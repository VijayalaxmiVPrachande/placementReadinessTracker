'use client';

import { IntSidebar, IntMobileNav } from "@/components/layout/sidebar";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function InterviewerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  async function fetchInterviewerData(userId: string) {
    try {
      const q = query(collection(db, "int_users"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data();
        setName(userDoc.interviewerName || '');
        setCompany(userDoc.company_name || '');
      }
    } catch (error) {
      console.error("Error fetching interviewer data:", error);
    }
  }

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      fetchInterviewerData(storedUserId);
    }
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* FIXED SIDEBAR */}
      <div className="hidden md:block h-full">
        <IntSidebar />
      </div>

      {/* MAIN CONTENT AREA (scrolls independently) */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* HEADER */}
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <IntMobileNav />
            <h1 className="text-lg font-semibold">
              Interviewer Dashboard - {company} ({name})
            </h1>
          </div>
        </header>

        {/* PAGE CONTENT - SCROLLABLE */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
          {children}
        </main>

      </div>

    </div>
  );
}
