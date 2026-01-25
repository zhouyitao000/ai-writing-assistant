"use client";

import { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Sparkles, 
  PenTool, 
  User, 
  GraduationCap, 
  Settings2, 
  CheckCircle2, 
  Edit3, 
  ArrowRight,
  Upload,
  RefreshCw,
  Copy,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type Persona = "freshman" | "junior" | "grad";
type Tone = "simple" | "standard" | "academic";
type Mode = "generate" | "refine";

interface OutlineItem {
  id: string;
  title: string;
  content: string; // Brief description of what goes here
}

export default function Home() {
  // -- State --
  const [mode, setMode] = useState<Mode>("generate");
  const [persona, setPersona] = useState<Persona>("junior");
  const [tone, setTone] = useState<number>(50); // 0-100 slider
  const [topic, setTopic] = useState("");
  const [requirements, setRequirements] = useState("");
  const [draft, setDraft] = useState("");
  
  // Workflow State
  const [step, setStep] = useState<"input" | "outline" | "writing">("input");
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [essayContent, setEssayContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatInstruction, setChatInstruction] = useState("");
  const [isChatEditing, setIsChatEditing] = useState(false);

  // -- API Integration --
  // Use environment variable for API URL, fallback to relative path for local development
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ""; 


  const [aiRate, setAiRate] = useState<number | null>(null);

  const generateOutline = async () => {
    if (!topic) return;
    setIsStreaming(true);
    
    try {
      const response = await fetch(`${API_URL}/api/outline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          requirements,
          student_level: persona,
          tone
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      setOutline(data.outline);
      setStep("outline");
    } catch (error: any) {
      console.error("Error generating outline:", error);
      alert(`Error: ${error.message || "Unknown error"}. Is the backend running?`);
    } finally {
      setIsStreaming(false);
      // Mock detection rate for now, or fetch from backend if available
      setAiRate(Math.floor(Math.random() * 15) + 5); 
    }
  };

  const startWriting = async () => {
    setStep("writing");
    setIsStreaming(true);
    setEssayContent("");
    setAiRate(null);
    
    // Simulate streaming text
    const fullText = `Based on the outline regarding "${topic}", here is the essay drafted by a ${persona} student...\n\n` + 
      "Introduction\n" +
      `The concept of ${topic} has long been a subject of debate. From my perspective as a university student, it represents not just a theoretical framework but a practical challenge we face daily. ` +
      "While many scholars argue for a rigid interpretation, I believe we must look at the nuances.\n\n" +
      "Key Argument 1\n" +
      "Firstly, we observe that the traditional methods are becoming obsolete. For instance, in our recent lectures, we discussed how technology impacts this field. " +
      "It is fascinating to see how rapidly things change. The data suggests a shift that cannot be ignored.\n\n" +
      "Key Argument 2\n" +
      "On the other hand, there is value in history. We shouldn't throw the baby out with the bathwater. " +
      "My research into the archives showed that similar patterns occurred decades ago. This cyclical nature is often overlooked.\n\n" +
      "Conclusion\n" +
      "In conclusion, understanding ${topic} requires a balanced view. It is not black and white. " +
      "As I continue my studies, I hope to explore this further. This assignment has certainly opened my eyes to the complexities involved.";
      
    const chunks = fullText.split(" ");
    
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(r => setTimeout(r, 50 + Math.random() * 50)); // Random typing speed
      setEssayContent(prev => prev + (i === 0 ? "" : " ") + chunks[i]);
    }
    
    setIsStreaming(false);
    // Simulate AI detection check after generation
    setAiRate(Math.floor(Math.random() * 15) + 5); // Random 5-20% AI rate
  };

  const refineDraft = async () => {
    if (!draft) return;
    setStep("writing");
    setIsStreaming(true);
    setEssayContent("");
    setAiRate(null);
    
    const refinedText = `[Refined Version of Draft]\n\n(Requirements: ${requirements || "None"})\n\n${draft}\n\n(Note: The AI would polish this text to match the ${persona} persona with a tone level of ${tone}.)`;
    
    // Simple mock stream
    const chunks = refinedText.split(" ");
    for (let i = 0; i < chunks.length; i++) {
      await new Promise(r => setTimeout(r, 30));
      setEssayContent(prev => prev + (i === 0 ? "" : " ") + chunks[i]);
    }
    setIsStreaming(false);
    // Simulate AI detection check after generation
    setAiRate(Math.floor(Math.random() * 10) + 2); // Random 2-12% AI rate (Refine usually lower)
  };

  const handleChatEdit = async () => {
    if (!chatInstruction || !essayContent) return;
    
    setIsChatEditing(true);
    setEssayContent(""); // Clear current content to show streaming update, or keep it? 
    // UX decision: Clear it to show re-writing. Or maybe just show a loading state?
    // Let's clear it for now to reuse the streaming effect, but ideally we'd stream into a buffer.
    // Actually, to avoid flickering emptiness, let's just start streaming and replace.
    
    // Better UX: Keep content, maybe gray it out, then replace as stream comes in?
    // Simplest MVP: Clear and stream new version.
    setEssayContent(""); 
    setAiRate(null);

    try {
      const response = await fetch(`${API_URL}/api/chat-edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_content: essayContent,
          instruction: chatInstruction,
          student_level: persona,
          tone
        })
      });

      if (!response.ok || !response.body) throw new Error("Failed to edit essay");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setEssayContent(prev => prev + chunk);
      }
      
      setChatInstruction(""); // Clear input after success
    } catch (error) {
      console.error("Error editing essay:", error);
      alert("Failed to edit essay.");
    } finally {
      setIsChatEditing(false);
      setAiRate(Math.floor(Math.random() * 10) + 2);
    }
  };

  // -- Render Components --

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 overflow-hidden font-sans">
      
      {/* LEFT SIDEBAR: CONFIGURATION */}
      <aside className="w-[400px] flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full shadow-sm z-10">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold flex items-center gap-2 text-indigo-600">
            <GraduationCap className="w-6 h-6" />
            Ghostwriter <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">MVP</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your personalized assignment assistant.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Mode Switcher */}
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => { setMode("generate"); setStep("input"); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                mode === "generate" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Sparkles className="w-4 h-4" /> Generate
            </button>
            <button
              onClick={() => { setMode("refine"); setStep("input"); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2",
                mode === "refine" ? "bg-white shadow-sm text-indigo-600" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <RefreshCw className="w-4 h-4" /> Refine
            </button>
          </div>

          {/* Persona Config */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> Student Persona
            </h2>
            
            <div className="grid grid-cols-3 gap-2">
              {(["freshman", "junior", "grad"] as Persona[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={cn(
                    "px-3 py-2 text-sm border rounded-lg capitalize transition-colors",
                    persona === p 
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600" 
                      : "border-gray-200 hover:border-indigo-300 text-gray-600"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Casual (C-)</span>
                <span>Smart (A+)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={tone}
                onChange={(e) => setTone(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <p className="text-xs text-center text-indigo-600 font-medium">
                Current Tone: {tone < 30 ? "Relaxed & Simple" : tone > 70 ? "Formal & Academic" : "Standard Student"}
              </p>
            </div>
          </section>

          {/* Task Input */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Task Details
            </h2>

            {mode === "generate" ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Assignment Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Reflection on '100 Years of Solitude'"
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Specific Requirements</label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="e.g. Must mention the circular nature of time. Approx 800 words."
                    rows={4}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Refinement Requirements</label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="e.g. Make it sound more academic, fix grammar, but keep my original arguments."
                    rows={3}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Paste Your Draft</label>
                  <div className="relative">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Paste your rough draft here..."
                      rows={8}
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm resize-none"
                    />
                    <button className="absolute bottom-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 transition-colors">
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {mode === "generate" ? (
            <button
              onClick={generateOutline}
              disabled={!topic || isStreaming}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {isStreaming ? (
                <>Thinking...</>
              ) : (
                <>Create Outline <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          ) : (
            <button
              onClick={refineDraft}
              disabled={!draft || isStreaming}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {isStreaming ? <>Refining...</> : <>Start Refining <Sparkles className="w-4 h-4" /></>}
            </button>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN AREA: PREVIEW & WRITING */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header */}
        <header className="h-16 border-b border-gray-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
          <div className="flex items-center gap-4">
            {mode === "generate" ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className={cn("px-2 py-1 rounded", step === "input" ? "bg-gray-100 text-gray-900 font-medium" : "")}>1. Input</span>
                <ChevronRight className="w-4 h-4" />
                <span className={cn("px-2 py-1 rounded", step === "outline" ? "bg-indigo-50 text-indigo-700 font-medium" : "")}>2. Outline</span>
                <ChevronRight className="w-4 h-4" />
                <span className={cn("px-2 py-1 rounded", step === "writing" ? "bg-green-50 text-green-700 font-medium" : "")}>3. Essay</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className={cn("px-2 py-1 rounded", step === "input" ? "bg-gray-100 text-gray-900 font-medium" : "")}>1. Input & Refine</span>
                <ChevronRight className="w-4 h-4" />
                <span className={cn("px-2 py-1 rounded", step === "writing" ? "bg-green-50 text-green-700 font-medium" : "")}>2. Result</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Settings button removed as requested */}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-gray-50/50">
          <div className="w-full max-w-3xl bg-white min-h-[calc(100vh-10rem)] shadow-sm border border-gray-200 rounded-xl p-12 transition-all">
            
            {step === "input" && (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4 opacity-50">
                <PenTool className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium">Ready to start?</p>
                <p className="text-sm">Fill in the details on the left to begin your assignment.</p>
              </div>
            )}

            {step === "outline" && (
              <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-shrink-0">
                  <h2 className="text-2xl font-bold text-gray-900">Proposed Outline</h2>
                  <div className="text-sm text-gray-500">Review before generating</div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                  {outline.map((item, index) => (
                    <div key={item.id} className="group relative p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all bg-white">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold rounded-full text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {item.title}
                            <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 transition-opacity">
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{item.content}</p>
                        </div>
                        <button 
                          onClick={() => {
                            const newOutline = [...outline];
                            newOutline.splice(index, 1);
                            setOutline(newOutline);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => {
                      setOutline([...outline, { id: Date.now().toString(), title: "New Section", content: "Description..." }]);
                    }}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-indigo-300 hover:text-indigo-500 font-medium transition-all"
                  >
                    + Add Section
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-100 flex-shrink-0 bg-white z-10 sticky bottom-0">
                  <div className="flex justify-end">
                    <button
                      onClick={startWriting}
                      className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Confirm & Write Essay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === "writing" && (
              <div className="flex flex-col h-full relative">
                 {/* AI Rate Indicator - Top Right Absolute Position */}
                 {!isStreaming && aiRate !== null && (
                    <div className={cn(
                      "absolute top-0 right-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors shadow-sm animate-in fade-in zoom-in duration-300 z-10 bg-white",
                      aiRate < 20 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : aiRate < 50 
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-red-50 text-red-700 border-red-200"
                    )}>
                      {aiRate < 20 ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      <span>AI Rate: {aiRate}%</span>
                      <span className="opacity-80">
                        ({aiRate < 20 ? "Safe" : aiRate < 50 ? "Moderate" : "High Risk"})
                      </span>
                    </div>
                 )}

                 {/* Scrollable Content Area */}
                 <div className="flex-1 overflow-y-auto prose prose-lg max-w-none prose-indigo pt-12 pb-24 px-2">
                   {essayContent ? (
                      <div className="whitespace-pre-wrap font-serif leading-relaxed text-gray-800">
                        {essayContent}
                        {isStreaming && <span className="inline-block w-2 h-5 bg-indigo-500 ml-1 animate-pulse" />}
                      </div>
                   ) : (
                     <div className="flex items-center justify-center h-64 text-gray-400">
                       <span className="animate-pulse">Initializing Ghostwriter...</span>
                     </div>
                   )}
                   
                   {!isStreaming && essayContent && (
                     <div className="mt-12 pt-8 border-t border-gray-100 no-print">
                        {/* Action Buttons Section - Bottom Right Only */}
                        <div className="flex items-center justify-end gap-4">
                          <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all shadow-sm hover:shadow">
                            <Copy className="w-4 h-4" /> Copy Text
                          </button>
                          <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-md hover:shadow-lg shadow-indigo-200">
                            <Upload className="w-4 h-4 rotate-180" /> Export as PDF
                          </button>
                        </div>
                     </div>
                   )}
                 </div>
                 
                 {/* Chat Edit Floating Bar - Fixed at Bottom */}
                 {!isStreaming && essayContent && (
                   <div className="absolute bottom-4 left-0 right-0 mx-auto w-full max-w-2xl animate-in slide-in-from-bottom-4 fade-in duration-500 z-20 px-4">
                     <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-2 flex items-center gap-2 ring-1 ring-gray-100">
                       <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                         <MessageSquare className="w-5 h-5" />
                       </div>
                       <input
                         type="text"
                         value={chatInstruction}
                         onChange={(e) => setChatInstruction(e.target.value)}
                         onKeyDown={(e) => e.key === "Enter" && !isChatEditing && handleChatEdit()}
                         placeholder="Tell AI how to improve this essay... (e.g. 'Make it more academic')"
                         className="flex-1 bg-transparent border-none outline-none text-sm px-2 text-gray-700 placeholder:text-gray-400"
                         disabled={isChatEditing}
                       />
                       <button
                         onClick={handleChatEdit}
                         disabled={!chatInstruction || isChatEditing}
                         className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-sm"
                       >
                         {isChatEditing ? (
                           <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                         ) : (
                           <Send className="w-4 h-4" />
                         )}
                       </button>
                     </div>
                   </div>
                 )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
