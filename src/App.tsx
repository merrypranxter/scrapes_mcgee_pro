import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Zap } from 'lucide-react';
import ScraperMode from './components/scraper/ScraperMode';
import GlitchMode from './components/glitch/GlitchMode';
import { cn } from './lib/utils';

type Mode = 'scraper' | 'glitch';

export default function App() {
  const [mode, setMode] = useState<Mode>('scraper');

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Mode Toggle */}
      <div className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('scraper')}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                    mode === 'scraper'
                      ? "bg-[#00ff88] text-black shadow-lg shadow-[#00ff88]/20"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  <Globe size={16} />
                  SCRAPER MODE
                </button>
                <button
                  onClick={() => setMode('glitch')}
                  className={cn(
                    "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                    mode === 'glitch'
                      ? "bg-gradient-to-r from-[#00ff88] to-[#ff00ff] text-black shadow-lg"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  <Zap size={16} />
                  GLITCH MODE
                </button>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#00ff88] via-[#00ddff] to-[#ff00ff] bg-clip-text text-transparent">
                SCRAPES McGEE PRO
              </h1>
              <p className="text-xs text-zinc-500">Web Scraping + Video Glitching</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {mode === 'scraper' ? <ScraperMode /> : <GlitchMode />}
      </motion.div>
    </div>
  );
}
