"use client";

import { Plus, FileText, Clock, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeftSidebarProps {
  onNewDocument: () => void;
}

export default function LeftSidebar({ onNewDocument }: LeftSidebarProps) {
  // Mock data for history
  const history = [
    { id: 1, title: "The Impact of AI on Education", date: "Today" },
    { id: 2, title: "Reflection on Modern Art", date: "Yesterday" },
    { id: 3, title: "Biology Lab Report", date: "Previous 7 Days" },
  ];

  return (
    <aside className="w-[60px] flex-shrink-0 bg-[#0c0d0e] border-r border-white/5 flex flex-col h-full z-10 transition-all duration-300 items-center py-4 gap-4">
      {/* New Document Button */}
      <div className="relative group flex items-center justify-center">
        <button
          onClick={onNewDocument}
          className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-white transition-all flex items-center justify-center"
        >
             <Plus className="w-5 h-5" />
        </button>
        {/* Tooltip */}
        <div className="absolute left-full ml-3 px-2 py-1 bg-[#2C2C3A] border border-white/10 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
          New Document
        </div>
      </div>

      <div className="w-8 h-px bg-white/5 my-2" />

      {/* History List (Icons Only) */}
      <div className="flex-1 overflow-y-auto w-full flex flex-col items-center gap-2 custom-scrollbar">
          {history.map((doc) => (
            <div key={doc.id} className="relative group flex items-center justify-center w-full">
               <button
                  className="w-10 h-10 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center"
                >
                  <FileText className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
               </button>
               {/* Tooltip */}
               <div className="absolute left-full ml-3 px-3 py-2 bg-[#2C2C3A] border border-white/10 rounded-lg text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  <div className="text-xs font-bold">{doc.title}</div>
                  <div className="text-[10px] text-gray-500">{doc.date}</div>
               </div>
            </div>
          ))}
      </div>
      
    </aside>
  );
}
