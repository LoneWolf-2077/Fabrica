import React, { useState, useMemo, useRef } from 'react';
import {
  Download,
  Eye,
  FileCode,
  Check,
  Search,
  FolderOpen,
  Upload,
  Info,
  Sparkles,
  Layers,
  Terminal,
} from 'lucide-react';
import { DownloadItem } from '../data.ts';

interface DownloadsTabProps {
  downloads: DownloadItem[];
  onPreviewCode: (item: DownloadItem) => void;
  onDirectDownload: (item: DownloadItem) => void;
  onAddCustomScript?: (script: DownloadItem) => void;
  isDark: boolean;
}

export const DownloadsTab: React.FC<DownloadsTabProps> = ({
  downloads,
  onPreviewCode,
  onDirectDownload,
  onAddCustomScript,
  isDark,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showHowToUse, setShowHowToUse] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group Illustrator scripts specifically
  const illustratorScripts = useMemo(() => {
    return downloads.filter((d) => d.category === 'Adobe Illustrator Scripts' || d.filename.endsWith('.jsx'));
  }, [downloads]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    downloads.forEach((d) => set.add(d.category));
    return ['All', ...Array.from(set)];
  }, [downloads]);

  const filteredDownloads = useMemo(() => {
    return downloads.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.filename.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [downloads, selectedCategory, searchQuery]);

  const handleDownload = (item: DownloadItem) => {
    setDownloadingId(item.id);
    onDirectDownload(item);
    setTimeout(() => {
      setDownloadingId(null);
    }, 1500);
  };

  // Handle client-side file drop/upload for instant inspection
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || '';
        const nameMatch = content.match(/@name\s+([^\r\n]+)/i) || content.match(/@title\s+([^\r\n]+)/i);
        const descMatch = content.match(/@description\s+([^\r\n]+)/i);
        const versionMatch = content.match(/@version\s+([^\r\n]+)/i);

        const newScript: DownloadItem = {
          id: `custom-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
          filename: file.name,
          title: nameMatch ? nameMatch[1].trim() : file.name.replace(/\.[^/.]+$/, ''),
          description: descMatch
            ? descMatch[1].trim()
            : 'Custom uploaded script detected and verified for Adobe Illustrator.',
          category: 'Adobe Illustrator Scripts',
          version: versionMatch ? versionMatch[1].trim() : 'v1.0.0',
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.name.substring(file.name.lastIndexOf('.')) || '.jsx',
          updatedAt: 'Added just now',
          content,
        };

        if (onAddCustomScript) {
          onAddCustomScript(newScript);
        }
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-10">
      
      {/* =========================================================================
          ADOBE ILLUSTRATOR EXTENDSCRIPT AUTOMATION HUB
          ========================================================================= */}
      <section
        className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl transition-all duration-300 border backdrop-blur-md ${
          isDark
            ? 'bg-gradient-to-br from-[#0c1020] via-[#090d18] to-[#05070e] border-amber-500/25 shadow-2xl shadow-amber-950/20'
            : 'bg-gradient-to-br from-white via-amber-50/30 to-white border-amber-200 shadow-md'
        }`}
      >
        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/50 dark:border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FF9A00]/15 border border-[#FF9A00]/40 flex items-center justify-center font-display font-black text-[#FF9A00] text-lg shrink-0 shadow-lg shadow-amber-500/10">
                Ai
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                  <span className="font-semibold text-[#FF9A00]">Adobe Illustrator ExtendScripts</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                    {illustratorScripts.length} Auto-Detected
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide text-slate-900 dark:text-white">
                  Illustrator ExtendScript Automation Hub
                </h3>
              </div>
            </div>

            {/* Folder Location & Instructions button */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-sm">
                <FolderOpen size={13} className="text-[#FF9A00]" />
                <span className="select-all">src/scripts/illustrator/</span>
              </div>

              <button
                onClick={() => setShowHowToUse((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Info size={13} />
                <span>{showHowToUse ? 'Hide Run Guide' : 'How to Run in Illustrator'}</span>
              </button>
            </div>
          </div>

          {/* Quick Instructions Collapse */}
          {showHowToUse && (
            <div className="mt-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-slate-700 dark:text-slate-200 space-y-2.5">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={14} className="text-[#FF9A00]" />
                <span className="font-display uppercase tracking-wider text-sm font-bold">
                  How to run ExtendScripts (.jsx) in Adobe Illustrator:
                </span>
              </div>
              <ol className="list-decimal ml-5 space-y-1.5 leading-relaxed font-sans">
                <li>
                  <strong className="text-slate-900 dark:text-white">Instant One-Off Run:</strong> In Illustrator, go to{' '}
                  <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-black/60 font-mono text-[11px] text-[#FF9A00]">
                    File &gt; Scripts &gt; Other Script...
                  </code>{' '}
                  (or press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-black/60 font-mono text-[11px]">Cmd/Ctrl + F12</kbd>) and select your downloaded script.
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Permanent Menu Entry:</strong> Place the downloaded <code className="font-mono text-[#FF9A00]">.jsx</code> file inside your Illustrator Presets folder:{' '}
                  <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-black/60 font-mono text-[11px]">
                    /Adobe Illustrator [Year]/Presets/[Locale]/Scripts/
                  </code>. It will appear directly under the File &gt; Scripts menu!
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Add scripts to Fabrica:</strong> Simply place any new ExtendScript inside the repo's{' '}
                  <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-black/60 font-mono text-[11px] text-[#FF9A00]">
                    src/scripts/illustrator/
                  </code>{' '}
                  directory. Fabrica auto-detects and makes it downloadable immediately.
                </li>
              </ol>
            </div>
          )}

          {/* Grid of Auto-Detected Illustrator Scripts */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {illustratorScripts.map((script) => {
              const isDownloading = downloadingId === script.id;
              return (
                <div
                  key={script.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isDark
                      ? 'bg-black/40 hover:bg-black/60 border-white/10 hover:border-amber-500/50 shadow-lg'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-400 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF9A00]" />
                        {script.filename}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-[#FF9A00] font-semibold text-[10px]">
                          {script.fileType}
                        </span>
                        <span className="tabular-nums text-[11px]">{script.fileSize}</span>
                      </div>
                    </div>

                    <h4 className="font-display text-lg sm:text-xl font-bold uppercase text-slate-900 dark:text-white">
                      {script.title}
                    </h4>

                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
                      {script.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      {script.version}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPreviewCode(script)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => handleDownload(script)}
                        className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                          isDownloading
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 shadow-amber-500/20'
                        }`}
                      >
                        {isDownloading ? (
                          <>
                            <Check size={13} />
                            <span>Saved!</span>
                          </>
                        ) : (
                          <>
                            <Download size={13} />
                            <span>Download .jsx</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Drag & Drop Hotspot */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-6 p-4 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left cursor-pointer ${
              isDragging
                ? 'border-[#FF9A00] bg-amber-500/10'
                : 'border-slate-300 dark:border-white/15 hover:border-amber-500/50 hover:bg-slate-50/50 dark:hover:bg-white/5'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              accept=".jsx,.js,.txt"
              multiple
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-[#FF9A00] shrink-0">
                <Upload size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Drop custom ExtendScripts (.jsx, .js) here to inspect or test
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Or add permanently into <code className="font-mono text-[#FF9A00]">src/scripts/illustrator/</code> in the repository.
                </div>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0 border border-slate-300 dark:border-white/10">
              Browse Files
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          ALL DOWNLOADS MASTER LIST & FILTER BAR
          ========================================================================= */}
      <div className="space-y-6 pt-2">
        {/* Subtitle & Search / Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
                All Scripts, Presets &amp; Assets
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              POSIX shell utilities, W3C design tokens, CSS modern resets, and developer templates.
            </p>
          </div>

          {/* Live Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search scripts, files, or formats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-black/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Category Filter Bar in LoneWolf Style */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 w-fit max-w-full overflow-x-auto backdrop-blur-md">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-white/15 text-cyan-600 dark:text-cyan-300 shadow-sm border border-slate-200/80 dark:border-cyan-400/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Clean List View with High Legibility & Tabular Metrics */}
        {filteredDownloads.length > 0 ? (
          <div className="space-y-4">
            {filteredDownloads.map((item) => {
              const isDownloading = downloadingId === item.id;
              const isAi = item.category === 'Adobe Illustrator Scripts' || item.filename.endsWith('.jsx');
              return (
                <div
                  key={item.id}
                  className={`p-5 sm:p-6 rounded-2xl transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 backdrop-blur-md ${
                    isDark
                      ? 'bg-[#0a0e1c]/80 hover:bg-[#0f1428] border border-white/10 hover:border-cyan-400/40 shadow-xl hover:shadow-[0_4px_25px_rgba(0,240,255,0.1)]'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-500/40 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Left details */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-2xl border shrink-0 ${
                        isAi
                          ? 'bg-amber-500/10 border-amber-500/30 text-[#FF9A00]'
                          : 'bg-cyan-500/10 dark:bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
                      }`}
                    >
                      <FileCode size={22} />
                    </div>

                    <div>
                      {/* Unboxed Metadata Line */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5 font-mono">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{item.filename}</span>
                        <span aria-hidden="true">·</span>
                        <span className={isAi ? 'text-[#FF9A00] font-medium' : 'text-cyan-600 dark:text-cyan-400 font-medium'}>
                          {item.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{item.version}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{item.fileSize}</span>
                      </div>

                      {/* Title in Barlow Condensed */}
                      <h3 className="font-display text-lg sm:text-xl font-bold uppercase text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-sans font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/10 w-full md:w-auto justify-end">
                    <button
                      onClick={() => onPreviewCode(item)}
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/15 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Inspect</span>
                    </button>

                    <button
                      onClick={() => handleDownload(item)}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                        isDownloading
                          ? 'bg-emerald-600 text-white'
                          : isAi
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white shadow-cyan-500/20'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <Check size={14} />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          <span>Direct Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
            <p className="text-sm text-slate-500">No downloads found matching "{searchQuery}".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 text-xs text-cyan-500 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
