"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Star, Menu } from "lucide-react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function MainHeader() {
  const { state: sidebarState, isMobile } = useSidebar();
  return (
    <>
      <header
        className="w-full flex items-center justify-between px-3 sm:px-4 lg:pr-6 h-16 border-b bg-white/95 backdrop-blur-sm shadow-sm"
      >
        {/* Left: Sidebar trigger and logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <SidebarTrigger className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SidebarTrigger>

          {/* Mobile logo */}
          <Link
            href="/"
            className="md:hidden flex items-center gap-2 select-none group transition-all duration-200"
          >
            <div className="flex items-center">
              <span className="font-bold text-lg text-gray-900">Free</span>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tools
              </span>
              <span className="ml-1 origin-center">🛠️</span>
            </div>
          </Link>
        </div>

        {/* Right: GitHub Star Button */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">
          <Link
            href="https://github.com/dovigz/freetools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Button
              variant="outline"
              size="sm"
              className="bg-black text-white border-black hover:bg-gray-800 transition-all duration-200 shadow-sm h-8 px-2 sm:px-3 lg:h-9 lg:px-4"
            >
              <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="text-xs lg:text-sm font-medium">
                Star on GitHub
              </span>
            </Button>
          </Link>
        </div>
      </header>
    </>
  );
}
