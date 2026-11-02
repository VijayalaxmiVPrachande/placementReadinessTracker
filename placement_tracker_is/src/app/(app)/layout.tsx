import { AppHeader } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* FIXED HEIGHT SIDEBAR */}
      <div className="hidden md:block h-full">
        <AppSidebar />
      </div>

      {/* MAIN CONTENT SCROLLS */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
          {children}
        </main>
      </div>

    </div>
  );
}
