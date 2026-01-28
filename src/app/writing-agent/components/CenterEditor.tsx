"use client";

import { Copy, Upload, Sparkles, FileText, Download, CheckCircle2, ShieldCheck, AlertTriangle, AlertOctagon, Bold, Italic, Underline, MessageSquare, Edit3, Plus, RefreshCw, Smile, GraduationCap, Scissors, ArrowRightLeft, FileSearch, Trash2, MoreHorizontal, Undo, Redo, Heading1, Heading2, Heading3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

interface CenterEditorProps {
  content: string;
  onChange: (text: string) => void;
  onAIRequest: (prompt?: string) => void;
  onAskAI: (selectedText: string) => void;
  onDeleteDocument: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export default function CenterEditor({ content, onChange, onAIRequest, onAskAI, onDeleteDocument, onUndo, onRedo }: CenterEditorProps) {
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiRate, setAiRate] = useState<number>(0);
  const [isAiRateLoading, setIsAiRateLoading] = useState(false);
  const [showDocMenu, setShowDocMenu] = useState(false);
  
  // Floating Toolbar State
  const [selection, setSelection] = useState<{ start: number; end: number; text: string } | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [showAiEditMenu, setShowAiEditMenu] = useState(false);

  // Side Menu State
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [sideMenuPosition, setSideMenuPosition] = useState<{ top: number } | null>(null);
  const [showInlineAi, setShowInlineAi] = useState(false); // Inline AI Dialog
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Selection
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (target.selectionStart !== target.selectionEnd) {
      const text = target.value.substring(target.selectionStart, target.selectionEnd);
      setSelection({ start: target.selectionStart, end: target.selectionEnd, text });
      
      // Auto-trigger Quote in Chatbot (Simulated)
      // Note: User requested "text automatically pasted into chatbot dialog"
      // We will trigger this on mouse up to ensure selection is final
    } else {
      setSelection(null);
      setToolbarPosition(null);
      setShowAiEditMenu(false);
      // Clear quote in RightSidebar
      window.dispatchEvent(new Event("ai-quote-clear"));
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (target.selectionStart !== target.selectionEnd) {
       // Show toolbar near mouse (for formatting)
       const rect = containerRef.current?.getBoundingClientRect();
       if (rect) {
          setToolbarPosition({
             x: e.clientX - rect.left,
             y: e.clientY - rect.top - 60 // Position above cursor
          });
       }
       // Auto-quote to chatbot
       const text = target.value.substring(target.selectionStart, target.selectionEnd);
       onAskAI(text);
    }
  };

  // Handle click outside to close inline AI
  useEffect(() => {
     const handleClickOutside = (e: MouseEvent) => {
        // Check if click is inside the inline AI dialog or the plus button
        const target = e.target as HTMLElement;
        if (showInlineAi && !target.closest('.inline-ai-dialog') && !target.closest('.side-menu-btn')) {
           setShowInlineAi(false);
        }
     };
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInlineAi]);

  // Handle Side Menu (Any Click or KeyUp)
  const updateSideMenu = (target: HTMLTextAreaElement) => {
     const cursorIndex = target.selectionStart;
     const text = target.value;
     
     // Only show if we have content and no selection
     if (target.selectionStart !== target.selectionEnd) {
        setShowSideMenu(false);
        setShowInlineAi(false);
        return;
     }

     // Simple positioning: Fixed left, but align Y with current line approximately
     // For a real editor we need precise coordinates. Here we'll just show it near the cursor Y if possible,
     // or just show it if focused.
     // Requirement: "Click anywhere... also show + on left"
     // We'll update Y position on click/keyup
     // Since we can't easily get line Y in textarea, we'll use a rough estimation or just show it active line.
     // But wait, the previous logic was "empty line". New logic is "anywhere".
     // Actually, usually "+" is for new blocks. If user clicks in middle of text, "+" might be distracting?
     // Requirement says: "including middle of text... insert at cursor".
     
     setShowSideMenu(true);
     
     // Hide inline AI if we moved cursor and it was open? Maybe keep it open if focused?
     // If user is typing, we might want to hide side menu?
     // Let's keep it simple: Show side menu when cursor moves.
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
     updateSideMenu(e.target as HTMLTextAreaElement);
  };

  const handleClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
     handleMouseUp(e);
     
     const target = e.target as HTMLTextAreaElement;
     const rect = containerRef.current?.getBoundingClientRect();
     
     // Update Y position based on click Y (approximation)
     // This is a bit hacky for textarea, but works for visual prototype
     if (rect) {
        // We want the button to be aligned with the line clicked.
        // e.clientY is the mouse position.
        // We'll snap it to the line height grid if possible, or just use mouse Y.
        setSideMenuPosition({ top: e.clientY - rect.top });
     }
     
     updateSideMenu(target);
  };

  // Actions
  const applyFormat = (format: string) => {
     if (!selection || !textareaRef.current) return;
     
     const { start, end, text } = selection;
     let newText = "";
     
     if (format === 'bold') newText = `**${text}**`;
     if (format === 'italic') newText = `*${text}*`;
     if (format === 'underline') newText = `<u>${text}</u>`; 
     if (format === 'h1') newText = `# ${text}`;
     if (format === 'h2') newText = `## ${text}`;
     if (format === 'h3') newText = `### ${text}`;
     
     const fullText = content.substring(0, start) + newText + content.substring(end);
     onChange(fullText);
     setSelection(null);
     setToolbarPosition(null);
  };

  const handleAiEditAction = (action: string) => {
     if (!selection) return;
     // Here we would call AI. For now, trigger AI request with specific prompt
     onAIRequest(`${action}: ${selection.text}`);
     setShowAiEditMenu(false);
     setSelection(null);
     setToolbarPosition(null);
  };

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

  // Auto-scroll on new content (if streaming)
  useEffect(() => {
     const handleScroll = () => {
        if (textareaRef.current) {
           textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
     };
     window.addEventListener("content-scroll-bottom", handleScroll);
     return () => window.removeEventListener("content-scroll-bottom", handleScroll);
  }, []);

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
      // If we have a cursor position from click, we should insert there
      // But onAIRequest usually appends or streams. 
      // We need to tell onAIRequest WHERE to insert. 
      // For now, we'll append to cursor position logic in the streaming handler if possible,
      // or just insert at current cursor.
      
      // Let's modify onAIRequest to handle insertion point?
      // Or better, we handle the insertion logic here if we were just pasting.
      // But it's streaming. 
      // Current implementation of onAIRequest in page.tsx calls handleStreamContent which appends.
      // We need to update page.tsx to support insertion at cursor.
      // For this prototype, we'll assume it appends to cursor if we could pass index, but existing logic appends to end.
      // Let's update the requirement: "Insert at cursor position".
      // We need to pass the cursor position to the parent or handle text update here.
      
      // Since `onAIRequest` triggers the side bar agent, we'll pass the prompt.
      // The side bar agent streams back via `onStreamContent`.
      // We need `onStreamContent` to insert at the right place.
      // This requires `CenterEditor` to manage the streaming insertion point? 
      // Or `page.tsx` to know the cursor.
      // Let's pass the cursor index to `onAIRequest`? No, it's just a prompt trigger.
      
      // Hack: We'll store the cursor position in a ref or state and when stream comes, we insert there?
      // But `onStreamContent` is in `page.tsx`.
      // We'll update `page.tsx` to handle insertion at a specific index if we can.
      // For now, let's just trigger the request. The user said "New generated content will insert at mouse cursor area".
      // I will implement a "insertAtCursor" logic in page.tsx if I can pass the index.
      // I'll attach the cursor index to the event.
      
      const cursorIndex = textareaRef.current?.selectionStart || content.length;
      onAIRequest(aiPrompt + ` [INSERT_AT:${cursorIndex}]`); // Hacky way to pass metadata or use a proper context
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
        <div className="flex-1 flex flex-col items-center p-8 animate-in fade-in duration-500 z-10 absolute inset-0 pointer-events-none pt-36">
          {/* Top Text Area */}
          <div className="w-full max-w-3xl mb-8 text-center pointer-events-auto">
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
                 <div className="flex items-center gap-2">
                    <button onClick={onUndo} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Undo">
                       <Undo className="w-4 h-4" />
                    </button>
                    <button onClick={onRedo} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Redo">
                       <Redo className="w-4 h-4" />
                    </button>
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
                 {/* Document Menu (Replacing Export Button) */}
                 <div className="relative">
                    <button 
                      onClick={() => setShowDocMenu(!showDocMenu)}
                      className="flex items-center gap-2 px-2 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                       <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showDocMenu && (
                       <div className="absolute right-0 top-full mt-2 w-40 bg-[#2C2C3A] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 z-50">
                          <div className="p-1">
                             <button className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Import
                             </button>
                             <button className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2">
                                <Download className="w-4 h-4" /> Export
                             </button>
                             <div className="h-px bg-white/10 my-1" />
                             <button 
                               onClick={() => { setShowDocMenu(false); onDeleteDocument(); }}
                               className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 rounded-lg text-sm flex items-center gap-2"
                             >
                                <Trash2 className="w-4 h-4" /> Delete
                             </button>
                          </div>
                       </div>
                    )}
                 </div>

              </div>
           </div>

           {/* Textarea */}
           <div className="flex-1 overflow-hidden relative z-10" ref={containerRef}>
              <div className="w-full h-full bg-transparent relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  onSelect={handleSelect}
                  onMouseUp={handleMouseUp}
                  onKeyUp={handleKeyUp}
                  onClick={handleClick}
                  placeholder={hasContent ? "Start writing here..." : ""}
                  className="w-full h-full min-h-[calc(100vh-200px)] bg-transparent border-none outline-none text-lg leading-loose text-gray-200 placeholder:text-gray-700 resize-none font-serif focus:ring-0 cursor-text overflow-y-auto custom-scrollbar px-12 md:px-24 lg:px-[20%] py-12"
                  spellCheck={false}
                />

                {/* Floating Selection Toolbar (Without Ask AI) */}
                {selection && toolbarPosition && (
                   <div 
                      className="absolute z-50 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
                      style={{ left: toolbarPosition.x, top: toolbarPosition.y }}
                   >
                      <div className="bg-[#2C2C3A] border border-white/10 rounded-xl shadow-2xl p-1.5 flex items-center gap-1 mb-2">
                         {/* Removed Ask AI Button as requested */}
                         <button onClick={() => setShowAiEditMenu(!showAiEditMenu)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white relative group" title="AI Edit">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                         </button>
                         <div className="w-px h-4 bg-white/10 mx-1" />
                         <button onClick={() => applyFormat('bold')} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Bold"><Bold className="w-4 h-4" /></button>
                         <button onClick={() => applyFormat('italic')} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Italic"><Italic className="w-4 h-4" /></button>
                         <button onClick={() => applyFormat('underline')} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Underline"><Underline className="w-4 h-4" /></button>
                         <div className="w-px h-4 bg-white/10 mx-1" />
                         <button onClick={() => applyFormat('h1')} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
                         <button onClick={() => applyFormat('h2')} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
                      </div>

                      {/* AI Edit Sub-menu */}
                      {showAiEditMenu && (
                         <div className="absolute top-full mt-2 w-48 bg-[#1F2024] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2">
                            <div className="p-1">
                               <button onClick={() => handleAiEditAction('Rewrite')} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> Rewrite</button>
                               <button onClick={() => handleAiEditAction('Make it human')} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2"><Smile className="w-3.5 h-3.5" /> Humanize</button>
                               <button onClick={() => handleAiEditAction('Make it academic')} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5" /> Academic</button>
                               <button onClick={() => handleAiEditAction('Shorten')} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2"><Scissors className="w-3.5 h-3.5" /> Shorten</button>
                            </div>
                         </div>
                      )}
                   </div>
                )}

                {/* Side "+" Menu (Floating Button) */}
                {showSideMenu && sideMenuPosition && !selection && !showInlineAi && (
                   <div 
                      className="absolute left-[15%] z-40 animate-in fade-in duration-300 side-menu-btn"
                      style={{ top: sideMenuPosition.top - 10 }}
                   >
                      <button 
                        onClick={() => setShowInlineAi(true)}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all shadow-lg"
                      >
                         <Plus className="w-5 h-5" />
                      </button>
                   </div>
                )}
                
                {/* Inline AI Dialog (Replaces Modal for side menu) */}
                {showInlineAi && sideMenuPosition && (
                   <div 
                      className="absolute left-[18%] z-50 animate-in slide-in-from-left-4 duration-300 w-full max-w-2xl inline-ai-dialog"
                      style={{ top: sideMenuPosition.top - 20 }}
                   >
                      <div className="bg-[#2C2C3A] border border-white/10 rounded-xl shadow-2xl p-2 flex items-center gap-2 w-full">
                         <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                         </div>
                         <input 
                            autoFocus
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => {
                               if (e.key === "Enter") {
                                  onAIRequest(aiPrompt);
                                  setShowInlineAi(false);
                                  setAiPrompt("");
                               }
                            }}
                            placeholder="Tell AI what to write..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 h-8"
                         />
                         <button 
                            onClick={() => {
                               onAIRequest("Continue writing");
                               setShowInlineAi(false);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap"
                         >
                            <Edit3 className="w-3 h-3" /> Continue writing
                         </button>
                      </div>
                   </div>
                )}

              </div>
           </div>
      </div>
    </div>
  );
}
