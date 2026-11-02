"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { BookCopy, BrainCircuit, LayoutDashboard, LogOut, Rocket, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/aptitude-tests", label: "Aptitude Tests", icon: BrainCircuit },
    { href: "/dashboard/soft-skills-tests", label: "Soft Skills Tests", icon: BookCopy },
    {href: "/dashboard/addinterviewers", label: "Add Interviewers", icon: Users},
    { href: "/dashboard/viewinterviewers", label: "Interviewers", icon: Users },
  ];

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2">
            <Rocket className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold font-headline text-sidebar-foreground">Nexus Admin</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                    <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto border-t border-sidebar-border">
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip="Logout">
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
