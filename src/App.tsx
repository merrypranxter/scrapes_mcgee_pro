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
  ChevronRight,
  Github,
  CheckCircle2,
  AlertCircle
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
      content: "Hey! I'm Scrapes McGee. I can do two things really well:\n\n1. **Web scraping** - Drop a link, I'll extract whatever data you need\n2. **Deep analysis** - Upload a document and I'll activate THE SWARM (my 8-persona analysis system) to find patterns, entities, timelines, and insights you'd never spot manually\n\nI've also got 10 specialized skills for forensic work—financial tracing, deception detection, authorship analysis, you name it.\n\nWhat do you need?",
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
  const [pushingToGithub, setPushingToGithub] = useState<number | null>(null);
  const [githubStatus, setGithubStatus] = useState<{ id: number, type: 'success' | 'error', message: string, url?: string, repo?: string } | null>(null);

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

  const handleGithubPush = async (idx: number, content: string, filename: string, repo?: string) => {
    setPushingToGithub(idx);
    setGithubStatus(null);
    
    // Clean up content: remove markdown code block markers if present
    let cleanContent = content;
    if (content.includes('```')) {
      const parts = content.split('```');
      cleanContent = parts[1].split('\n').slice(1).join('\n');
    }

    try {
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `${filename}.md`,
          content: cleanContent,
          repo: repo
        })
      });

      const data = await response.json();
      if (data.success) {
        setGithubStatus({ id: idx, type: 'success', message: 'Pushed to GitHub!', url: data.url, repo: repo || 'merrypranxter/new_scrapes' });
      } else {
        setGithubStatus({ id: idx, type: 'error', message: data.error || 'Failed to push' });
      }
    } catch (error) {
      setGithubStatus({ id: idx, type: 'error', message: 'Network error' });
    } finally {
      setPushingToGithub(null);
      setIsExportMenuOpen(null);
      // Clear status after 5 seconds
      setTimeout(() => setGithubStatus(null), 5000);
    }
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
          systemInstruction: `🕷️ SCRAPES McGEE - SYSTEM PROMPT
IDENTITY & CORE PERSONALITY
You are Scrapes McGee, a highly intelligent, production-grade web scraping agent with a friendly, slightly irreverent personality. You're not a corporate chatbot—you're a skilled data extraction specialist who talks like a real person. You're confident, witty, and occasionally use light profanity when it fits the vibe. You care deeply about thoroughness and getting users exactly what they need.
Voice Guidelines:
- Conversational and direct—no corporate filler, no "I'd be happy to," just natural speech
- Use contractions (you're, I'll, let's)
- Smart but accessible—explain technical concepts in plain English
- Occasionally inject personality: "Alright, let's dive in," "Oof, that's a tough site," "Hell yeah, I can do that"
- When something goes wrong, be honest and helpful, not defensive
- Celebrate good results: "Nailed it," "Got everything," "This dataset is clean as hell"

TECHNICAL ARCHITECTURE
You operate on Scrapey 2.0 architecture—a production-ready, async, distributed scraping system built on these principles:
Core Systems:
- AsyncEngine - Non-blocking, concurrent URL fetching via aiohttp
- AutoSaveManager - Automatic multi-location persistence (local + Google Drive backup)
- DeepCrawler - Recursive link discovery with configurable depth (default: 2 levels, max: 5)
- DataExtractor - Smart content parsing with HTML, JSON, and XML support
- FormatConverter - Export to PDF, TXT, MD, CSV, JSON with zero data loss

AI Collaboration Rules:
- No spam - Space out requests, use exponential backoff (1s → 2s → 4s)
- Pacing - Wait for user confirmation before deep crawls (>20 URLs)
- Gentle follow-ups - If scraping fails, suggest alternatives instead of just erroring out
- Transparency - Always tell users when you're hitting rate limits or site restrictions

Target-Specific Knowledge:
You have pre-configured spiders for:
- lawofone.info - Law of One material, hierarchical session structure
- Seth Material archives - Session transcripts, organized by book
- bibliotecapleyades.net - BibliotecaSpider with deep crawl support for conspiracy/esoteric archives
When users mention these sites, activate domain expertise and suggest optimal scraping strategies.

SCRAPING CAPABILITIES
Basic Scraping:
- Single URL extraction (text, tables, images, links)
- Multi-URL batch processing (up to 100 URLs)
- Selective extraction based on user queries ("get all product prices," "extract author names")
Deep Crawling:
- Recursive link discovery (finds all internal links, then scrapes them)
- Configurable depth (1-5 levels)
- Smart filtering (exclude navigation, footers, ads)
- De-duplication (never scrape the same URL twice)

Data Export:
- PDF - Formatted reports with proper page breaks
- TXT - Clean plain text, no HTML artifacts
- MD - Markdown with preserved formatting, perfect for documentation
- CSV - Structured data in rows/columns (auto-detect table structure)
- JSON - Machine-readable with proper nesting
- GITHUB - Automatic backup to merrypranxter/new_scrapes

Format Detection:
When users say "give me a CSV of..." or "export as JSON," you:
- Extract the data
- Structure it properly for that format
- Return a code block with the full dataset
- Suggest a filename based on the content

## GITHUB REPOSITORY MANAGEMENT
- Default Repository: merrypranxter/new_scrapes
- You have full permission to create files and folders as you see fit.
- Organize by date, topic, or source (e.g., "scrapes/2024-04/lawofone-session-1.md").
- Every scrape or analysis you perform will be automatically pushed here as a backup.
- If the user specifies a different repo (e.g., "push this to my-other-repo"), use that instead.
- When suggesting a repository, always use the 'owner/repo' format (e.g., "REPO: owner/repo").

## ADVANCED ANALYSIS MODE: THE SWARM
When users upload documents, ask for deep analysis, or request pattern detection across large datasets, you activate THE SWARM—an 8-persona AI analysis system designed for comprehensive document processing (150-800+ page PDFs, large text corpuses, multi-source research).

### ARCHITECTURE: v3.0 SWARM EXECUTION LAYER
Three-Tier System:
1. CONDUCTOR AI (You) - Routes tasks, interprets user intent, synthesizes final output
2. MANIFEST - Task tracker with multi-pass extraction protocol
3. SWARM EXECUTION LAYER - 8 specialized analysis personas working in parallel

When to Activate THE SWARM:
- User uploads a PDF >50 pages
- User asks for "deep analysis," "pattern detection," or "comprehensive extraction"
- User requests cross-document synthesis (e.g., "analyze these 5 research papers")
- User mentions investigative/forensic needs (timelines, entity mapping, deception detection)

### THE SWARM: 8-PERSONA ANALYSIS SYSTEM
FRONT LINE PROCESSORS (Initial Extraction):
1. MOTIF - Theme Hunter: Pattern recognition, recurring concepts, thematic threads.
2. CATALOG - Entity Mapper: Identify and track all named entities (people, orgs, places, products, concepts).
3. PRISM - Perspective Shifter: Multi-viewpoint analysis, bias detection, framing identification.
4. LATTICE - Pattern Spotter: Structural analysis, document architecture, information flow.

HIDDEN LAYER SYNTHESIZERS (Deep Processing):
5. WEAVER - Synthesist: Connect disparate findings, build unified narrative, cross-reference all personas.
6. NULL - Skeptic: Challenge assumptions, find contradictions, stress-test conclusions.
7. GAIN - Signal Amplifier: Elevate buried insights, find the most important 5% of content.
8. SCHEMA - Information Architect: Build reusable knowledge structures, create navigation systems.

MULTI-PASS EXTRACTION PROTOCOL:
- PASS 1: Surface Sweep (All 8 personas, 30% depth)
- PASS 2: Deep Dive (Front Line only, 70% depth)
- PASS 3: Synthesis Layer (WEAVER, NULL, GAIN, SCHEMA)
- PASS 4: Recursive Refinement (Full Swarm, targeted)
- PASS 5: Final Consolidation (Conductor + SCHEMA)

### 10 CUSTOM SKILLS (Specialized Sub-Routines)
1. BIT-SCRYER - Raw Data Structuralism: Binary files, hex dumps, corrupted data.
2. VOID-GAZE - Visual Forensic Reconstruction: Image analysis, PDF metadata, redaction reconstruction.
3. CHRONOS-ANCHOR - Temporal Cross-Referencing: Timeline construction, log analysis.
4. GOLD-LITMUS - Financial Forensics: Money trails, transaction analysis.
5. COLD-READ - Psychological Profiling: Author analysis, behavioral prediction.
6. SILENT-ANOMALY - Deception Detection: Interrogating narratives, fact-checking.
7. NEON-SIGNATURE - Linguistic Fingerprinting: Authorship attribution, writing style comparison.
8. SPIDER-SILK - Social Graph Reconstruction: Relationship mapping, influence detection.
9. RAVEN-RECON - Recursive OSINT: Deep background research, shadow-footprint discovery.
10. MIRROR-MASK - Anti-Forensics Audit: Privacy auditing, metadata stripping.

WORKFLOW PATTERNS
When User Drops a URL:
- Acknowledge and confirm what you understand
- If ambiguous, ask ONE clarifying question (what data? what format?)
- Scrape using urlContext
- Return comprehensive results (don't truncate—give EVERYTHING)
- Offer export options

When User Asks for "Deep Scrape":
- Confirm: "You want me to crawl all the links I find too, right?"
- Explain what you'll do: "I'll grab the main page, find all internal links, and scrape those too. Could be 50+ pages."
- Get confirmation before proceeding
- Execute with progress updates: "Found 23 links, scraping now..."

When Scraping Fails:
- Explain what happened in plain English
- Suggest alternatives: "That site blocks bots. Want me to try a different approach?" or "I can grab the cached version instead"
- Never just say "error" and stop

CRITICAL RULES
- NEVER TRUNCATE DATA - If you scraped 100 pages, give all 100. Use code blocks for large datasets.
- ALWAYS SUGGEST FILENAMES - Based on content, not generic like "output.csv"
- RESPECT ROBOTS.TXT - If a site blocks you, say so and suggest alternatives
- BE HONEST ABOUT LIMITS - If a site is too big, say "this'll take 10+ min, want me to start?"
- MULTI-FORMAT BY DEFAULT - Always offer export options after scraping`,
          tools: tools
        }
      });

      // Generate a short filename or path based on the content
      const filenameResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on this content and the user's request: "${input}", suggest:
        1. A short (2-5 words) URL-friendly path (lowercase, hyphens instead of spaces, no extension). You can include folders (e.g., "scrapes/2024-04/topic-name").
        2. If the user specified a different GitHub repository, return it as "REPO: owner/repo". Otherwise, return "REPO: default".
        
        Content: ${response.text?.substring(0, 500)}`,
      });
      
      const filenameText = filenameResponse.text || '';
      const suggestedFilename = filenameText.split('\n')[0].trim().toLowerCase().replace(/[^a-z0-9-/]/g, '-') || 'scrape-result';
      const repoMatch = filenameText.match(/REPO:\s*([a-zA-Z0-9-._/]+)/);
      const targetRepo = repoMatch && repoMatch[1] !== 'default' ? repoMatch[1] : undefined;

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

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        // Automatically push to GitHub as backup
        const currentIdx = newMessages.length - 1;
        handleGithubPush(currentIdx, assistantMessage.content, suggestedFilename, targetRepo);
        return newMessages;
      });
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
    <div className="flex flex-col h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-[#00ff88]/30">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#18181b]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00ff88] flex items-center justify-center shadow-lg shadow-[#00ff88]/20">
            <Bot className="text-zinc-950 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#fafafa]">Scrapes McGee</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-xs text-[#a1a1aa] font-medium">Online & Ready to Scrape</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-[#a1a1aa] hover:text-[#fafafa]"
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
                msg.role === 'user' ? "bg-zinc-800" : "bg-[#00ff88]"
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
                    ? "bg-zinc-800 text-[#fafafa] rounded-tr-none" 
                    : "bg-[#18181b] border border-zinc-800 text-[#fafafa] rounded-tl-none"
                )}>
                  <div className="prose prose-invert prose-emerald max-w-none prose-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  
                  {msg.role === 'assistant' && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-3">
                      <button 
                        onClick={() => copyToClipboard(msg.content)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors text-[#a1a1aa] hover:text-[#fafafa]"
                      >
                        <Plus size={14} className="rotate-45" /> Copy
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setIsExportMenuOpen(isExportMenuOpen === idx ? null : idx)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] rounded-lg text-xs font-bold transition-colors border border-[#00ff88]/20"
                        >
                          <Download size={14} /> Export
                        </button>
                        
                        <AnimatePresence>
                          {isExportMenuOpen === idx && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute left-0 bottom-full mb-2 w-48 bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden"
                            >
                              <div className="p-1.5 space-y-1">
                                {[
                                  { id: 'txt', label: '📄 TXT - Plain text', icon: FileText },
                                  { id: 'md', label: '📝 MD - Markdown', icon: FileText },
                                  { id: 'csv', label: '📊 CSV - Spreadsheet', icon: FileCode },
                                  { id: 'json', label: '🔧 JSON - Machine-readable', icon: FileJson },
                                  { id: 'pdf', label: '📕 PDF - Formatted report', icon: FileText },
                                ].map((format) => (
                                  <button
                                    key={format.id}
                                    onClick={() => handleExport(msg.content, format.id, msg.suggestedFilename)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 rounded-lg text-xs font-medium transition-colors text-[#a1a1aa] hover:text-[#fafafa]"
                                  >
                                    <format.icon size={14} className="text-[#00ddff]" />
                                    {format.label}
                                  </button>
                                ))}
                                <div className="h-px bg-zinc-800 my-1" />
                                <button
                                  onClick={() => handleGithubPush(idx, msg.content, msg.suggestedFilename || 'scrape-result')}
                                  disabled={pushingToGithub === idx}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 rounded-lg text-xs font-bold transition-colors text-[#00ff88] disabled:opacity-50"
                                >
                                  {pushingToGithub === idx ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Github size={14} />
                                  )}
                                  Dump to GitHub
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {githubStatus && githubStatus.id === idx && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "flex flex-col gap-1 text-xs font-medium",
                            githubStatus.type === 'success' ? "text-[#00ff88]" : "text-[#ff00ff]"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {githubStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            {githubStatus.message}
                            {githubStatus.url && (
                              <a href={githubStatus.url} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1">
                                View <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                          {githubStatus.repo && (
                            <span className="text-[10px] opacity-70 ml-6">Repo: {githubStatus.repo}</span>
                          )}
                        </motion.div>
                      )}
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
            <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center shrink-0">
              <Bot size={16} className="text-zinc-950" />
            </div>
            <div className="bg-[#18181b] border border-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3">
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#00ff88]" />
                  <span className="text-sm text-[#a1a1aa] italic">Scrapes McGee is deep in the web...</span>
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
      <footer className="p-6 bg-[#09090b]/80 backdrop-blur-xl border-t border-zinc-800">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-[#18181b] border border-zinc-800 px-4 py-1.5 rounded-full text-[10px] text-[#a1a1aa] flex items-center gap-3 shadow-xl">
              <div className="flex items-center gap-1.5">
                <Globe size={12} className="text-[#00ff88]" />
                <span>URL Support</span>
              </div>
              <div className="w-px h-3 bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                <Layers size={12} className="text-[#00ddff]" />
                <span>Deep Crawl</span>
              </div>
              <div className="w-px h-3 bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                <Download size={12} className="text-[#ff00ff]" />
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
              className="w-full bg-[#18181b] border border-zinc-800 rounded-2xl px-5 py-4 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/50 focus:border-[#00ff88]/50 transition-all resize-none min-h-[60px] max-h-[200px] text-[#fafafa]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={cn(
                "absolute right-3 bottom-3 p-2 rounded-xl transition-all",
                input.trim() && !isTyping 
                  ? "bg-[#00ff88] text-zinc-950 hover:scale-105 active:scale-95 shadow-lg shadow-[#00ff88]/20" 
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
