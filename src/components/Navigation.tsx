"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sparkles, Gift, User } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "AI Humanizer", href: "/" },
    { name: "Writing Agent", href: "/writing-agent" }, // New Tab
    { name: "AI Detector", href: "#", disabled: true },
    { name: "AI Citation Checker", href: "#", disabled: true },
    { name: "AI Translator", href: "#", disabled: true },
    { name: "Pricing", href: "#", disabled: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <div className="flex items-center gap-2 p-1.5 bg-[#1a1b1e]/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
        {/* Brand */}
        <div className="flex items-center gap-2 px-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight hidden md:block">
            GPTHumanizer <span className="text-purple-400">AI</span>
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-2 hidden md:block" />

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative group",
                  item.disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer",
                  isActive 
                    ? "text-white bg-white/10 shadow-inner" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                )}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 mx-2 hidden md:block" />

        {/* Right Actions */}
        <div className="flex items-center gap-3 px-3">
          <button className="text-yellow-400 hover:text-yellow-300 transition-colors">
            <Gift className="w-5 h-5" />
          </button>
          <div className="text-gray-400 text-sm font-medium flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
            EN <span className="text-[10px]">▼</span>
          </div>
          <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/40 transition-all">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
