import React, { useState } from 'react';
import { X, Clock, Calendar, User, Copy, Check, Bookmark, ExternalLink } from 'lucide-react';
import { GuideItem } from '../data.ts';

interface GuideReaderModalProps {
  guide: GuideItem | null;
  onClose: () => void;
  isDark: boolean;
}

export const GuideReaderModal: React.FC<GuideReaderModalProps> = ({ guide, onClose, isDark }) => {
  if (!guide) return null;

  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(guide.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple clean markdown parser for headings, code blocks, lists, and paragraphs
  const renderFormattedMarkdown = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = '';

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLang = line.replace('```', '').trim();
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const codeText = codeBuffer.join('\n');
          elements.push(
            <div key={`code-${idx}`} className="my-4 relative group">
              <div className="flex items-center justify-between px-3.5 py-1.5 rounded-t-lg bg-slate-800 text-[11px] font-mono text-slate-400 border-b border-slate-700">
                <span>{codeLang || 'code'}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeText);
                  }}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={11} />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-4 rounded-b-lg overflow-x-auto text-xs font-mono bg-slate-900 text-slate-200 leading-relaxed">
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${idx}`} className="text-2xl sm:text-3xl font-bold tracking-tight mt-6 mb-3 text-slate-900 dark:text-white">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${idx}`} className="text-lg sm:text-xl font-semibold tracking-tight mt-6 mb-2 text-slate-900 dark:text-slate-100">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${idx}`} className="text-base font-semibold mt-4 mb-2 text-slate-800 dark:text-slate-200">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <li key={`li-${idx}`} className="ml-4 list-disc text-sm text-slate-600 dark:text-slate-300 my-1 leading-relaxed">
            {line.replace('- ', '')}
          </li>
        );
      } else if (line.trim() === '') {
        // empty spacer
      } else {
        elements.push(
          <p key={`p-${idx}`} className="text-sm text-slate-700 dark:text-slate-300 my-2.5 leading-relaxed">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-10 transition-colors backdrop-blur-xl ${
          isDark
            ? 'bg-[#0a0e1c] text-slate-100 border border-white/10 shadow-2xl shadow-purple-950/20'
            : 'bg-white text-slate-900 border border-slate-200 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              <span>{guide.category}</span>
              <span aria-hidden="true">·</span>
              <span>Engineering Standard</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">{guide.title}</h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            aria-label="Close guide reader"
          >
            <X size={18} />
          </button>
        </div>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-slate-400" />
            <span>{guide.author}</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400" />
            <span>{guide.readTime}</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-slate-400" />
            <span>{guide.published}</span>
          </div>
        </div>

        {/* Article Body */}
        <div className="py-6 space-y-2">
          {renderFormattedMarkdown(guide.markdownContent)}
        </div>

        {/* Footer controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500">
            Open-source technical documentation by Lonewolf Fabrica.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Done Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
