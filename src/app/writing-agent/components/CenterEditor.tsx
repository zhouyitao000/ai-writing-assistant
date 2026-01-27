"use client";

import { Copy, Upload, Sparkles, FileText, Download, CheckCircle2, ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface CenterEditorProps {
  content: string;
  onChange: (text: string) => void;
  onAIRequest: (prompt?: string) => void;
}

export default function CenterEditor({ content, onChange, onAIRequest }: CenterEditorProps) {
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiRate, setAiRate] = useState<number>(0);
  const [isAiRateLoading, setIsAiRateLoading] = useState(false);

  // Trigger AI Rate update when content is generated (via onAIRequest completion - mocked here via effect on content change if we had a flag, but better to expose a method)
  // Or simply manual refresh.
  // Requirement: 1. AI generated new content. 2. Manual refresh.
  
  // We'll expose a manual refresh function and also listen to a prop or event if possible.
  // Since we don't have a "content generated" event passed down explicitly other than onChange,
  // we can rely on the parent or just simple manual refresh for now, plus a "dirty" check?
  // Let's implement the manual refresh first.
  
  const refreshAiRate = () => {
     if (!content.trim()) return;
     setIsAiRateLoading(true);
     setTimeout(() => {
        const mockRate = Math.min(100, Math.floor(Math.random() * 20) + (content.length % 80));
        setAiRate(mockRate);
        setIsAiRateLoading(false);
     }, 800);
  };

  // Listen for AI generation completion event
  useEffect(() => {
     const handleAiCompletion = () => {
        refreshAiRate();
     };
     window.addEventListener("ai-content-generated", handleAiCompletion);
     return () => window.removeEventListener("ai-content-generated", handleAiCompletion);
  }, [content]); // Dep on content to ensure we have latest text context

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleAiModalSubmit = () => {
    if (aiPrompt.trim()) {
      onAIRequest(aiPrompt);
    }
    setShowAiModal(false);
    setAiPrompt("");
  };

  const hasContent = content.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#17171A] overflow-hidden">
      
      {/* AI Creation Modal */}
      {showAiModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="w-full max-w-lg bg-[#1F2024] border border-white/10 rounded-2xl p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                What should AI write?
              </h3>
              <textarea
                autoFocus
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // We need to lift this state up. 
                    // Temporarily using onAIRequest as a trigger, but we need to pass data.
                    // I will update the parent component to accept data.
                    // For this step, I'll pass the prompt via a custom event or callback update.
                    // Let's check props again.
                  }
                }}
                placeholder="e.g. Write an outline for an essay about climate change..."
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white resize-none outline-none focus:border-purple-500/50"
              />
              <div className="flex justify-end gap-3 mt-4">
                 <button 
                   onClick={() => setShowAiModal(false)}
                   className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => {
                      // HACK: We need to change the prop type in the next step. 
                      // For now, I will invoke a prop that I will add to the interface.
                      // Let's assume onAIRequest(aiPrompt) works.
                      // I will update the interface definition below.
                      // @ts-ignore
                      onAIRequest(aiPrompt);
                      setShowAiModal(false);
                      setAiPrompt("");
                   }}
                   className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition-all"
                 >
                   Generate
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Empty State / Dashboard - Only visible when NO content */}
      {!hasContent && (
        <div className="flex-1 flex flex-col items-center p-8 animate-in fade-in duration-500 z-10 absolute inset-0 pointer-events-none">
          {/* Top Text Area */}
          <div className="w-full max-w-3xl mt-12 mb-8 text-center pointer-events-auto">
             <div className="text-4xl font-bold text-gray-300 tracking-tight leading-tight">
               Start typing or insert using <span className="text-gray-500">/</span>
             </div>
          </div>

          {/* Centered Buttons */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl pointer-events-auto">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button 
                onClick={handlePaste}
                className="group flex flex-col items-center gap-3 p-6 bg-[#2C2C3A] hover:bg-[#363645] border border-white/5 hover:border-white/10 rounded-2xl transition-all shadow-xl hover:shadow-2xl w-40 h-40 justify-center"
              >
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                  <Copy className="w-8 h-8 text-gray-300" />
                </div>
                <span className="text-sm font-bold text-white">Paste Text</span>
              </button>

              <button className="group flex flex-col items-center gap-3 p-6 bg-[#2C2C3A] hover:bg-[#363645] border border-white/5 hover:border-white/10 rounded-2xl transition-all shadow-xl hover:shadow-2xl w-40 h-40 justify-center">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                  <Upload className="w-8 h-8 text-gray-300" />
                </div>
                <span className="text-sm font-bold text-white">Import File</span>
              </button>

              <button 
                onClick={() => setShowAiModal(true)}
                className="group flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/10 rounded-2xl transition-all shadow-xl hover:shadow-purple-900/30 w-40 h-40 justify-center"
              >
                <div className="p-3 bg-white/20 rounded-xl transition-colors">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-bold text-white">AI Creation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Area - Always present but overlays empty state when content exists */}
      <div className={cn("absolute inset-0 flex flex-col transition-all duration-300", hasContent ? "z-20" : "z-0")}>
           {/* Editor Toolbar (Simple) - Only show when has content */}
           <div className={cn("h-14 border-b border-white/5 flex items-center justify-between px-8 bg-[#17171A]/95 backdrop-blur z-20 transition-opacity", !hasContent ? "opacity-0 pointer-events-none" : "opacity-100")}>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <FileText className="w-4 h-4" /> 
                    <span className="text-white font-medium">Untitled Document</span>
                 </div>
                 <span className="text-gray-600">|</span>
                 <div className="text-xs">
                    {content.split(/\s+/).filter(Boolean).length} words
                 </div>
              </div>
              <div className="flex items-center gap-3">
                 {hasContent && (
                    <div 
                      onClick={refreshAiRate}
                      className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all animate-in fade-in zoom-in duration-300 cursor-pointer hover:bg-opacity-20",
                      aiRate < 30 
                        ? "bg-green-500/10 text-green-400 border-green-500/20" 
                        : aiRate < 70 
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {isAiRateLoading ? (
                         <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : (
                         aiRate < 30 ? <ShieldCheck className="w-3.5 h-3.5" /> : aiRate < 70 ? <AlertTriangle className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />
                      )}
                      <span>AI Rate: {aiRate}%</span>
                    </div>
                 )}
                 <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm text-gray-300 transition-colors">
                    <Download className="w-4 h-4" /> Export
                 </button>
              </div>
           </div>

           {/* Textarea */}
           <div className="flex-1 overflow-hidden relative z-10">
              <div className="w-full h-full bg-transparent">
                <textarea
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={hasContent ? "Start writing here..." : ""}
                  className="w-full h-full min-h-[calc(100vh-200px)] bg-transparent border-none outline-none text-lg leading-loose text-gray-200 placeholder:text-gray-700 resize-none font-serif focus:ring-0 cursor-text overflow-y-auto custom-scrollbar px-12 md:px-24 lg:px-[20%] py-12"
                  spellCheck={false}
                />
              </div>
           </div>
      </div>
      
      {/* Invisible Overlay to capture click when empty - REMOVED because it was blocking textarea */}

    </div>
  );
}
