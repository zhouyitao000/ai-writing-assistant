"use client";

import { useState } from "react";
import Navigation from "@/components/Navigation";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import CenterEditor from "./components/CenterEditor";

import { Message } from "./components/RightSidebar";

interface Document {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function WritingAgentPage() {
  // -- State --
  const [documents, setDocuments] = useState<Document[]>([
    { id: "1", title: "The Impact of AI on Education", content: "AI is transforming education...", date: "Today" },
    { id: "2", title: "Reflection on Modern Art", content: "Modern art challenges our perceptions...", date: "Yesterday" },
  ]);
  const [currentDocId, setCurrentDocId] = useState<string>("1");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [chats, setChats] = useState<{ [docId: string]: Message[] }>({});

  // Derived state
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const currentMessages = chats[currentDocId] || [];

  // Handlers
  const handleUpdateMessages = (newMessages: Message[]) => {
     setChats(prev => ({
        ...prev,
        [currentDocId]: newMessages
     }));
  };
  
  // Undo/Redo Stacks (Simple implementation for current doc)
  const [history, setHistory] = useState<{ [docId: string]: string[] }>({});
  const [future, setFuture] = useState<{ [docId: string]: string[] }>({});

  // Helper to save history before change
  const saveToHistory = (docId: string, content: string) => {
     setHistory(prev => ({
        ...prev,
        [docId]: [...(prev[docId] || []), content].slice(-20) // Limit stack size
     }));
     setFuture(prev => ({ ...prev, [docId]: [] })); // Clear redo stack on new change
  };

  const handleUpdateContent = (newContent: string, saveHistory = true) => {
    if (saveHistory && currentDoc.content !== newContent) {
       saveToHistory(currentDocId, currentDoc.content);
    }
    setDocuments(prev => prev.map(doc => 
      doc.id === currentDocId ? { ...doc, content: newContent } : doc
    ));
  };
  
  const handleUndo = () => {
     const docHistory = history[currentDocId] || [];
     if (docHistory.length === 0) return;
     
     const previous = docHistory[docHistory.length - 1];
     const newHistory = docHistory.slice(0, -1);
     
     setFuture(prev => ({
        ...prev,
        [currentDocId]: [currentDoc.content, ...(prev[currentDocId] || [])]
     }));
     setHistory(prev => ({ ...prev, [currentDocId]: newHistory }));
     
     // Update doc without saving to history again
     setDocuments(prev => prev.map(doc => 
       doc.id === currentDocId ? { ...doc, content: previous } : doc
     ));
  };

  const handleRedo = () => {
     const docFuture = future[currentDocId] || [];
     if (docFuture.length === 0) return;
     
     const next = docFuture[0];
     const newFuture = docFuture.slice(1);
     
     setHistory(prev => ({
        ...prev,
        [currentDocId]: [...(prev[currentDocId] || []), currentDoc.content]
     }));
     setFuture(prev => ({ ...prev, [currentDocId]: newFuture }));
     
     setDocuments(prev => prev.map(doc => 
       doc.id === currentDocId ? { ...doc, content: next } : doc
     ));
  };
  
  const handleNewDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: "Untitled Document",
      content: "",
      date: "Just now"
    };
    setDocuments(prev => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
  };

  const handleSelectDocument = (id: string) => {
    setCurrentDocId(id);
  };
  
  const handleInsertContent = (text: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === currentDocId ? { ...doc, content: doc.content ? doc.content + "\n\n" + text : text } : doc
    ));
  };

  const handleStreamContent = (chunk: string) => {
    // Dispatch event for CenterEditor to handle DOM updates directly
    window.dispatchEvent(new CustomEvent("ai-stream-chunk", { detail: { chunk } }));
  };
  
  const handleDeleteDocument = () => {
     if (documents.length <= 1) {
        alert("Cannot delete the last document.");
        return;
     }
     if (confirm("Are you sure you want to delete this document?")) {
        const newDocs = documents.filter(d => d.id !== currentDocId);
        setDocuments(newDocs);
        setCurrentDocId(newDocs[0].id);
     }
  };

  const handleAIRequest = (prompt?: string, mode?: string) => {
    setIsRightSidebarOpen(true);
    if (prompt) {
       const event = new CustomEvent("ai-prompt-request", { detail: { prompt, mode } });
       window.dispatchEvent(event);
    }
  };

  // Helper to trigger quote in RightSidebar
  const handleAskAI = (selectedText: string) => {
    setIsRightSidebarOpen(true);
    // Dispatch event to RightSidebar
    const event = new CustomEvent("ai-quote-request", { detail: { text: selectedText } });
    window.dispatchEvent(event);
  };

  return (
    <div className="h-screen bg-[#0c0d0e] text-white font-sans overflow-hidden flex flex-col">
      <Navigation />

      {/* Main Workspace (Below Nav) */}
      <div className="flex-1 flex pt-24 overflow-hidden relative z-10">
        
        {/* 1. Left Sidebar: Document Management */}
        <LeftSidebar 
          documents={documents}
          currentDocId={currentDocId}
          onNewDocument={handleNewDocument} 
          onSelectDocument={handleSelectDocument}
        />

        {/* 2. Center Stage: Editor */}
        <CenterEditor 
          key={currentDocId} // Force remount on doc change to clear state
          content={currentDoc?.content || ""} 
          onChange={handleUpdateContent}
          onAIRequest={handleAIRequest}
          onAskAI={handleAskAI}
          onDeleteDocument={handleDeleteDocument}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* 3. Right Sidebar: AI Copilot */}
        <RightSidebar 
          isOpen={isRightSidebarOpen} 
          onInsertContent={handleInsertContent}
          onStreamContent={handleStreamContent}
          messages={currentMessages}
          onMessagesChange={handleUpdateMessages}
        />
      </div>
    </div>
  );
}
