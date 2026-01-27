"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import CenterEditor from "./components/CenterEditor";

export default function WritingAgentPage() {
  const [editorContent, setEditorContent] = useState("");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const handleNewDocument = () => {
    if (confirm("Create new document? Unsaved changes will be lost.")) {
      setEditorContent("");
    }
  };

  const handleInsertContent = (text: string) => {
    setEditorContent((prev) => {
      const separator = prev ? "\n\n" : "";
      return prev + separator + text;
    });
  };

  const handleAIRequest = (prompt?: string) => {
    setIsRightSidebarOpen(true);
    // This function will be passed to RightSidebar via a ref or context in a real app.
    // For now, we need to signal RightSidebar to handle this prompt.
    // Since we don't have a global store, we can use a simple event bus or prop.
    if (prompt) {
       // Dispatch a custom event that RightSidebar listens to
       const event = new CustomEvent("ai-prompt-request", { detail: { prompt } });
       window.dispatchEvent(event);
    }
  };

  return (
    <div className="h-screen bg-[#0c0d0e] text-white font-sans overflow-hidden flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <Navigation />

      {/* Main Workspace (Below Nav) */}
      <div className="flex-1 flex pt-24 overflow-hidden relative z-10">
        
        {/* 1. Left Sidebar: Document Management */}
        <LeftSidebar onNewDocument={handleNewDocument} />

        {/* 2. Center Stage: Editor */}
        <CenterEditor 
          content={editorContent} 
          onChange={setEditorContent}
          onAIRequest={handleAIRequest}
        />

        {/* 3. Right Sidebar: AI Copilot */}
        <RightSidebar 
          isOpen={isRightSidebarOpen} 
          onInsertContent={handleInsertContent}
          onStreamContent={(chunk) => setEditorContent(prev => prev + chunk)}
        />

      </div>
    </div>
  );
}
