import React from 'react';
import { Shield, Sparkles, ExternalLink } from 'lucide-react';

interface FooterProps {
  onReplayIntro: () => void;
  isDark: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onReplayIntro, isDark }) => {
  return (
    <footer className="mt-20 border-t border-slate-200/60 dark:border-white/10 py-12 transition-colors relative z-10 bg-white/40 dark:bg-black/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left branding */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400 shadow-[0_0_8px_rgba(255,42,133,0.8)]" />
            <span className="font-display text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white">
              FABRICA
            </span>
            <span className="text-xs text-slate-500 font-sans">
              by <a href="https://lonewolf-2077.github.io/App/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition-colors font-medium underline underline-offset-2">LoneWolf Studio</a>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md font-light">
            Open-source ExtendScripts, design tokens, and web utilities. Built and optimized for seamless GitHub Pages deployment.
          </p>
        </div>

        {/* Center / Right links & actions */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500 dark:text-slate-400">
          <a
            href="https://lonewolf-2077.github.io/App/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 transition-colors flex items-center gap-1.5 font-medium"
          >
            <span>LoneWolf App</span>
            <ExternalLink size={12} />
          </a>

          <span aria-hidden="true" className="text-slate-300 dark:text-white/15">·</span>

          <button
            onClick={onReplayIntro}
            className="hover:text-pink-500 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <Sparkles size={13} className="text-pink-500" />
            <span>Replay Splash</span>
          </button>
          
          <span aria-hidden="true" className="text-slate-300 dark:text-white/15">·</span>

          <span className="flex items-center gap-1">
            <Shield size={12} />
            <span>MIT License</span>
          </span>

          <span aria-hidden="true" className="text-slate-300 dark:text-white/15">·</span>

          <span className="font-mono text-[11px] text-slate-400">
            GitHub Pages Ready
          </span>
        </div>

      </div>
    </footer>
  );
};
