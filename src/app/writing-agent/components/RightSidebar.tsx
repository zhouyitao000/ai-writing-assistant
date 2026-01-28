"use client";

import { useState, useRef, useEffect } from "react";
import { 
  User, 
  Sparkles, 
  Send, 
  Bot, 
  CheckCircle2, 
  Settings2,
  ChevronDown,
  ArrowRight,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "card" | "confirmation" | "quote";
  cardData?: {
    title: string;
    content: string;
  };
}

interface RightSidebarProps {
  onInsertContent: (content: string) => void;
  isOpen: boolean;
  onStreamContent?: (chunk: string) => void;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
}

export default function RightSidebar({ onInsertContent, isOpen, onStreamContent, messages, onMessagesChange }: RightSidebarProps) {
  // -- State --
  // messages state is now lifted up
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingQuote, setPendingQuote] = useState<string | null>(null); // New state for quote context
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Ref to track latest messages for event handlers without re-binding
  const messagesRef = useRef(messages);
  useEffect(() => {
     messagesRef.current = messages;
  }, [messages]);
  
  // Ref to track latest props to avoid re-binding listeners on every render
  const callbacksRef = useRef({ onMessagesChange, onStreamContent });
  useEffect(() => {
     callbacksRef.current = { onMessagesChange, onStreamContent };
  }, [onMessagesChange, onStreamContent]);

  // Config State
  const [step, setStep] = useState<"config" | "chat">("config");
  const [persona, setPersona] = useState("Junior");
  const [tone, setTone] = useState("Standard");
  const [generatedContent, setGeneratedContent] = useState("");

  // Scroll to bottom on new message or streaming update
  useEffect(() => {
    if (messagesEndRef.current) {
       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // Listen for external prompts
  useEffect(() => {
    const handleExternalPrompt = (e: any) => {
      const prompt = e.detail?.prompt;
      if (prompt) {
        if (step === "config") setStep("chat");
        // Trigger direct generation flow using ref to get latest messages
        // We define the logic here or call a stable handler. 
        // To be safe, let's inline the logic or use a ref-based handler to ensure we access latest props/state.
        executeDirectGeneration(prompt);
      }
    };
    window.addEventListener("ai-prompt-request", handleExternalPrompt);
    return () => window.removeEventListener("ai-prompt-request", handleExternalPrompt);
  }, [step, persona, tone]); // Add persona/tone so we get their latest values

  // Core Generation Logic (Ref-safe)
  const executeDirectGeneration = async (prompt: string) => {
     // 1. Add User Prompt
     const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: prompt,
     };
     
     // Use ref to get latest messages
     let newMessages = [...messagesRef.current, userMsg];
     callbacksRef.current.onMessagesChange(newMessages);
     
     setIsStreaming(true);

     // 2. Add "Generating..." message
     const generatingMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "Generating content directly to the editor..."
     };
     newMessages = [...newMessages, generatingMsg];
     callbacksRef.current.onMessagesChange(newMessages);

     // 3. Stream content to Editor (Virtual)
     const fullText = `[Direct Generation for "${prompt}"]\n\nThis content is being streamed directly to your document editor. It reflects the ${persona} persona and ${tone} tone you selected.`;
     const chunks = fullText.split(" ");
     
     for (let i = 0; i < chunks.length; i++) {
        await new Promise(r => setTimeout(r, 50));
        callbacksRef.current.onStreamContent?.((i === 0 ? "\n\n" : " ") + chunks[i]);
     }

     setIsStreaming(false);
     
     // 4. Show Completion Message
     const completeMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "✅ Content has been added to your document."
     };
     
     // Remove "Generating..." and add Complete
     // Need to fetch latest messages again? No, we are in async flow, but messages might have changed if user typed?
     // For safety, let's filter from messagesRef.current again?
     // But messagesRef.current might include new user messages.
     // Let's just filter the generatingMsg from the *current* ref state.
     
     const currentMsgs = messagesRef.current;
     const filtered = currentMsgs.filter(m => m.id !== generatingMsg.id);
     callbacksRef.current.onMessagesChange([...filtered, completeMsg]);
  };

  // Listen for quote requests
  useEffect(() => {
    const handleQuoteRequest = (e: any) => {
      const selectedText = e.detail?.text;
      if (selectedText) {
        if (step === "config") setStep("chat");
        setPendingQuote(selectedText);
      }
    };
    
    // NEW: Listen for clear quote event
    const handleClearQuote = () => {
       setPendingQuote(null);
    };

    window.addEventListener("ai-quote-request", handleQuoteRequest);
    window.addEventListener("ai-quote-clear", handleClearQuote);
    
    return () => {
       window.removeEventListener("ai-quote-request", handleQuoteRequest);
       window.removeEventListener("ai-quote-clear", handleClearQuote);
    };
  }, [step]);

  // -- Handlers --
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleStartChat = () => {
    setStep("chat");
    // Initial AI Message
    const initialMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: `I'm set to act as a **${persona}** student with a **${tone}** tone. What would you like to write today? You can ask me to generate an outline, a paragraph, or a full essay.`
    };
    onMessagesChange([initialMsg]);
  };

  const handleDirectGeneration = async (prompt: string) => {
     // 1. Add User Prompt
     const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: prompt,
     };
     
     // Use ref to get latest messages since we are in an event handler
     let newMessages = [...messagesRef.current, userMsg];
     onMessagesChange(newMessages);
     
     setIsStreaming(true);

     // 2. Add "Generating..." message
     const generatingMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "Generating content directly to the editor..."
     };
     newMessages = [...newMessages, generatingMsg];
     onMessagesChange(newMessages);

     // 3. Stream content to Editor (Virtual)
     const fullText = `[Direct Generation for "${prompt}"]\n\nThis content is being streamed directly to your document editor. It reflects the ${persona} persona and ${tone} tone you selected.`;
     const chunks = fullText.split(" ");
     
     for (let i = 0; i < chunks.length; i++) {
        await new Promise(r => setTimeout(r, 50));
        onStreamContent?.((i === 0 ? "\n\n" : " ") + chunks[i]);
     }

     setIsStreaming(false);
     
     // 4. Show Completion Message (No Confirmation Card)
     const completeMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: "✅ Content has been added to your document."
     };
     
     // Remove "Generating..." and add Complete
     newMessages = newMessages.filter(m => m.id !== generatingMsg.id);
     newMessages.push(completeMsg);
     onMessagesChange(newMessages);
  };

  const handleSendMessage = async (text: string = inputMessage) => {
    if (!text.trim()) return;
    
    // Switch to Chat if in Config
    if (step === "config") setStep("chat");

    // 1. Add User Message (Combine with quote if present)
    const finalContent = pendingQuote ? `> ${pendingQuote}\n\n${text}` : text;
    
    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: finalContent,
    };
    
    // Use ref to get latest messages
    let newMessages = [...messagesRef.current, userMsg];
    onMessagesChange(newMessages);
    
    setInputMessage("");
    setPendingQuote(null); // Clear quote
    setIsStreaming(true);

    // 2. Direct Streaming to Editor (Skip Chat Card)
    // Add "Generating..." indicator in chat
    const thinkingMsgId = generateId();
    const thinkingMsg: Message = {
       id: thinkingMsgId,
       role: "assistant",
       content: "Generating content directly to the editor..."
    };
    newMessages = [...newMessages, thinkingMsg];
    onMessagesChange(newMessages);

    // 3. Stream content to Editor (Virtual)
    const fullText = `\n\nThis content is being streamed directly to your document editor based on your request. It reflects the ${persona} persona and ${tone} tone you selected. The arguments are structured to be persuasive yet balanced.`;
    const chunks = fullText.split(" ");
    
    for (let i = 0; i < chunks.length; i++) {
       await new Promise(r => setTimeout(r, 50));
       onStreamContent?.((i === 0 ? "" : " ") + chunks[i]);
    }

    setIsStreaming(false);
    
    // Dispatch event to trigger AI Rate update
    window.dispatchEvent(new Event("ai-content-generated"));
    
    // 4. Show Completion Message (No Confirmation Needed per request)
    // Remove thinking message and show simple text
    newMessages = newMessages.filter(m => m.id !== thinkingMsgId);
    newMessages.push({
       id: generateId(),
       role: "assistant",
       content: "✅ Content has been added to your document."
    });
    onMessagesChange(newMessages);
  };

  const handleConfirm = (content: string) => {
     onInsertContent(content);
     // Add success message
     onMessagesChange([...messages, {
        id: generateId(),
        role: "assistant",
        content: "✅ Content added to document."
     }]);
  };

  if (!isOpen) return null;

  return (
    <aside className="w-[360px] flex-shrink-0 bg-[#17171A]/90 backdrop-blur-xl border-l border-white/5 flex flex-col h-full z-10 shadow-2xl">
      
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
        <div className="flex items-center gap-2 text-white font-bold text-lg">
          <Bot className="w-5 h-5 text-green-400" />
          Writing Agent
        </div>
        {step === "chat" && (
           <button onClick={() => setStep("config")} className="text-xs text-gray-400 hover:text-white">
              Reconfigure
           </button>
        )}
      </div>

      {/* MODE: CONFIGURATION */}
      {step === "config" && (
         <div className="flex-1 p-6 flex flex-col gap-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2 mt-4">
               <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                  <Sparkles className="w-8 h-8 text-green-400" />
               </div>
               <h2 className="text-xl font-bold text-white">Setup Your Assistant</h2>
               <p className="text-sm text-gray-400">Customize how AI writes for you.</p>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student Persona</label>
                  <div className="grid grid-cols-3 gap-2">
                     {["Freshman", "Junior", "Grad"].map(p => (
                        <button
                           key={p}
                           onClick={() => setPersona(p)}
                           className={cn(
                              "py-2.5 text-sm rounded-lg border transition-all font-medium",
                              persona === p 
                                 ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-900/20" 
                                 : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                           )}
                        >
                           {p}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tone Style</label>
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs text-gray-400 font-medium">
                        <span>Casual</span>
                        <span>Standard</span>
                        <span>Academic</span>
                     </div>
                     <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        step="1"
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        onChange={(e) => {
                           const val = parseInt(e.target.value);
                           setTone(val === 0 ? "Casual" : val === 1 ? "Standard" : "Academic");
                        }}
                     />
                     <div className="text-center text-sm text-green-400 font-bold mt-1">{tone}</div>
                  </div>
               </div>
            </div>

            <div className="mt-auto">
               <button 
                  onClick={handleStartChat}
                  className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all"
               >
                  Start Writing <ArrowRight className="w-4 h-4" />
               </button>
            </div>
         </div>
      )}

      {/* MODE: CHAT */}
      {step === "chat" && (
        <>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
             {messages.map((msg) => (
               <div key={msg.id} className={cn("flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2", msg.role === "user" ? "items-end" : "items-start")}>
                   
                   {msg.role === "assistant" && (
                     <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                           <Bot className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <span className="text-xs font-bold text-white">AI Agent</span>
                     </div>
                   )}

                   {/* Confirmation Card */}
                   {(msg.type === "confirmation" || msg.type === "quote") && msg.cardData ? (
                     <div className={cn(
                        "w-full border rounded-xl p-4 shadow-lg",
                        msg.type === "quote" ? "bg-white text-black border-gray-200" : "bg-[#2C2C3A] border-white/10 ring-1 ring-green-500/20"
                     )}>
                         <div className={cn("flex items-center justify-between mb-2 pb-2 border-b", msg.type === "quote" ? "border-gray-100" : "border-white/5")}>
                           <h4 className={cn("text-sm font-bold flex items-center gap-2", msg.type === "quote" ? "text-gray-800" : "text-white")}>
                             {msg.type === "quote" ? <Quote className="w-4 h-4 text-gray-400" /> : <CheckCircle2 className="w-4 h-4 text-green-400" />} 
                             {msg.cardData.title}
                           </h4>
                         </div>
                         <div className={cn(
                            "text-sm whitespace-pre-wrap leading-relaxed font-serif p-2 rounded-lg border",
                            msg.type === "quote" ? "bg-gray-50 border-gray-100 text-gray-600 italic" : "bg-black/20 border-white/5 text-gray-300 max-h-60 overflow-y-auto custom-scrollbar"
                         )}>
                           {msg.cardData.content}
                         </div>
                         
                         {/* Confirmation Buttons (Only for confirmation type) */}
                         {msg.type === "confirmation" && (
                           <div className="mt-3 flex gap-2">
                             <button 
                               onClick={() => handleConfirm(msg.cardData!.content)}
                               className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                             >
                                 Confirm & Insert
                             </button>
                             <button className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold rounded-lg transition-all border border-white/5">
                                 Reject
                             </button>
                           </div>
                         )}
                     </div>
                   ) : (
                     <div className={cn(
                       "max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                       msg.role === "user" 
                         ? "bg-[#2C2C3A] text-white rounded-tr-sm border border-white/5" 
                         : "text-gray-300 pl-0"
                     )}>
                       {msg.content}
                     </div>
                   )}
               </div>
             ))}
             
             {isStreaming && (
               <div className="flex items-center gap-2 pl-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150" />
               </div>
             )}
             <div ref={messagesEndRef} />
           </div>

           {/* Input Area */}
           <div className="p-4 bg-[#17171A] border-t border-white/5">
             <div className={cn("relative bg-black/40 border border-white/10 rounded-2xl p-1 focus-within:border-green-500/50 transition-colors", pendingQuote ? "rounded-t-sm" : "")}>
                 
                 {/* Quote Preview */}
                 {pendingQuote && (
                    <div className="mx-2 mt-2 mb-1 p-3 bg-[#2C2C3A] rounded-xl border border-white/5 flex items-start gap-3 relative group">
                       <div className="p-2 bg-white/5 rounded-lg">
                          <Quote className="w-4 h-4 text-gray-400" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-300 mb-0.5">Selected text</div>
                          <div className="text-xs text-gray-500 truncate">{pendingQuote}</div>
                       </div>
                       <button 
                         onClick={() => setPendingQuote(null)}
                         className="absolute top-1 right-1 p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                          <span className="sr-only">Remove quote</span>
                          &times;
                       </button>
                    </div>
                 )}

                 <textarea
                   value={inputMessage}
                   onChange={(e) => setInputMessage(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === "Enter" && !e.shiftKey) {
                       e.preventDefault();
                       handleSendMessage();
                     }
                   }}
                   placeholder="Describe what to write..."
                   rows={1}
                   className="w-full bg-transparent border-none outline-none text-sm px-3 py-3 text-white placeholder:text-gray-500 resize-none max-h-32 custom-scrollbar"
                   style={{ minHeight: "44px" }}
                 />
                 <div className="flex justify-between items-center px-2 pb-1">
                    <div className="flex gap-1"></div>
                    <button 
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isStreaming}
                      className="p-2 bg-green-600 hover:bg-green-500 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-900/20"
                    >
                       <ArrowRight className="w-4 h-4" />
                    </button>
                 </div>
             </div>
           </div>
        </>
      )}
    </aside>
  );
}
