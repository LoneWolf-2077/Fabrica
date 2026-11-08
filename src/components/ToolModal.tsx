import React, { useState } from 'react';
import { X, ExternalLink, Check, Copy, Sparkles, Sliders, Type, Contrast } from 'lucide-react';
import { ToolItem } from '../data.ts';

interface ToolModalProps {
  tool: ToolItem | null;
  onClose: () => void;
  isDark: boolean;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, onClose, isDark }) => {
  if (!tool) return null;

  // SVG Minifier state
  const [svgInput, setSvgInput] = useState(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <!-- Generator: Fabrica Vector Exporter v2.0 -->
  <circle cx="12" cy="12" r="10"></circle>
  <path d="M12 8v8"></path>
  <path d="M8 12h8"></path>
</svg>`);
  const [copied, setCopied] = useState(false);

  // Glassmorphism state
  const [glassBlur, setGlassBlur] = useState(14);
  const [glassOpacity, setGlassOpacity] = useState(0.72);
  const [glassBorderAlpha, setGlassBorderAlpha] = useState(0.12);

  // Contrast Studio state
  const [fgColor, setFgColor] = useState('#00f0ff');
  const [bgColor, setBgColor] = useState('#12151e');

  // Font Lab state
  const [fontWeight, setFontWeight] = useState(500);
  const [fontWidth, setFontWidth] = useState(100);
  const [fontSlant, setFontSlant] = useState(0);
  const [sampleText, setSampleText] = useState('Fabrica: Clean systems for engineering & design.');

  // SVG Minifier calculation
  const getMinifiedSvg = () => {
    return svgInput
      .replace(/<!--[\s\S]*?-->/g, '') // remove comments
      .replace(/\s+/g, ' ') // collapse whitespace
      .replace(/>\s+</g, '><') // remove whitespace between tags
      .replace(/\s*(width|height)="[^"]*"/gi, '') // remove fixed dimensions
      .trim();
  };

  const minifiedSvg = getMinifiedSvg();
  const savings = Math.max(0, Math.round(((svgInput.length - minifiedSvg.length) / (svgInput.length || 1)) * 100));

  // Contrast math helper (relative luminance)
  const getLuminance = (hex: string) => {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return 0.5;
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum1 = getLuminance(fgColor);
  const lum2 = getLuminance(bgColor);
  const contrastRatio = ((Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05)).toFixed(2);
  const ratioNum = parseFloat(contrastRatio);
  const passAA = ratioNum >= 4.5;
  const passAAA = ratioNum >= 7.0;
  const passLarge = ratioNum >= 3.0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 transition-colors backdrop-blur-xl ${
          isDark
            ? 'bg-[#0a0e1c] text-slate-100 border border-white/10 shadow-2xl shadow-pink-950/20'
            : 'bg-white text-slate-900 border border-slate-200 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-pink-600 dark:text-pink-400 mb-1">
              <span>{tool.category}</span>
              <span aria-hidden="true">·</span>
              <span>Interactive Utility</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">{tool.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sandbox Body */}
        <div className="py-6 space-y-6">
          {tool.interactiveType === 'svg-minifier' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Paste raw SVG code below to strip comments, redundant whitespace, and format the vector path for production:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Raw SVG Input</label>
                  <textarea
                    value={svgInput}
                    onChange={(e) => setSvgInput(e.target.value)}
                    rows={7}
                    className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-500">Minified Output</label>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      -{savings}% savings
                    </span>
                  </div>
                  <textarea
                    readOnly
                    value={minifiedSvg}
                    rows={7}
                    className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Container */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 flex items-center justify-center p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400"
                    dangerouslySetInnerHTML={{ __html: minifiedSvg }}
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Live Render Preview</div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      {minifiedSvg.length} characters (Original: {svgInput.length})
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCopy(minifiedSvg)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy Minified SVG'}</span>
                </button>
              </div>
            </div>
          )}

          {tool.interactiveType === 'glass-generator' && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Adjust glass reflection parameters and preview the composite effect against dynamic contrast:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    <span>Backdrop Blur</span>
                    <span className="font-mono">{glassBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="28"
                    value={glassBlur}
                    onChange={(e) => setGlassBlur(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    <span>Surface Opacity</span>
                    <span className="font-mono">{Math.round(glassOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.95"
                    step="0.05"
                    value={glassOpacity}
                    onChange={(e) => setGlassOpacity(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    <span>Border Highlight</span>
                    <span className="font-mono">{Math.round(glassBorderAlpha * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.04"
                    max="0.4"
                    step="0.02"
                    value={glassBorderAlpha}
                    onChange={(e) => setGlassBorderAlpha(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              {/* Dynamic Preview card */}
              <div className="relative p-8 rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-900/30 via-slate-800 to-indigo-950/40 border border-slate-700 flex items-center justify-center">
                <div
                  style={{
                    backgroundColor: isDark
                      ? `rgba(23, 28, 42, ${glassOpacity})`
                      : `rgba(255, 255, 255, ${glassOpacity})`,
                    backdropFilter: `blur(${glassBlur}px)`,
                    WebkitBackdropFilter: `blur(${glassBlur}px)`,
                    borderColor: isDark
                      ? `rgba(255, 255, 255, ${glassBorderAlpha})`
                      : `rgba(15, 23, 42, ${glassBorderAlpha})`,
                  }}
                  className="w-full max-w-sm p-6 rounded-xl border shadow-xl transition-all"
                >
                  <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1">Fabrica Spec</div>
                  <div className="text-lg font-semibold mb-2">Refined Glass Layer</div>
                  <div className="text-xs text-slate-400 dark:text-slate-300">
                    Silky GPU-rendered glass with zero paint reflows.
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <code className="text-xs font-mono text-slate-500 truncate">
                  backdrop-filter: blur({glassBlur}px); background: rgba(..., {glassOpacity});
                </code>
                <button
                  onClick={() =>
                    handleCopy(
                      `backdrop-filter: blur(${glassBlur}px);\n-webkit-backdrop-filter: blur(${glassBlur}px);\nbackground: rgba(23, 28, 42, ${glassOpacity});\nborder: 1px solid rgba(255, 255, 255, ${glassBorderAlpha});`
                    )
                  }
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied CSS' : 'Copy CSS Rules'}</span>
                </button>
              </div>
            </div>
          )}

          {tool.interactiveType === 'contrast-checker' && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Test foreground text against background surfaces according to WCAG 2.2 accessibility standards:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Foreground (Text) Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="flex-1 text-xs font-mono uppercase px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Background Surface Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-9 h-9 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 text-xs font-mono uppercase px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Sample card with computed contrast */}
              <div
                style={{ backgroundColor: bgColor, color: fgColor }}
                className="p-6 rounded-xl border border-slate-300 dark:border-slate-700 text-center transition-colors shadow-inner"
              >
                <div className="text-3xl font-extrabold tracking-tight mb-1">{contrastRatio} : 1</div>
                <div className="text-xs uppercase tracking-wider font-semibold opacity-80">
                  Contrast Ratio (WCAG 2.2)
                </div>
                <p className="mt-3 text-sm max-w-md mx-auto">
                  The quick brown fox jumps over the lazy developer workstation.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div
                  className={`p-3 rounded-lg border ${
                    passAA
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  <div className="font-bold">WCAG AA</div>
                  <div className="text-[11px] mt-0.5">{passAA ? 'Pass (≥4.5:1)' : 'Fail'}</div>
                </div>

                <div
                  className={`p-3 rounded-lg border ${
                    passAAA
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-500/30 bg-slate-500/5 text-slate-500'
                  }`}
                >
                  <div className="font-bold">WCAG AAA</div>
                  <div className="text-[11px] mt-0.5">{passAAA ? 'Pass (≥7.0:1)' : 'Not AAA'}</div>
                </div>

                <div
                  className={`p-3 rounded-lg border ${
                    passLarge
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  <div className="font-bold">Large Text</div>
                  <div className="text-[11px] mt-0.5">{passLarge ? 'Pass (≥3:1)' : 'Fail'}</div>
                </div>
              </div>
            </div>
          )}

          {tool.interactiveType === 'font-tester' && (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Experiment with Roboto Flex's parametric variable font axes in real time:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>Weight (wght)</span>
                    <span className="font-mono">{fontWeight}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="20"
                    value={fontWeight}
                    onChange={(e) => setFontWeight(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>Width (wdth)</span>
                    <span className="font-mono">{fontWidth}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    step="5"
                    value={fontWidth}
                    onChange={(e) => setFontWidth(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>Slant (slnt)</span>
                    <span className="font-mono">{fontSlant}°</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="0"
                    step="1"
                    value={fontSlant}
                    onChange={(e) => setFontSlant(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Preview Text</label>
                <input
                  type="text"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                />
              </div>

              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 overflow-hidden">
                <div
                  style={{
                    fontFamily: '"Roboto Flex", sans-serif',
                    fontVariationSettings: `'wght' ${fontWeight}, 'wdth' ${fontWidth}, 'slnt' ${fontSlant}`,
                  }}
                  className="text-2xl sm:text-3xl tracking-tight transition-all"
                >
                  {sampleText}
                </div>
              </div>
            </div>
          )}

          {!tool.interactiveType && (
            <div className="text-center py-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{tool.summary}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500">
            Hosted tool reference:{' '}
            <span className="font-mono">
              {(() => {
                try {
                  return new URL(tool.url).hostname;
                } catch {
                  return tool.url;
                }
              })()}
            </span>
          </span>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 hover:opacity-90 transition-opacity"
          >
            <span>Open Tool ↗</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};
