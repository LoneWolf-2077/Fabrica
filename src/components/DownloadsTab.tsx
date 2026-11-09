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
  Folder,
  ChevronRight,
  X,
} from 'lucide-react';
import { DownloadItem } from '../data.ts';

interface DownloadsTabProps {
  downloads: DownloadItem[];
  onPreviewCode: (item: DownloadItem) => void;
  onDirectDownload: (item: DownloadItem) => void;
  onAddCustomScript?: (script: DownloadItem) => void;
  isDark: boolean;
}

interface ScriptPack {
  name: string;
  type: 'Illustrator' | 'Python' | 'General';
  scripts: DownloadItem[];
  description: string;
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
  const [activePackModal, setActivePackModal] = useState<ScriptPack | null>(null);
  const [showHowTo, setShowHowTo] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group Illustrator scripts into packs based on their category
  const illustratorPacks = useMemo(() => {
    const aiScripts = downloads.filter((d) => d.category.includes('Artboard') || d.category.includes('Layer') || d.category === 'Adobe Illustrator Scripts' || d.filename.endsWith('.jsx'));
    const packsMap = new Map<string, DownloadItem[]>();

    aiScripts.forEach((script) => {
      let packKey = script.category.replace('AI Pack: ', '');
      if (packKey === 'Adobe Illustrator Scripts') packKey = 'General Illustrator Pack';
      if (!packsMap.has(packKey)) {
        packsMap.set(packKey, []);
      }
      packsMap.get(packKey)?.push(script);
    });

    const result: ScriptPack[] = [];
    packsMap.forEach((scripts, name) => {
      result.push({
        name,
        type: 'Illustrator',
        scripts,
        description: `Collection of ${scripts.length} automated ExtendScript utility tools for Adobe Illustrator workflows.`,
      });
    });
    return result;
  }, [downloads]);

