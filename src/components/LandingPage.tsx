import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Save, Power, Terminal, Info, X, Github } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 font-mono overflow-hidden">
      {/* Background Matrix/Retro Grid Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px' 
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg bg-[#2a2a2a] border-4 border-[#4a4a4a] shadow-[8px_8px_0_0_#000]"
      >
        {/* Windows-style Header */}
        <div className="bg-[#1a1a1a] border-b-2 border-[#4a4a4a] px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-[#888]">boot_sequence.exe</span>
          </div>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-[#333] border border-[#555]" />
            <div className="w-3 h-3 bg-[#333] border border-[#555]" />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 md:p-12 flex flex-col items-center text-center">
          {/* Pixel-ish Icon Wrapper */}
          <div className="mb-8 relative">
             <div className="absolute -inset-2 bg-primary/20 blur-xl animate-pulse" />
             <div className="relative bg-black border-2 border-primary p-4 shadow-[4px_4px_0_0_#000]">
               <Save className="w-12 h-12 text-primary" />
             </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-heading uppercase tracking-tight mb-4 text-white">
            WELCOME TO <span className="text-primary">NONGKRONG.ZIP</span> <span className="text-xs align-top opacity-50">(v1.0)</span>
          </h1>

          <p className="text-sm text-[#aaa] max-w-[320px] mb-12 leading-relaxed text-center">
            Your automated portal to Jakarta’s hidden listening bars, underground gigs, and secret cafes.
          </p>

          <button
            id="start-button"
            onClick={onStart}
            className="group relative px-8 py-4 bg-[#333] border-t-2 border-l-2 border-[#666] border-b-2 border-r-2 border-black hover:bg-[#3a3a3a] active:bg-[#2a2a2a] active:translate-y-[2px] active:translate-x-[2px] active:border-t-black active:border-l-black active:border-b-[#444] active:border-r-[#444] transition-all duration-75 shadow-[4px_4px_0_0_#000] active:shadow-none"
          >
            <div className="flex items-center gap-3 font-bold text-white uppercase tracking-widest text-sm pointer-events-none">
              <Power size={18} className="text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
              <span>PRESS START TO BEGIN</span>
            </div>
            {/* Retro Scanline */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="h-1 w-full bg-primary/30 blur-[1px] absolute top-[-10%] animate-[scanline_2s_linear_infinite]" />
            </div>
          </button>

          <button
            onClick={() => setShowAbout(true)}
            className="mt-6 text-[10px] uppercase tracking-widest text-[#666] hover:text-primary transition-colors flex items-center gap-2"
          >
            <Info size={12} />
            <span>System Info</span>
          </button>

          <div className="mt-12 text-[9px] uppercase tracking-[0.2em] text-[#555] flex items-center gap-3">
             <span className="w-8 h-[1px] bg-[#333]" />
             SECURE CONNECTION ESTABLISHED
             <span className="w-8 h-[1px] bg-[#333]" />
          </div>
        </div>
      </motion.div>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-[#2a2a2a] border-4 border-[#4a4a4a] shadow-[8px_8px_0_0_#000]"
            >
              <div className="bg-primary/90 border-b-2 border-[#4a4a4a] px-3 py-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black">README.TXT</span>
                <button onClick={() => setShowAbout(false)} className="hover:bg-black/10 p-0.5 transition-colors">
                  <X size={14} className="text-black" />
                </button>
              </div>
              <div className="p-6 font-mono text-sm space-y-4">
                <div className="space-y-2 text-left">
                  <h3 className="text-primary font-bold uppercase tracking-tighter">Application Details</h3>
                  <p className="text-[#ccc] text-xs leading-relaxed">
                    NONGKRONG.ZIP is an automated explorer for Jakarta's high-fidelity nightlife. 
                    It maps out secret bars, listening rooms, and underground spots that define the city's hidden culture.
                  </p>
                </div>
                <div className="space-y-2 border-t border-[#444] pt-4 text-left">
                  <h3 className="text-primary font-bold uppercase tracking-tighter">Credits</h3>
                  <ul className="text-[#888] text-[10px] space-y-1 uppercase">
                    <li>Engine: VITE v5.x</li>
                    <li>Frontend: React + Tailwind</li>
                    <li>Maps: Google Maps Platform</li>
                    <li>
                      <a 
                        href="https://github.com/JoiceNapitupulu" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-primary transition-colors mt-2"
                      >
                        <Github size={10} />
                        GitHub: @JoiceNapitupulu
                      </a>
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => setShowAbout(false)}
                  className="w-full py-2 bg-[#333] border-t border-l border-[#555] border-b border-r border-black text-[10px] uppercase font-bold text-white hover:bg-[#444] active:bg-[#222] transition-colors"
                >
                  DISMISS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for the scanline animation since it's hard to do in pure tailwind without config */}
      <style>{`
        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
      `}</style>
    </div>
  );
}
