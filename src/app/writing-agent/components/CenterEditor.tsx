import { Copy, Upload, Sparkles, FileText, Download, CheckCircle2, ShieldCheck, AlertTriangle, AlertOctagon, Bold, Italic, Underline, MessageSquare, Edit3, Plus, RefreshCw, Smile, GraduationCap, Scissors, ArrowRightLeft, FileSearch, Trash2, MoreHorizontal, Undo, Redo, Heading1, Heading2, Heading3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";

interface CenterEditorProps {
  content: string;
  onChange: (text: string) => void;
  onAIRequest: (prompt: string, mode?: string) => void;
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
  
  // Editor State
  const editorRef = useRef<HTMLDivElement>(null);
  const [streamMode, setStreamMode] = useState<'append' | 'insert' | 'replace'>('append');
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const isStreamingRef = useRef(false);
  const hasReplacedRef = useRef(false); 
  const lastSelectionRef = useRef<Range | null>(null); // Track last valid cursor position

  // Floating Toolbar State
  const [selection, setSelection] = useState<{ text: string } | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null);
  const [showAiEditMenu, setShowAiEditMenu] = useState(false);

  // Side Menu State
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [sideMenuPosition, setSideMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [showInlineAi, setShowInlineAi] = useState(false); // Inline AI Dialog
  const containerRef = useRef<HTMLDivElement>(null);

  // -- Sync Content Prop to Editable Div --
  useEffect(() => {
     if (editorRef.current && !isStreamingRef.current) {
        // Force update if content changed or if it's a new document load (content differs from innerHTML)
        // We trust 'content' prop as the source of truth when not streaming.
        if (editorRef.current.innerHTML !== content) {
           editorRef.current.innerHTML = content;
        }
     }
  }, [content]);

  const handleInput = () => {
     if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
        checkSelection(); // Update floating menus
     }
  };

  // -- Selection & Toolbar Logic --
  const checkSelection = useCallback(() => {
     const sel = window.getSelection();
     if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
        setSelection(null);
        setToolbarPosition(null);
        setShowAiEditMenu(false);
        return;
     }

     const text = sel.toString();
     if (text.trim()) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        if (containerRect) {
           setSelection({ text });
           setToolbarPosition({
              x: rect.left + (rect.width / 2) - containerRect.left,
              y: rect.top - containerRect.top - 60
           });
        }
     }
  }, []);

  const handleMouseUp = () => {
     checkSelection();
     
     const sel = window.getSelection();
     
     // Save valid selection for AI insertion
     if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
        lastSelectionRef.current = sel.getRangeAt(0).cloneRange();
     }

     // Auto-quote to Chatbot
     if (sel && !sel.isCollapsed) {
        onAskAI(sel.toString());
     } else {
        // Clear quote if clicked without selection
        window.dispatchEvent(new Event("ai-quote-clear"));
        
        // Handle Side Menu Positioning (Click anywhere)
        if (editorRef.current && sel && sel.rangeCount > 0) {
           const range = sel.getRangeAt(0);
           const rect = range.getBoundingClientRect();
           const containerRect = containerRef.current?.getBoundingClientRect();
           if (containerRect) {
              // Calculate left position based on editor padding
              const computedStyle = window.getComputedStyle(editorRef.current);
              const paddingLeftVal = parseFloat(computedStyle.paddingLeft);
              const paddingLeft = isNaN(paddingLeftVal) ? 0 : paddingLeftVal;
              
              setSideMenuPosition({ 
                 top: rect.top - containerRect.top,
                 left: Math.max(16, paddingLeft - 50) // Ensure it doesn't go off-screen (min 16px)
              });
              setShowSideMenu(true);
              setShowInlineAi(false);
           }
        }
     }
  };

  // -- Formatting --
  const execCmd = (cmd: string, val?: string) => {
     // Prevent focus loss when clicking toolbar buttons
     document.execCommand(cmd, false, val);
     if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // -- AI Streaming Handler --
  useEffect(() => {
     const handleStreamStart = (e: any) => {
        const mode = e.detail?.mode;
        if (mode) {
           setStreamMode(mode);
           // If append mode, clear selection to ensure it appends
           if (mode === 'append' && editorRef.current) {
               // We will handle cursor movement in the first chunk or here?
               // Let's do it here to be safe
               const range = document.createRange();
               range.selectNodeContents(editorRef.current);
               range.collapse(false);
               const sel = window.getSelection();
               sel?.removeAllRanges();
               sel?.addRange(range);
           }
        }
     };

     const handleStreamChunk = (e: any) => {
        const chunk = e.detail?.chunk;
        if (!chunk || !editorRef.current) return;

        isStreamingRef.current = true;
        editorRef.current.focus();

        // Handle Modes
        if (streamMode === 'replace') {
           if (!hasReplacedRef.current) {
               // First chunk: delete selected range
               if (savedRange) {
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(savedRange);
                  document.execCommand('delete');
               }
               hasReplacedRef.current = true;
           }
           document.execCommand('insertText', false, chunk);
        } 
        else if (streamMode === 'insert') {
           if (!hasReplacedRef.current) {
              // Restore cursor position once
              if (savedRange) {
                 const sel = window.getSelection();
                 sel?.removeAllRanges();
                 sel?.addRange(savedRange);
                 sel?.collapseToEnd(); // Ensure we are at end of range (cursor)
              }
              hasReplacedRef.current = true;
           }
           document.execCommand('insertText', false, chunk);
        }
        else {
           // Append mode (default fallback)
           // Move cursor to end
           const range = document.createRange();
           range.selectNodeContents(editorRef.current);
           range.collapse(false);
           const sel = window.getSelection();
           sel?.removeAllRanges();
           sel?.addRange(range);
           document.execCommand('insertText', false, chunk);
        }
        
        // Auto-scroll
        editorRef.current.scrollTop = editorRef.current.scrollHeight;
     };

     const handleAiComplete = () => {
        isStreamingRef.current = false;
        hasReplacedRef.current = false;
        if (editorRef.current) onChange(editorRef.current.innerHTML);
        refreshAiRate();
     };

     window.addEventListener("ai-stream-start", handleStreamStart);
     window.addEventListener("ai-stream-chunk", handleStreamChunk);
     window.addEventListener("ai-content-generated", handleAiComplete);
     
     return () => {
        window.removeEventListener("ai-stream-start", handleStreamStart);
        window.removeEventListener("ai-stream-chunk", handleStreamChunk);
        window.removeEventListener("ai-content-generated", handleAiComplete);
     };
  }, [streamMode, savedRange]);

  // -- AI Actions --
  const triggerAi = (mode: 'insert' | 'replace' | 'append', prompt: string) => {
     // Save current selection/cursor
     let rangeToSave = null;
     const sel = window.getSelection();
     
     // If we have a live selection in the editor, use it
     if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
        rangeToSave = sel.getRangeAt(0).cloneRange();
     } 
     // Otherwise fallback to last known position
     else if (lastSelectionRef.current) {
        rangeToSave = lastSelectionRef.current.cloneRange();
     }

     if (rangeToSave) {
        setSavedRange(rangeToSave);
     }
     
     setStreamMode(mode);
     hasReplacedRef.current = false; // Reset flag
     onAIRequest(prompt, mode);
  };

  const handleAiEditAction = (action: string) => {
     if (!selection) return;
     triggerAi('replace', `${action}: ${selection.text}`);
     setShowAiEditMenu(false);
     setSelection(null);
  };
  
  const handleInlineAiSubmit = () => {
     if (!aiPrompt.trim()) return;
     triggerAi('insert', aiPrompt);
     setShowInlineAi(false);
     setAiPrompt("");
  };

  const refreshAiRate = () => {
     if (!content) return;
     setIsAiRateLoading(true);
     setTimeout(() => {
        const mockRate = Math.min(100, Math.floor(Math.random() * 20) + (content.length % 80));
        setAiRate(mockRate);
        setIsAiRateLoading(false);
     }, 800);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
         editorRef.current?.focus();
         document.execCommand('insertText', false, text);
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const hasContent = content && content !== "<br>"; // ContentEditable often leaves <br>

  return (
    <div className="flex-1 flex flex-col h-full relative bg-[#17171A] overflow-hidden">
      
      {/* AI Creation Modal (Legacy) */}
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
                    triggerAi('append', aiPrompt); // Modal defaults to append or insert? Let's say insert at cursor if range exists
                    setShowAiModal(false);
                    setAiPrompt("");
                  }
                }}
                placeholder="e.g. Write an outline for an essay about climate change..."
                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white resize-none outline-none focus:border-purple-500/50"
              />
              <div className="flex justify-end gap-3 mt-4">
                 <button onClick={() => setShowAiModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                 <button 
                   onClick={() => {
                      triggerAi('append', aiPrompt);
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

      {/* Empty State */}
      {!hasContent && (
        <div className="flex-1 flex flex-col items-center p-8 animate-in fade-in duration-500 z-10 absolute inset-0 pointer-events-none pt-36">
          <div className="w-full max-w-3xl mb-8 text-center pointer-events-auto">
             <div className="text-4xl font-bold text-gray-300 tracking-tight leading-tight">
               Start typing or insert using <span className="text-gray-500">/</span>
             </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl pointer-events-auto">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button onClick={handlePaste} className="group flex flex-col items-center gap-3 p-6 bg-[#2C2C3A] hover:bg-[#363645] border border-white/5 hover:border-white/10 rounded-2xl transition-all shadow-xl hover:shadow-2xl w-40 h-40 justify-center">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors"><Copy className="w-8 h-8 text-gray-300" /></div>
                <span className="text-sm font-bold text-white">Paste Text</span>
              </button>
              <button className="group flex flex-col items-center gap-3 p-6 bg-[#2C2C3A] hover:bg-[#363645] border border-white/5 hover:border-white/10 rounded-2xl transition-all shadow-xl hover:shadow-2xl w-40 h-40 justify-center">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors"><Upload className="w-8 h-8 text-gray-300" /></div>
                <span className="text-sm font-bold text-white">Import File</span>
              </button>
              <button onClick={() => setShowAiModal(true)} className="group flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/10 rounded-2xl transition-all shadow-xl hover:shadow-purple-900/30 w-40 h-40 justify-center">
                <div className="p-3 bg-white/20 rounded-xl transition-colors"><Sparkles className="w-8 h-8 text-white" /></div>
                <span className="text-sm font-bold text-white">AI Creation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className={cn("absolute inset-0 flex flex-col transition-all duration-300", hasContent ? "z-20" : "z-0")}>
           {/* Editor Toolbar */}
           <div className={cn("absolute top-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 w-full max-w-2xl flex justify-center", !hasContent ? "opacity-0 -translate-y-10 pointer-events-none" : "opacity-100 translate-y-0")}>
              <div className="flex items-center justify-between px-2 py-2 bg-[#1F2024]/80 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl w-full">
                  <div className="flex items-center gap-2 pl-2">
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 cursor-pointer transition-colors group">
                        <FileText className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" /> 
                        <span className="text-gray-300 font-medium text-sm group-hover:text-white transition-colors">Untitled Document</span>
                     </div>
                     <div className="h-4 w-px bg-white/10" />
                     <div className="flex items-center gap-1">
                        <button onClick={onUndo} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><Undo className="w-4 h-4" /></button>
                        <button onClick={onRedo} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><Redo className="w-4 h-4" /></button>
                     </div>
                  </div>
                   <div className="flex items-center gap-2 pr-1">
                      <div className="px-3 py-1.5 rounded-full bg-black/20 border border-white/5 text-xs font-mono text-gray-500">
                         {editorRef.current?.innerText.split(/\s+/).filter(Boolean).length || 0} words
                      </div>
                      {hasContent && (
                         <div onClick={refreshAiRate} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all animate-in fade-in zoom-in duration-300 cursor-pointer hover:scale-105", aiRate < 30 ? "bg-green-500/10 text-green-400 border-green-500/20" : aiRate < 70 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                           {isAiRateLoading ? <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> : aiRate < 30 ? <ShieldCheck className="w-3.5 h-3.5" /> : aiRate < 70 ? <AlertTriangle className="w-3.5 h-3.5" /> : <AlertOctagon className="w-3.5 h-3.5" />}
                           <span>{aiRate}% AI</span>
                         </div>
                      )}
                      <div className="relative">
                         <button onClick={() => setShowDocMenu(!showDocMenu)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                         {showDocMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1F2024]/95 backdrop-blur border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 z-50 p-1">
                                  <button className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-xl text-sm text-gray-300 flex items-center gap-3 transition-colors"><Upload className="w-4 h-4" /> Import File</button>
                                  <button className="w-full text-left px-3 py-2.5 hover:bg-white/5 rounded-xl text-sm text-gray-300 flex items-center gap-3 transition-colors"><Download className="w-4 h-4" /> Export PDF</button>
                                  <div className="h-px bg-white/10 my-1 mx-2" />
                                  <button onClick={() => { setShowDocMenu(false); onDeleteDocument(); }} className="w-full text-left px-3 py-2.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-xl text-sm flex items-center gap-3 transition-colors"><Trash2 className="w-4 h-4" /> Delete</button>
                            </div>
                         )}
                      </div>
                   </div>
               </div>
           </div>

           {/* ContentEditable Editor */}
           <div 
             className="flex-1 overflow-hidden relative z-10 cursor-text" 
             ref={containerRef}
             onClick={(e) => {
                if (e.target === containerRef.current) {
                   editorRef.current?.focus();
                }
             }}
           >
              <div 
                 ref={editorRef}
                 contentEditable
                 onInput={handleInput}
                 onMouseUp={handleMouseUp}
                 onKeyUp={handleMouseUp}
                 className="w-full h-full min-h-[calc(100vh-200px)] bg-transparent border-none outline-none text-lg leading-loose text-gray-200 resize-none font-serif focus:ring-0 cursor-text overflow-y-auto custom-scrollbar px-12 md:px-24 lg:px-[20%] pt-36 pb-32"
                 spellCheck={false}
              />

                {/* Floating Selection Toolbar */}
                {selection && toolbarPosition && (
                   <div 
                      className="absolute z-50 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
                      style={{ left: toolbarPosition.x, top: toolbarPosition.y }}
                   >
                      <div className="bg-[#2C2C3A] border border-white/10 rounded-xl shadow-2xl p-1.5 flex items-center gap-1 mb-2">
                         <button onClick={() => setShowAiEditMenu(!showAiEditMenu)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white relative group" title="AI Edit">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                         </button>
                         <div className="w-px h-4 bg-white/10 mx-1" />
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Bold"><Bold className="w-4 h-4" /></button>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Italic"><Italic className="w-4 h-4" /></button>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Underline"><Underline className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-white/10 mx-1" />
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', 'H1'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Heading 1"><Heading1 className="w-4 h-4" /></button>
                        <button onMouseDown={(e) => { e.preventDefault(); execCmd('formatBlock', 'H2'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
                     </div>

                      {/* AI Edit Sub-menu */}
                      {showAiEditMenu && (
                         <div className="absolute top-full mt-2 w-48 bg-[#1F2024] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2">
                            <div className="p-1">
                               <button onClick={() => handleAiEditAction('Rewrite')} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" /> Rewrite</button>
                               <button onClick={() => handleAiEditAction('Make it human')} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2"><Smile className="w-3.5 h-3.5" /> Humanize</button>
                               <button onClick={() => handleAiEditAction('Shorten')} className="w-full text-left px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-gray-300 flex items-center gap-2"><Scissors className="w-3.5 h-3.5" /> Shorten</button>
                            </div>
                         </div>
                      )}
                   </div>
                )}

                {/* Side "+" Menu */}
                {showSideMenu && sideMenuPosition && !selection && !showInlineAi && (
                   <div className="absolute z-40 animate-in fade-in duration-300 side-menu-btn" style={{ top: sideMenuPosition.top, left: sideMenuPosition.left }}>
                      <button onClick={() => setShowInlineAi(true)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all shadow-lg"><Plus className="w-5 h-5" /></button>
                   </div>
                )}
                
                {/* Inline AI Dialog */}
                {showInlineAi && sideMenuPosition && (
                   <div className="absolute z-50 animate-in slide-in-from-left-4 duration-300 w-full max-w-2xl inline-ai-dialog" style={{ top: sideMenuPosition.top - 10, left: sideMenuPosition.left + 40 }}>
                      <div className="bg-[#2C2C3A] border border-white/10 rounded-xl shadow-2xl p-2 flex items-center gap-2 w-full">
                         <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0"><Sparkles className="w-4 h-4 text-purple-400" /></div>
                         <input autoFocus value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleInlineAiSubmit(); }} placeholder="Tell AI what to write..." className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 h-8" />
                         <button onClick={() => { setAiPrompt("Continue writing"); handleInlineAiSubmit(); }} className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap"><Edit3 className="w-3 h-3" /> Continue writing</button>
                      </div>
                   </div>
                )}
           </div>
      </div>
    </div>
  );
}