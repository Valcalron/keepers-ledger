import { Link, useRouterState } from "@tanstack/react-router";
import {
  ScrollText,
  Users,
  History,
  Wrench,
  Package,
  FlaskConical,
  ClipboardCheck,
  BookMarked,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const nav = [
  { title: "Dashboard", url: "/", icon: ScrollText },
  { title: "NPC Tracker", url: "/npcs", icon: Users },
  { title: "Task History", url: "/history", icon: History },
  { title: "Technologies", url: "/technologies", icon: Wrench },
  { title: "Items & Recipes", url: "/items", icon: Package },
  { title: "Alchemy", url: "/alchemy", icon: FlaskConical },
  { title: "Unlock Audit", url: "/audit", icon: ClipboardCheck },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <BookMarked className="h-5 w-5 text-sidebar-primary shrink-0" />
          <div className="min-w-0">
            <div className="font-serif text-base font-semibold leading-tight">
              Keeper's Ledger
            </div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Graveyard Companion
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>The Book</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
