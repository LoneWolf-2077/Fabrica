import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';
import { DownloadItem } from '../data.ts';

interface CodePreviewModalProps {
  item: DownloadItem | null;
  onClose: () => void;
  isDark: boolean;
  onDirectDownload: (item: DownloadItem) => void;
}

export const CodePreviewModal: React.FC<CodePreviewModalProps> = ({
  item,
  onClose,
  isDark,
  onDirectDownload,
}) => {
  if (!item) return null;

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    onDirectDownload(item);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const lines = item.content.trim().split('\n');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl flex flex-col transition-colors backdrop-blur-xl ${
          isDark
            ? 'bg-[#0a0e1c] text-slate-100 border border-white/10 shadow-2xl'
            : 'bg-white text-slate-900 border border-slate-200 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 dark:text-pink-400 border border-pink-500/20">
              <FileCode size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{item.filename}</span>
                <span aria-hidden="true">·</span>
                <span>{item.version}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{item.fileSize}</span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold uppercase text-slate-900 dark:text-white">{item.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Code Content with Line Numbers */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 font-mono text-xs text-slate-200">
          <div className="flex">
            {/* Line numbers column */}
            <div className="pr-4 mr-4 text-right text-slate-600 select-none border-r border-slate-800 tabular-nums">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code text */}
            <pre className="flex-1 overflow-x-auto leading-relaxed">
              <code>{item.content}</code>
            </pre>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Directly licensed under MIT / Apache 2.0.
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {downloaded ? <CheckCircle2 size={14} /> : <Download size={14} />}
              <span>{downloaded ? 'Downloaded!' : `Download ${item.filename}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
