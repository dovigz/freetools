"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { tools } from "@/lib/categories";

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar {...props} className="border-r border-gray-200">
      <SidebarContent className="bg-white">
        {/* Logo at the top */}
        <div className="flex items-center justify-start h-16 border-b px-4">
          <Link
            href="/"
            onClick={handleLinkClick}
            className="flex items-center gap-3 select-none group transition-all duration-200"
          >
            <div className="flex items-center">
              <span className="font-bold text-xl text-gray-900">Free</span>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tools
              </span>
              <span className="ml-1 origin-center">🛠️</span>
            </div>
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((tool) => (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === tool.path}
                    className="justify-start text-gray-700 hover:bg-gray-50 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900"
                  >
                    <Link
                      href={tool.path}
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium"
                    >
                      <span className="text-base">{tool.emoji}</span>
                      <span>{tool.name}</span>
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