  // Group Python scripts into packs based on their category
  const pythonPacks = useMemo(() => {
    const pyScripts = downloads.filter((d) => d.category === 'Python Scripts' || d.filename.endsWith('.py'));
    const packsMap = new Map<string, DownloadItem[]>();

    pyScripts.forEach((script) => {
      let packKey = script.category;
      if (packKey === 'Python Scripts') packKey = 'Python Utilities Pack';
      if (!packsMap.has(packKey)) {
        packsMap.set(packKey, []);
      }
      packsMap.get(packKey)?.push(script);
    });

    const result: ScriptPack[] = [];
    packsMap.forEach((scripts, name) => {
      result.push({
        name,
        type: 'Python',
        scripts,
        description: `Collection of ${scripts.length} zero-dependency Python 3 productivity scripts.`,
      });
    });
    return result;
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

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || '';
        const isPython = file.name.endsWith('.py') || file.name.endsWith('.pyw');
        const nameMatch = content.match(/@name\s+([^\r\n]+)/i) || content.match(/@title\s+([^\r\n]+)/i);
        const descMatch = content.match(/@description\s+([^\r\n]+)/i);
        const versionMatch = content.match(/@version\s+([^\r\n]+)/i);

        const newScript: DownloadItem = {
          id: `custom-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
          filename: file.name,
          title: nameMatch ? nameMatch[1].trim() : file.name.replace(/\.[^/.]+$/, ''),
          description: descMatch ? descMatch[1].trim() : 'Custom uploaded script.',
          category: isPython ? 'Python Utilities Pack' : 'General Illustrator Pack',
          version: versionMatch ? versionMatch[1].trim() : 'v1.0.0',
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.name.substring(file.name.lastIndexOf('.')) || (isPython ? '.py' : '.jsx'),
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
          SCRIPT PACKS HUB (Adobe Illustrator & Python Packs)
          ========================================================================= */}
      <section
        className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl transition-all duration-300 border backdrop-blur-md ${
          isDark
            ? 'bg-gradient-to-br from-[#0c1020] via-[#090d18] to-[#05070e] border-pink-500/25 shadow-2xl'
            : 'bg-gradient-to-br from-white via-pink-50/20 to-white border-pink-200 shadow-md'
        }`}
      >
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-pink-500/8 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/50 dark:border-white/10">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                <span className="font-semibold text-pink-500">Structured Script Packs</span>
                <span aria-hidden="true">·</span>
                <span>Click any pack card to view containing scripts</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wide text-slate-900 dark:text-white">
                GitHub Script Packs Hub
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-black/60 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-sm">
                <FolderOpen size={13} className="text-pink-500" />
                <span className="select-all">src/scripts/ [illustrator / python]</span>
              </div>

              <button
                onClick={() => setShowHowTo((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <Info size={13} />
                <span>{showHowTo ? 'Hide GitHub Sync Info' : 'GitHub Auto-Sync Info'}</span>
              </button>
            </div>
          </div>

          {showHowTo && (
            <div className="mt-4 p-5 rounded-2xl bg-pink-500/10 border border-pink-500/25 text-xs text-slate-700 dark:text-slate-200 space-y-2">
              <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles size={14} className="text-pink-500" />
                <span className="font-display uppercase tracking-wider text-sm font-bold">
                  How Script Packs Auto-Update on GitHub Pages:
                </span>
              </div>
              <p className="leading-relaxed">
                Any folder you create inside <code className="font-mono text-pink-400">src/scripts/illustrator/</code> or <code className="font-mono text-pink-400">src/scripts/python/</code> on GitHub automatically becomes a Script Pack card. When you push new scripts or folders, GitHub Actions automatically builds and publishes them live without manual editing!
              </p>
            </div>
          )}

          {/* Script Pack Cards Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...illustratorPacks, ...pythonPacks].map((pack) => {
              const isAi = pack.type === 'Illustrator';
              return (
                <div
                  key={pack.name}
                  onClick={() => setActivePackModal(pack)}
                  className={`group relative p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer backdrop-blur-md ${
                    isDark
                      ? 'bg-black/50 hover:bg-black/80 border-white/10 hover:border-pink-500/50 shadow-xl hover:shadow-[0_4px_25px_rgba(255,42,133,0.15)]'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-pink-500/50 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 ${
                        isAi
                          ? 'bg-amber-500/15 text-[#FF9A00] border border-amber-500/30'
                          : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      }`}>
                        {isAi ? 'Ai' : 'Py'}
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400">
                        {pack.scripts.length} script{pack.scripts.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold uppercase text-slate-900 dark:text-white group-hover:text-pink-500 transition-colors">
                      {pack.name}
                    </h3>

                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
                      {pack.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-pink-600 dark:text-pink-400 group-hover:translate-x-1 transition-transform">
                    <span>Open Pack ({pack.scripts.length} scripts)</span>
                    <ChevronRight size={16} />
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
                ? 'border-pink-500 bg-pink-500/10'
                : 'border-slate-300 dark:border-white/15 hover:border-pink-500/50 hover:bg-slate-50/50 dark:hover:bg-white/5'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              accept=".jsx,.js,.py,.pyw,.txt"
              multiple
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-500/15 text-pink-500 shrink-0">
                <Upload size={18} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Drop custom script files (.jsx, .py) here to test or inspect
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Or add permanently into subfolders in <code className="font-mono text-pink-400">src/scripts/</code> on GitHub.
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

        {filteredDownloads.length > 0 ? (
          <div className="space-y-4">
            {filteredDownloads.map((item) => {
              const isDownloading = downloadingId === item.id;
              const isAi = item.category.includes('Artboard') || item.category.includes('Layer') || item.filename.endsWith('.jsx');
              const isPy = item.category.includes('Python') || item.filename.endsWith('.py') || item.filename.endsWith('.pyw');
              return (
                <div
                  key={item.id}
                  className={`p-5 sm:p-6 rounded-2xl transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 backdrop-blur-md ${
                    isDark
                      ? 'bg-[#0a0e1c]/80 hover:bg-[#0f1428] border border-white/10 hover:border-cyan-400/40 shadow-xl'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-cyan-500/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-2xl border shrink-0 ${
                        isAi
                          ? 'bg-amber-500/10 border-amber-500/30 text-[#FF9A00]'
                          : isPy
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600'
                      }`}
                    >
                      <FileCode size={22} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5 font-mono">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{item.filename}</span>
                        <span aria-hidden="true">·</span>
                        <span className={isAi ? 'text-[#FF9A00] font-medium' : isPy ? 'text-cyan-400 font-medium' : 'text-cyan-600 font-medium'}>
                          {item.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{item.version}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{item.fileSize}</span>
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-bold uppercase text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed font-sans font-light">
                        {item.description}
                      </p>
                    </div>
                  </div>

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
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white'
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
          </div>
        )}
      </div>

      {/* =========================================================================
          SCRIPT PACK INSPECT MODAL (When a pack card is clicked)
          ========================================================================= */}
      {activePackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setActivePackModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 sm:p-8 transition-colors ${
              isDark
                ? 'bg-[#0a0e1c] text-slate-100 border border-white/15 shadow-2xl shadow-pink-950/30'
                : 'bg-white text-slate-900 border border-slate-200 shadow-2xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black text-base shrink-0 ${
                  activePackModal.type === 'Illustrator'
                    ? 'bg-amber-500/15 text-[#FF9A00] border border-amber-500/30'
                    : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {activePackModal.type === 'Illustrator' ? 'Ai' : 'Py'}
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-400">
                    Script Pack ({activePackModal.scripts.length} scripts)
                  </div>
                  <h3 className="font-display text-2xl font-black uppercase text-slate-900 dark:text-white">
                    {activePackModal.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActivePackModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Pack Description */}
            <p className="py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans">
              {activePackModal.description}
            </p>

            {/* Scripts inside this pack */}
            <div className="space-y-3 pt-2">
              {activePackModal.scripts.map((script) => {
                const isDownloading = downloadingId === script.id;
                return (
                  <div
                    key={script.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDark ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                        <span className="font-semibold text-slate-200">{script.filename}</span>
                        <span>·</span>
                        <span>{script.fileSize}</span>
                        <span>·</span>
                        <span>{script.version}</span>
                      </div>
                      <h4 className="font-display text-base font-bold uppercase text-slate-900 dark:text-white">
                        {script.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1 font-sans">
                        {script.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onPreviewCode(script)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-white/15 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => handleDownload(script)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm ${
                          isDownloading
                            ? 'bg-emerald-600 text-white'
                            : activePackModal.type === 'Illustrator'
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        }`}
                      >
                        {isDownloading ? 'Saved!' : 'Download'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
              <button
                onClick={() => setActivePackModal(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                Close Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
