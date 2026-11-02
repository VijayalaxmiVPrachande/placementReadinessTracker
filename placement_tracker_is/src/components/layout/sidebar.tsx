'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookCopy,
  Code,
  ClipboardList,
  Lightbulb,
  Trophy,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  CheckCircle,
  Briefcase,
  FileText,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const navItems = [
  { href: `/dashboard`, icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/aptitude', icon: BookCopy, label: 'Aptitude' },
  { href: '/coding', icon: Code, label: 'Coding' },
  { href: '/soft-skills', icon: ClipboardList, label: 'Soft Skills' },
  { href: '/practice-tips', icon: Lightbulb, label: 'Practice Tips' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/mockinterview', icon: Settings, label: 'MockTest' },
  { href: '/jobs', icon: Briefcase, label: 'Jobs' },
  { href: '/resume', icon: FileText, label: 'Resume Builder' },
];

const intNavItems = [
  { href: '/interviewer/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/interviewer/batch', icon: BookCopy, label: 'Batch' },
  { href: '/interviewer/tests', icon: ClipboardList, label: 'Tests' },
  { href: '/interviewer/analytics', icon: Trophy, label: 'Analytics' },
  { href: '/interviewer/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

function NavContent({ items, isMobile = false }: { items: typeof navItems, isMobile?: boolean }) {
  const pathname = usePathname();

  const content = (
    <nav className="grid items-start gap-2 px-2 py-2">
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const link = (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              { 'bg-muted text-primary': isActive }
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="truncate">{item.label}</span>
          </Link>
        );

        return isMobile ? link : (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );

  return isMobile ? content : <TooltipProvider>{content}</TooltipProvider>;
}

/**
 * Key changes to ensure footer (logout) is fixed:
 * - Make the outermost sidebar container `h-screen` so it fills viewport height.
 * - Use `flex flex-col` so header, body, footer stack vertically.
 * - Give the middle section `flex-1 overflow-y-auto` so _only_ it scrolls.
 * - Make header/footer `shrink-0` (or `h-14` / `p-4`) so they never collapse.
 */

export function AppSidebar() {
  const avatar = PlaceHolderImages.find((img) => img.id === 'avatar-1');

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      {/* Fill the viewport height */}
      <div className="flex flex-col h-screen">

        {/* Header (fixed) */}
        <div className="flex items-center h-14 border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CheckCircle className="h-6 w-6 text-primary" />
            <span className="font-headline">NexusPrep</span>
          </Link>
        </div>

        {/* Scrollable navigation only */}
        <div className="flex-1 overflow-y-auto">
          <NavContent items={navItems} />
        </div>

        {/* Footer / Logout (fixed) */}
        <div className="p-4 border-t shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/login"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

      </div>
    </div>
  );
}

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>

      {/* Make SheetContent fill viewport height as well */}
      <SheetContent side="left" className="flex flex-col h-screen">

        {/* Header */}
        <div className="flex items-center h-14 border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CheckCircle className="h-6 w-6 text-primary" />
            <span className="font-headline">NexusPrep</span>
          </Link>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto">
          <NavContent items={navItems} isMobile={true} />
        </div>

        {/* Footer / Logout (fixed) */}
        <div className="border-t p-4 shrink-0">
          <Link
            href="/login"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>

      </SheetContent>
    </Sheet>
  );
}

export function IntSidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex flex-col h-screen">

        {/* Header */}
        <div className="flex items-center h-14 border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-headline">NexusPrep</span>
          </Link>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto">
          <NavContent items={intNavItems} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t shrink-0">
          <Button size="sm" variant="ghost" className="w-full justify-start" asChild>
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />Exit
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}

export function IntMobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex flex-col h-screen">

        {/* Header */}
        <div className="flex items-center h-14 border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-headline">NexusPrep</span>
          </Link>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto">
          <NavContent items={intNavItems} isMobile={true} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t shrink-0">
          <Button size="sm" variant="ghost" className="w-full justify-start" asChild>
            <Link href="/">
              <LogOut className="mr-2 h-4 w-4" />Exit
            </Link>
          </Button>
        </div>


      </SheetContent>
    </Sheet>
  );
}
