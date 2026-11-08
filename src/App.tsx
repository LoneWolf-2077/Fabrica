/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen.tsx';
import { Header, ActiveTab } from './components/Header.tsx';
import { ToolsTab } from './components/ToolsTab.tsx';
import { DownloadsTab } from './components/DownloadsTab.tsx';
import { GuidesTab } from './components/GuidesTab.tsx';
import { ToolModal } from './components/ToolModal.tsx';
import { GuideReaderModal } from './components/GuideReaderModal.tsx';
import { CodePreviewModal } from './components/CodePreviewModal.tsx';
import { Footer } from './components/Footer.tsx';
import { TOOLS_DATA, DOWNLOADS_DATA, GUIDES_DATA, ToolItem, DownloadItem, GuideItem } from './data.ts';
import { getAutoDetectedIllustratorScripts } from './scripts/illustratorLoader.ts';
import { ExternalLink, Sparkles, Wrench, DownloadCloud, BookOpen } from 'lucide-react';

export default function App() {
  // Theme state: default dark mode with safe storage access
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fabrica_theme');
        if (saved) return saved === 'dark';
      } catch (e) {
        // Fallback if localStorage is inaccessible
      }
    }
    return true; // Default dark mode as specified
  });

  // Splash screen state
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Active tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('tools');

  // Modals state
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);
  const [selectedCodePreview, setSelectedCodePreview] = useState<DownloadItem | null>(null);

  // Custom uploaded scripts in current session
  const [customScripts, setCustomScripts] = useState<DownloadItem[]>([]);

  // Combined downloads including auto-detected Illustrator scripts from /src/scripts/illustrator/
  const allDownloads = React.useMemo(() => {
    const autoDetected = getAutoDetectedIllustratorScripts();
    return [...autoDetected, ...DOWNLOADS_DATA, ...customScripts];
  }, [customScripts]);

  // Synchronize theme with HTML document element and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#05070e';
      try {
        localStorage.setItem('fabrica_theme', 'dark');
      } catch (e) {
        // Ignore storage error
      }
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      try {
        localStorage.setItem('fabrica_theme', 'light');
      } catch (e) {
        // Ignore storage error
      }
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleReplayIntro = () => {
    setShowSplash(true);
  };

  // Direct file download execution via browser Blob
  const handleDirectDownload = (item: DownloadItem) => {
    const blob = new Blob([item.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen relative flex flex-col font-sans transition-colors duration-300 ${
        isDark
          ? 'bg-[#05070e] text-slate-100 sleek-viewport-bg'
          : 'bg-[#f8fafc] text-slate-900 sleek-viewport-bg-light'
      }`}
    >
      {/* Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none opacity-20 dark:opacity-30 z-0" />

      {/* Ambient glowing radial lights matching LoneWolf Creative Studio */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-pink-500/10 blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-48 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-400/8 blur-[130px] pointer-events-none z-0" />

      {/* Intro Splash Screen Overlay */}
      {showSplash && (
        <SplashScreen
          onDismiss={() => setShowSplash(false)}
          forceShow={showSplash}
        />
      )}

      {/* Primary Header Bar */}
      <div className="relative z-10">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onReplayIntro={handleReplayIntro}
          counts={{
            tools: TOOLS_DATA.length,
            downloads: allDownloads.length,
            guides: GUIDES_DATA.length,
          }}
        />
      </div>

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        
        {/* LoneWolf Studio Style Hero Banner */}
        <section className="mb-12 pt-8 sm:pt-12 pb-6 text-center flex flex-col items-center justify-center">
          
          {/* Top Brand Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-4 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-xs font-display uppercase tracking-widest text-slate-700 dark:text-slate-300 font-bold">
              LoneWolf Creative Tools &amp; Scripts
            </span>
          </div>

          {/* Main Title in Barlow Condensed with Vice Gradient */}
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 mb-3 drop-shadow-[0_0_35px_rgba(255,42,133,0.25)]">
            FABRICA
          </h1>

          {/* Tagline */}
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-light tracking-wide px-4">
            Production-grade Adobe Illustrator ExtendScripts, W3C design tokens, and web developer utilities engineered by LoneWolf.
          </p>

          {/* Quick Action Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              <Wrench size={13} />
              <span>Explore Utilities</span>
            </button>

            <button
              onClick={() => setActiveTab('downloads')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'downloads'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              <DownloadCloud size={13} />
              <span>Illustrator Scripts</span>
            </button>

            <button
              onClick={() => setActiveTab('guides')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'guides'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              <BookOpen size={13} />
              <span>Standards &amp; Guides</span>
            </button>

            <a
              href="https://lonewolf-2077.github.io/App/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-pink-500/30 text-pink-600 dark:text-pink-400 hover:text-pink-500 transition-all shadow-sm"
            >
              <span>LoneWolf Studio ↗</span>
            </a>
          </div>
        </section>

        {/* Dynamic Content Hub (Tab SPA) */}
        <div className="transition-opacity duration-200">
          {activeTab === 'tools' && (
            <ToolsTab
              tools={TOOLS_DATA}
              onOpenSandbox={(tool) => setSelectedTool(tool)}
              isDark={isDark}
            />
          )}

          {activeTab === 'downloads' && (
            <DownloadsTab
              downloads={allDownloads}
              onPreviewCode={(item) => setSelectedCodePreview(item)}
              onDirectDownload={handleDirectDownload}
              onAddCustomScript={(newScript) => {
                setCustomScripts((prev) => [newScript, ...prev]);
              }}
              isDark={isDark}
            />
          )}

          {activeTab === 'guides' && (
            <GuidesTab
              guides={GUIDES_DATA}
              onOpenGuide={(guide) => setSelectedGuide(guide)}
              isDark={isDark}
            />
          )}
        </div>
      </main>

      {/* Modals & Dialogs */}
      {selectedTool && (
        <ToolModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
          isDark={isDark}
        />
      )}

      {selectedGuide && (
        <GuideReaderModal
          guide={selectedGuide}
          onClose={() => setSelectedGuide(null)}
          isDark={isDark}
        />
      )}

      {selectedCodePreview && (
        <CodePreviewModal
          item={selectedCodePreview}
          onClose={() => setSelectedCodePreview(null)}
          isDark={isDark}
          onDirectDownload={handleDirectDownload}
        />
      )}

      {/* Footer in LoneWolf Style */}
      <Footer onReplayIntro={handleReplayIntro} isDark={isDark} />
    </div>
  );
}
