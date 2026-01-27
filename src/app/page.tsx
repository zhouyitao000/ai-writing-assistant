"use client";

import Navigation from "@/components/Navigation";
import { Copy, Upload, Shield, Lock, Globe, ChevronDown, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function HumanizerPage() {
  const [text, setText] = useState("");

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      <Navigation />

      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Humanize AI Text to
            </span>{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent inline-block">
              Engaging
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Transform robotic AI content into authentic, natural, and undetectable writing.
          </p>
        </div>

        {/* Main Interface */}
        <div className="w-full relative">
          {/* Glass Container */}
          <div className="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-white/10 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-[#17171A]/80 backdrop-blur-xl rounded-[2rem]" />
            
            <div className="relative z-10 flex flex-col h-[75vh] min-h-[600px]">
              
              {/* Toolbar */}
              <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
                <div className="flex items-center gap-6">
                  {/* Humanization Level */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                      <Shield className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
                      <button className="px-4 py-1.5 rounded-md bg-white text-black text-sm font-semibold shadow-lg">Lite</button>
                      <button className="px-4 py-1.5 rounded-md text-gray-400 text-sm font-medium hover:text-white transition-colors flex items-center gap-1">
                        Pro <Lock className="w-3 h-3" />
                      </button>
                      <button className="px-4 py-1.5 rounded-md text-gray-400 text-sm font-medium hover:text-white transition-colors flex items-center gap-1">
                        Ultra <Lock className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-white/10" />

                  {/* Writing Style */}
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-white text-xs font-semibold">Writing Style</div>
                      <div className="text-gray-500 text-[10px]">Select Format</div>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors text-sm">
                      General <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                  </div>

                  <div className="w-px h-8 bg-white/10" />

                  {/* Language */}
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="text-white text-xs font-semibold">Language</div>
                      <div className="text-gray-500 text-[10px]">Select Lang</div>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors text-sm min-w-[100px] justify-between">
                      Auto <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>
                  </div>
                </div>

                {/* Right Toolbar Actions */}
                <div className="flex items-center gap-2">
                   {/* Additional tools could go here */}
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 flex overflow-hidden">
                {/* Input Panel */}
                <div className="flex-1 relative border-r border-white/5 bg-[#17171A]/50">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your text here to humanize..."
                    className="w-full h-full bg-transparent border-none p-8 text-lg text-gray-200 placeholder:text-gray-600 resize-none focus:ring-0 outline-none leading-relaxed"
                  />
                  
                  {/* Center Actions */}
                  {!text && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-3 w-48">
                      <button className="flex items-center justify-center gap-2 py-3 px-4 bg-[#2C2C3A] hover:bg-[#363645] rounded-xl text-sm font-medium transition-colors border border-white/5 shadow-xl">
                        <Copy className="w-4 h-4" /> Paste Text
                      </button>
                      <button className="flex items-center justify-center gap-2 py-3 px-4 bg-[#2C2C3A] hover:bg-[#363645] rounded-xl text-sm font-medium transition-colors border border-white/5 shadow-xl">
                        <Upload className="w-4 h-4" /> Upload File
                      </button>
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div className="absolute bottom-6 right-6 flex items-center gap-3">
                    <div className="text-xs text-gray-500 font-mono">0 / 2000 Words</div>
                    <button className="px-6 py-2.5 bg-[#2C2C3A] text-gray-400 rounded-lg font-semibold text-sm cursor-not-allowed border border-white/5">Check</button>
                    <button className="px-6 py-2.5 bg-[#2C2C3A] text-gray-400 rounded-lg font-semibold text-sm cursor-not-allowed border border-white/5">Humanize</button>
                  </div>
                </div>

                {/* Output Panel */}
                <div className="flex-1 relative bg-[#0c0d0e]/30">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-700 pointer-events-none">
                    Your humanized content will appear here.
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
