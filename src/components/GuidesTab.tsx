import React, { useState, useMemo } from 'react';
import { BookOpen, Search, ArrowRight, Clock } from 'lucide-react';
import { GuideItem } from '../data.ts';

interface GuidesTabProps {
  guides: GuideItem[];
  onOpenGuide: (guide: GuideItem) => void;
  isDark: boolean;
}

export const GuidesTab: React.FC<GuidesTabProps> = ({ guides, onOpenGuide, isDark }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    guides.forEach((g) => set.add(g.category));
    return ['All', ...Array.from(set)];
  }, [guides]);

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      const matchesCat = selectedCategory === 'All' || guide.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        guide.title.toLowerCase().includes(q) ||
        guide.summary.toLowerCase().includes(q) ||
        guide.author.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [guides, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Intro Subtitle & Search / Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
              Technical Standards &amp; Architecture Guides
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Deep architectural specifications for variable typography, zero-lag CSS glass, and CI/CD pipelines.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-black/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Category Segmented Controls */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 w-fit max-w-full overflow-x-auto backdrop-blur-md">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-white/15 text-purple-600 dark:text-purple-300 shadow-sm border border-slate-200/80 dark:border-purple-400/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Responsive Guide Cards */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              onClick={() => onOpenGuide(guide)}
              className={`group flex flex-col justify-between p-6 rounded-2xl cursor-pointer transition-all duration-200 backdrop-blur-md ${
                isDark
                  ? 'bg-[#0a0e1c]/80 hover:bg-[#0f1428] border border-white/10 hover:border-purple-500/40 shadow-xl hover:shadow-[0_4px_25px_rgba(168,85,247,0.12)]'
                  : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-500/40 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                {/* Unboxed Metadata Header */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">{guide.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock size={11} />
                    <span>{guide.readTime}</span>
                  </span>
                </div>

                {/* Title in Barlow Condensed */}
                <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-normal text-slate-900 dark:text-white group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                  {guide.title}
                </h3>

                {/* Summary */}
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-light">
                  {guide.summary}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-mono">{guide.published}</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                  <span>Read Guide</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
          <p className="text-sm text-slate-500">No guides found matching "{searchQuery}".</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-3 text-xs text-purple-500 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
