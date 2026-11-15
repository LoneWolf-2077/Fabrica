import React, { useState, useMemo } from 'react';
import { ExternalLink, Search, Youtube, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { ChannelItem } from '../data.ts';

interface ChannelsTabProps {
  channels: ChannelItem[];
  isDark: boolean;
}

export const ChannelsTab: React.FC<ChannelsTabProps> = ({ channels, isDark }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredChannels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return channels;
    return channels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [channels, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header Banner & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-slate-900 dark:text-white">
              Recommended YouTube Channels
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Curated creator channels for graphic design, Adobe Illustrator tutorials, typography mastery, and branding masterclasses.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search channels or handles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-black/40 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-1 focus:ring-red-500/20 transition-all shadow-sm"
          />
        </div>
      </div>



      {/* Channels Grid */}
      {filteredChannels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className={`group relative p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between backdrop-blur-md ${
                isDark
                  ? 'bg-[#0a0e1c]/80 hover:bg-[#0f1428] border-white/10 hover:border-red-500/40 shadow-xl hover:shadow-[0_6px_25px_rgba(239,68,68,0.15)]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-red-500/40 shadow-sm hover:shadow-md'
              }`}
            >
              <div>
                {/* Top Meta */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-[11px] font-mono font-semibold text-red-600 dark:text-red-400">
                    {channel.category}
                  </span>

                  {channel.badge && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded">
                      {channel.badge}
                    </span>
                  )}
                </div>

                {/* Channel Name & Handle */}
                <div className="mb-3">
                  <h3 className="font-display text-xl sm:text-2xl font-bold uppercase text-slate-900 dark:text-white group-hover:text-red-500 transition-colors flex items-center gap-1.5">
                    <span>{channel.name}</span>
                    <CheckCircle2 size={16} className="text-red-500 inline-block" />
                  </h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {channel.handle}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-light">
                  {channel.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Youtube size={14} className="text-red-500" />
                  <span>YouTube Channel</span>
                </div>

                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white transition-all shadow-lg shadow-red-600/25 group-hover:scale-[1.02]"
                >
                  <Play size={12} className="fill-white" />
                  <span>Visit Channel ↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
          <p className="text-sm text-slate-500">No YouTube channels found matching "{searchQuery}".</p>
        </div>
      )}
    </div>
  );
};
