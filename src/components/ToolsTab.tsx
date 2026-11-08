import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, Play, Sparkles } from 'lucide-react';
import { ToolItem } from '../data.ts';

interface ToolsTabProps {
  tools: ToolItem[];
  onOpenSandbox: (tool: ToolItem) => void;
  isDark: boolean;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({ tools, onOpenSandbox, isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    tools.forEach((t) => set.add(t.category));
    return ['All', ...Array.from(set)];
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCat = selectedCategory === 'All' || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.summary.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [tools, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Intro Subtitle & Search / Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
              Curated Utilities &amp; Sandboxes
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Vector path optimizers, color contrast auditors, glassmorphism labs, and code synthesizers.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search utilities by name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-black/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-500 dark:focus:border-pink-400 focus:ring-1 focus:ring-pink-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Segmented Filters in LoneWolf Style */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 w-fit max-w-full overflow-x-auto backdrop-blur-md">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-white/15 text-pink-600 dark:text-pink-300 shadow-sm border border-slate-200/80 dark:border-pink-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Spacious Card Grid - Fluid Responsive */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className={`group relative flex flex-col justify-between p-6 rounded-2xl transition-all duration-200 backdrop-blur-md ${
                isDark
                  ? 'bg-[#0a0e1c]/80 hover:bg-[#0f1428] border border-white/10 hover:border-pink-500/40 shadow-xl hover:shadow-[0_6px_25px_rgba(255,42,133,0.12)]'
                  : 'bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-pink-500/40 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                {/* Unboxed Metadata Header */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-pink-600 dark:text-pink-400 tracking-wide font-sans">
                    {tool.category}
                  </span>
                  {tool.badge && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Tool Title in Barlow Condensed */}
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-normal uppercase text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {tool.title}
                </h3>

                {/* Summary */}
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-light">
                  {tool.summary}
                </p>

                {/* Unboxed Tags */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  {tool.tags.map((tag, idx) => (
                    <React.Fragment key={tag}>
                      <span className="hover:text-pink-500 dark:hover:text-pink-300 transition-colors">
                        #{tag}
                      </span>
                      {idx < tool.tags.length - 1 && <span aria-hidden="true">·</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
                {tool.interactiveType ? (
                  <button
                    onClick={() => onOpenSandbox(tool)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white transition-all cursor-pointer border border-slate-200 dark:border-white/10 shadow-sm"
                  >
                    <Play size={12} className="text-pink-500 fill-pink-500" />
                    <span>Run In App</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">External Utility</span>
                )}

                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500 hover:to-purple-600 text-pink-600 dark:text-pink-300 hover:text-white dark:hover:text-white transition-all border border-pink-500/30 hover:border-transparent shadow-sm"
                >
                  <span>Launch ↗</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
          <p className="text-sm text-slate-500">No tools found matching "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-3 text-xs text-pink-500 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
