import React from 'react';
import { Sun, Moon, Sparkles, ExternalLink } from 'lucide-react';

export type ActiveTab = 'tools' | 'downloads' | 'guides';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onReplayIntro: () => void;
  counts: {
    tools: number;
    downloads: number;
    guides: number;
  };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isDark,
  onToggleTheme,
  onReplayIntro,
  counts,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full transition-colors border-b backdrop-blur-md bg-white/80 dark:bg-[#05070e]/85 border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        
        {/* Zone 1: Brand Wordmark in LoneWolf Style */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('tools')}
            className="group flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[1.5px] shadow-sm shadow-pink-500/20 group-hover:shadow-[0_0_15px_rgba(255,42,133,0.5)] transition-all">
              <div className="w-full h-full rounded-[6.5px] bg-[#05070e] flex items-center justify-center font-display font-extrabold text-white text-base tracking-tighter">
                F
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display text-2xl font-black tracking-wider uppercase text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-cyan-400 transition-all">
                  FABRICA
                </span>
                <span className="text-[10px] font-display uppercase tracking-widest px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-500/20 font-bold">
                  v1.0
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                by LoneWolf Studio
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Tabs */}
        <nav
          className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200/80 dark:border-white/10 backdrop-blur-md"
          role="tablist"
          aria-label="Fabrica Navigation"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'tools'}
            onClick={() => onTabChange('tools')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'tools'
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/15 dark:shadow-pink-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>Tools</span>
            <span className="text-[11px] font-mono opacity-60">({counts.tools})</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'downloads'}
            onClick={() => onTabChange('downloads')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'downloads'
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/15 dark:shadow-pink-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>Downloads</span>
            <span className="text-[11px] font-mono opacity-60">({counts.downloads})</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'guides'}
            onClick={() => onTabChange('guides')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'guides'
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm border border-slate-200/80 dark:border-white/15 dark:shadow-pink-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>Guides</span>
            <span className="text-[11px] font-mono opacity-60">({counts.guides})</span>
          </button>
        </nav>

        {/* Zone 3: LoneWolf Main App link, Intro Replay & Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <a
            href="https://lonewolf-2077.github.io/App/"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit LoneWolf Creative Studio Main Website"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500 hover:to-purple-600 text-pink-600 dark:text-pink-400 hover:text-white dark:hover:text-white border border-pink-500/30 hover:border-transparent transition-all shadow-sm"
          >
            <span>LoneWolf App</span>
            <ExternalLink size={12} />
          </a>

          <button
            onClick={onReplayIntro}
            title="Replay LoneWolf Intro Splash"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            <Sparkles size={13} className="text-pink-500" />
            <span>Intro</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-black/60 hover:border-pink-500/50 text-slate-700 dark:text-slate-200 hover:text-pink-500 dark:hover:text-pink-400 transition-all cursor-pointer shadow-sm"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun size={17} className="text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon size={17} className="text-purple-600 transition-transform hover:-rotate-12" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
