"use client";

import React from 'react';
import { ProtectRoute } from '@/hooks/use-auth';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectRoute>
      <SidebarProvider>
          <Sidebar>
            <DashboardSidebar />
          </Sidebar>
          <SidebarInset className="flex-1 flex flex-col bg-background">
            <DashboardHeader />
            <main className="p-4 md:p-6 flex-1 overflow-y-auto">
              {children}
            </main>
          </SidebarInset>
      </SidebarProvider>
    </ProtectRoute>
  );
}
