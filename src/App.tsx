import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  Send, 
  Bot, 
  User, 
  Download, 
  Globe, 
  Layers, 
  Loader2, 
  FileText, 
  FileCode, 
  FileJson,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { cn } from './lib/utils';
import { Message } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey there! I'm Scrapes McGee. I'm your friendly neighborhood web scraper. Just drop a link and tell me what you need, and I'll get to work. I can do deep crawls, specific data extractions, and export everything in whatever format you like. What's on your mind?",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const [isExportMenuOpen, setIsExportMenuOpen] = useState<number | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast here, but for now just a simple success state
    });
  };

  const handleExport = (content: string, format: string, filename: string = 'scrape_result') => {
    // Clean up content: remove markdown code block markers if present
    let cleanContent = content;
    if (content.includes('```')) {
      const parts = content.split('```');
      // Take the content inside the first code block if it exists
      cleanContent = parts[1].split('\n').slice(1).join('\n');
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      const splitText = doc.splitTextToSize(cleanContent, 180);
      let y = 10;
      const pageHeight = doc.internal.pageSize.height;
      
      for (let i = 0; i < splitText.length; i++) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 10;
        }
        doc.text(splitText[i], 10, y);
        y += 7; // Line height
      }
      doc.save(`${filename}.pdf`);
    } else {
      const mimeTypes: Record<string, string> = {
        txt: 'text/plain',
        md: 'text/markdown',
        csv: 'text/csv',
        json: 'application/json'
      };
      const blob = new Blob([cleanContent], { type: mimeTypes[format] || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    setIsExportMenuOpen(null);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || isScraping) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const urls = extractUrls(input);
    const isDeepCrawl = input.toLowerCase().includes('deep') || input.toLowerCase().includes('one deep') || input.toLowerCase().includes('links on it');
    
    try {
      let prompt = input;
      let tools: any[] = [];
      
      if (urls.length > 0) {
        setIsScraping(true);
        tools = [{ urlContext: {} }];
        
        if (isDeepCrawl) {
          // First pass to get links
          const linkResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Extract all unique internal links from these URLs: ${urls.join(', ')}. Return them as a simple list of URLs.`,
            config: { tools: [{ urlContext: {} }] }
          });
          
          const foundUrls = extractUrls(linkResponse.text || '');
          const allUrls = [...new Set([...urls, ...foundUrls])].slice(0, 20); // Limit to 20 for API
          
          prompt = `I have scraped these URLs: ${allUrls.join(', ')}. 
          Based on the user's request: "${input}", please extract the relevant information. 
          Provide a comprehensive, document-length report. Do not summarize; extract all relevant details.
          If they asked for a specific format (CSV, MD, JSON, TXT, PDF), provide the FULL data in that format.
          Be conversational and smart like Scrapes McGee.`;
        } else {
          prompt = `I have scraped these URLs: ${urls.join(', ')}. 
          Based on the user's request: "${input}", please extract the relevant information. 
          Provide a comprehensive, document-length report. Do not summarize; extract all relevant details.
          If they asked for a specific format (CSV, MD, JSON, TXT, PDF), provide the FULL data in that format.
          Be conversational and smart like Scrapes McGee.`;
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: "You are Scrapes McGee, a smart, friendly, and highly capable web scraping agent. You talk like a normal person but are clearly very intelligent about data extraction. You use urlContext to see the web. When a user asks to scrape, you provide the results with extreme detail and comprehensiveness. Do not truncate or summarize unless explicitly asked. If the content is long, provide a full document-length report. Use clear headings, tables, and lists to organize the data. If they ask for a format, you provide a code block with that format containing the full dataset. You are helpful and proactive, suggesting better ways to scrape if the user's request is vague. Your goal is to be the most thorough scraper possible.",
          tools: tools
        }
      });

      // Generate a short filename based on the content
      const filenameResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on this content, suggest a very short (2-4 words), URL-friendly filename (lowercase, hyphens instead of spaces, no extension). Content: ${response.text?.substring(0, 500)}`,
      });
      const suggestedFilename = filenameResponse.text?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'scrape-result';

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text || "I'm sorry, I couldn't process that request.",
        timestamp: Date.now(),
        suggestedFilename: suggestedFilename,
        metadata: {
          urls: urls,
          format: input.toLowerCase().includes('pdf') ? 'pdf' : 
                  input.toLowerCase().includes('csv') ? 'csv' : 
                  input.toLowerCase().includes('json') ? 'json' : 
                  input.toLowerCase().includes('md') ? 'md' : 'txt'
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Scraping error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Oof, I hit a snag while trying to scrape that. Web pages can be tricky sometimes! Could you double-check the link or try a different angle?",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
      setIsScraping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Bot className="text-zinc-950 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Scrapes McGee</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-zinc-400 font-medium">Online & Ready to Scrape</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-100"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-4xl mx-auto",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
                msg.role === 'user' ? "bg-zinc-800" : "bg-emerald-500"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-zinc-950" />}
              </div>
              
              <div className={cn(
                "flex flex-col gap-2 max-w-[85%]",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm group relative",
                  msg.role === 'user' 
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-none" 
                    : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
                )}>
                  <div className="prose prose-invert prose-emerald max-w-none prose-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  
                  {msg.role === 'assistant' && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-3">
                      <button 
                        onClick={() => copyToClipboard(msg.content)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors text-zinc-400 hover:text-zinc-100"
                      >
                        <Plus size={14} className="rotate-45" /> Copy
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setIsExportMenuOpen(isExportMenuOpen === idx ? null : idx)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-xs font-bold transition-colors border border-emerald-500/20"
                        >
                          <Download size={14} /> Export
                        </button>
                        
                        <AnimatePresence>
                          {isExportMenuOpen === idx && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute left-0 bottom-full mb-2 w-40 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden"
                            >
                              <div className="p-1.5 space-y-1">
                                {[
                                  { id: 'txt', label: 'Plain Text (.txt)', icon: FileText },
                                  { id: 'md', label: 'Markdown (.md)', icon: FileText },
                                  { id: 'csv', label: 'CSV (.csv)', icon: FileCode },
                                  { id: 'json', label: 'JSON (.json)', icon: FileJson },
                                  { id: 'pdf', label: 'PDF (.pdf)', icon: FileText },
                                ].map((format) => (
                                  <button
                                    key={format.id}
                                    onClick={() => handleExport(msg.content, format.id, msg.suggestedFilename)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 rounded-lg text-xs font-medium transition-colors text-zinc-400 hover:text-zinc-100"
                                  >
                                    <format.icon size={14} />
                                    {format.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 font-medium px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-zinc-950" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3">
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span className="text-sm text-zinc-400 italic">Scrapes McGee is deep in the web...</span>
                </>
              ) : (
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-6 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-zinc-900 border border-zinc-800 px-4 py-1.5 rounded-full text-[10px] text-zinc-400 flex items-center gap-3 shadow-xl">
              <div className="flex items-center gap-1.5">
                <Globe size={12} className="text-emerald-500" />
                <span>URL Support</span>
              </div>
              <div className="w-px h-3 bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                <Layers size={12} className="text-emerald-500" />
                <span>Deep Crawl</span>
              </div>
              <div className="w-px h-3 bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                <Download size={12} className="text-emerald-500" />
                <span>Multi-Format Export</span>
              </div>
            </div>
          </div>

          <div className="relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Paste a link or ask Scrapes McGee anything..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none min-h-[60px] max-h-[200px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={cn(
                "absolute right-3 bottom-3 p-2 rounded-xl transition-all",
                input.trim() && !isTyping 
                  ? "bg-emerald-500 text-zinc-950 hover:scale-105 active:scale-95" 
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              )}
            >
              <Send size={18} />
            </button>
          </div>
          <p className="mt-3 text-[10px] text-zinc-500 text-center">
            Scrapes McGee uses AI to extract data. Always verify sensitive information.
          </p>
        </div>
      </footer>
    </div>
  );
}
