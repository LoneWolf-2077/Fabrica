export interface ToolItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  url: string;
  badge?: string;
  featured?: boolean;
  interactiveType?: 'svg-minifier' | 'glass-generator' | 'contrast-checker' | 'font-tester';
}

export interface DownloadItem {
  id: string;
  filename: string;
  title: string;
  description: string;
  category: string;
  version: string;
  fileSize: string;
  fileType: string;
  updatedAt: string;
  content: string; // Real payload for direct file download
}

export interface GuideItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  published: string;
  author: string;
  externalUrl?: string;
  markdownContent: string;
}

export const TOOLS_DATA: ToolItem[] = [
  {
    id: 'svg-minifier',
    title: 'SVG Minifier & Path Polisher',
    summary: 'Strips bloat, metadata, and editor artifacts from raw vector SVGs while preserving crisp coordinate precision and viewBox boundaries.',
    category: 'Vector & SVG',
    tags: ['SVG', 'Vector', 'Optimization', 'Asset Pipeline'],
    url: 'https://jakearchibald.github.io/svgomg/',
    badge: 'Popular',
    featured: true,
    interactiveType: 'svg-minifier',
  },
  {
    id: 'contrast-studio',
    title: 'Palette Harmonics & Contrast Studio',
    summary: 'Evaluates WCAG 2.2 AA/AAA color pairings across dark and light surfaces with perceptual APCA math and hue delta calculations.',
    category: 'Color & A11y',
    tags: ['Accessibility', 'WCAG 2.2', 'Design Tokens', 'Color'],
    url: 'https://color.adobe.com/create/color-contrast-analyzer',
    badge: 'Essential',
    featured: true,
    interactiveType: 'contrast-checker',
  },
  {
    id: 'glass-generator',
    title: 'CSS Glassmorphism Studio',
    summary: 'Fine-tune backdrop blur filters, multi-layered reflection borders, and specular highlights without triggering GPU frame drops.',
    category: 'UI & Styling',
    tags: ['CSS3', 'Glassmorphism', 'Backdrop Filter', 'Design'],
    url: 'https://hype4.academy/tools/glassmorphism-generator',
    badge: 'Interactive',
    featured: true,
    interactiveType: 'glass-generator',
  },
  {
    id: 'variable-font-lab',
    title: 'Roboto Flex Variable Font Lab',
    summary: 'Live parametric inspection tool for testing weight (wght), width (wdth), slant (slnt), and optical sizing (opsz) across typography stacks.',
    category: 'Typography',
    tags: ['Roboto Flex', 'Variable Fonts', 'CSS', 'Type Scales'],
    url: 'https://fonts.google.com/specimen/Roboto+Flex',
    badge: 'Type',
    featured: false,
    interactiveType: 'font-tester',
  },
  {
    id: 'json-to-ts',
    title: 'JSON to TypeScript Interface Synthesizer',
    summary: 'Instant deterministic conversion of nested JSON payloads into strictly-typed TypeScript interfaces, types, and readonly records.',
    category: 'Developer Utilities',
    tags: ['TypeScript', 'Code Gen', 'JSON', 'Tooling'],
    url: 'https://transform.tools/json-to-typescript',
    badge: 'Dev Utility',
    featured: false,
  },
  {
    id: 'regex-sandbox',
    title: 'RegEx Visualizer & Tokenizer',
    summary: 'Zero-latency regular expression testing playground with character class explanations, capture group breakdown, and match highlights.',
    category: 'Developer Utilities',
    tags: ['Regex', 'Parser', 'Debugging', 'JavaScript'],
    url: 'https://regex101.com/',
    badge: 'Reference',
    featured: false,
  },
  {
    id: 'base64-asset-inspector',
    title: 'Base64 & Data URI Asset Inspector',
    summary: 'Inspect, decode, and transform SVG and image assets into inline CSS data URIs and binary-safe clipboard buffers with zero server roundtrips.',
    category: 'Asset Pipeline',
    tags: ['Base64', 'Data URI', 'Optimization', 'Assets'],
    url: 'https://www.base64encode.org/',
    badge: 'Tool',
    featured: false,
  },
  {
    id: 'web-manifest-matrix',
    title: 'PWA & Favicon Matrix Builder',
    summary: 'Generates multi-resolution Apple Touch icons, web app manifest declarations, and theme color tags for modern responsive browsers.',
    category: 'Web Architecture',
    tags: ['PWA', 'Favicon', 'Manifest', 'Mobile'],
    url: 'https://realfavicongenerator.net/',
    badge: 'Mobile',
    featured: false,
  },
];

export const DOWNLOADS_DATA: DownloadItem[] = [
  {
    id: 'dev-cleanup-sh',
    filename: 'fabrica-dev-cleanup.sh',
    title: 'Automated Node & Build Cache Purger',
    description: 'POSIX shell script that systematically detects and sweeps orphaned node_modules, .turbo, .next, and target caches across nested monorepos.',
    category: 'Shell Scripts',
    version: 'v2.1.0',
    fileSize: '3.8 KB',
    fileType: '.sh',
    updatedAt: 'Nov 2026',
    content: `#!/usr/bin/env bash
# ==============================================================================
# FABRICA DEV CACHE & NODE_MODULES PURGER
# Provided by Lonewolf Presents Fabrica
# ==============================================================================
set -euo pipefail

echo "=========================================="
echo "  FABRICA: Monorepo & Cache Sweep Utility"
echo "=========================================="

TARGET_DIR="\${1:-.}"
echo "Analyzing target directory: \${TARGET_DIR}"

TOTAL_CLEANED=0

cleanup_pattern() {
  local pattern="$1"
  local desc="$2"
  echo "--> Searching for \${desc} (\${pattern})..."
  find "\${TARGET_DIR}" -name "\${pattern}" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
  echo "    Done sweeping \${desc}."
}

read -p "Are you sure you want to clean development caches in '\${TARGET_DIR}'? (y/N): " -r CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Sweep canceled by user."
  exit 0
fi

cleanup_pattern "node_modules" "Node dependency trees"
cleanup_pattern ".turbo" "Turbo build caches"
cleanup_pattern ".next" "Next.js compilation caches"
cleanup_pattern "dist" "Stale distribution outputs"
cleanup_pattern ".cache" "Generic temporary cache trees"
cleanup_pattern ".DS_Store" "macOS metadata files"

echo "=========================================="
echo "✔ Fabrica cleanup completed successfully."
echo "=========================================="
`,
  },
  {
    id: 'design-tokens-json',
    filename: 'fabrica-design-tokens.json',
    title: 'W3C Standard Design System Tokens',
    description: 'Production-ready semantic design token tree in W3C DTCG format covering neutral scales, restrained cyan accents, radius math, and typography scales.',
    category: 'Design Tokens',
    version: 'v1.4.2',
    fileSize: '7.4 KB',
    fileType: '.json',
    updatedAt: 'Nov 2026',
    content: `{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "name": "Fabrica Design Tokens",
  "version": "1.4.2",
  "color": {
    "surface": {
      "dark": {
        "canvas": { "$value": "#12151e", "$type": "color" },
        "panel": { "$value": "rgba(23, 28, 42, 0.72)", "$type": "color" },
        "border": { "$value": "rgba(255, 255, 255, 0.08)", "$type": "color" }
      },
      "light": {
        "canvas": { "$value": "#f8fafc", "$type": "color" },
        "panel": { "$value": "rgba(255, 255, 255, 0.82)", "$type": "color" },
        "border": { "$value": "rgba(15, 23, 42, 0.08)", "$type": "color" }
      }
    },
    "accent": {
      "cyanDark": { "$value": "#00f0ff", "$type": "color", "description": "Strictly restrained active highlights" },
      "cyanLight": { "$value": "#0284c7", "$type": "color", "description": "High contrast WCAG 4.5:1 daylight accent" }
    }
  },
  "typography": {
    "fontFamily": {
      "primary": { "$value": "'Roboto Flex', -apple-system, sans-serif", "$type": "fontFamily" },
      "mono": { "$value": "'JetBrains Mono', 'IBM Plex Mono', monospace", "$type": "fontFamily" }
    },
    "scale": {
      "xs": { "fontSize": "0.75rem", "lineHeight": "1rem" },
      "sm": { "fontSize": "0.875rem", "lineHeight": "1.25rem" },
      "base": { "fontSize": "1rem", "lineHeight": "1.5rem" },
      "lg": { "fontSize": "1.125rem", "lineHeight": "1.75rem" },
      "xl": { "fontSize": "1.25rem", "lineHeight": "1.75rem" },
      "2xl": { "fontSize": "1.5rem", "lineHeight": "2rem" },
      "3xl": { "fontSize": "1.875rem", "lineHeight": "2.25rem" }
    }
  },
  "radii": {
    "sm": { "$value": "4px", "$type": "dimension" },
    "md": { "$value": "8px", "$type": "dimension" },
    "lg": { "$value": "12px", "$type": "dimension" },
    "xl": { "$value": "16px", "$type": "dimension" }
  }
}
`,
  },
  {
    id: 'quick-dev-server-py',
    filename: 'quick-server.py',
    title: 'Zero-Dependency Python 3 Dev Server',
    description: 'Lightweight local development web server featuring automatic MIME mapping, CORS permissive headers, and zero-cache development headers.',
    category: 'Python Utilities',
    version: 'v1.2.0',
    fileSize: '2.9 KB',
    fileType: '.py',
    updatedAt: 'Nov 2026',
    content: `#!/usr/bin/env python3
"""
Fabrica Zero-Dependency Local Dev Server
Provides CORS, correct MIME types, and disables aggressive caching during local development.
Usage: python3 quick-server.py [port]
"""

import sys
import http.server
import socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

class FabricaRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow cross-origin testing and bypass stale asset caching
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def guess_type(self, path):
        mime = super().guess_type(path)
        if path.endswith('.mjs') or path.endswith('.js'):
            return 'application/javascript'
        if path.endswith('.svg'):
            return 'image/svg+xml'
        return mime

print("--------------------------------------------------")
print(f"  FABRICA DEV SERVER running at http://localhost:{PORT}")
print("  Press Ctrl+C to terminate.")
print("--------------------------------------------------")

with socketserver.TCPServer(("", PORT), FabricaRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\\nShutting down server cleanly...")
`,
  },
  {
    id: 'modern-reset-css',
    filename: 'modern-reset.css',
    title: 'Production CSS Reset & Intrinsic Defaults',
    description: 'Clean, opinionated 2026 CSS foundation removing browser idiosyncrasies, enabling border-box sizing, and smoothing variable font rendering.',
    category: 'CSS Architecture',
    version: 'v3.0.1',
    fileSize: '2.2 KB',
    fileType: '.css',
    updatedAt: 'Nov 2026',
    content: `/* ==========================================================================
   FABRICA MODERN CSS RESET (2026 EDITION)
   Clean typography, variable font optical sizing, and fluid container defaults.
   ========================================================================== */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  tab-size: 2;
  scroll-behavior: smooth;
  font-optical-sizing: auto;
}

body {
  min-height: 100vh;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
  height: auto;
}

input,
button,
textarea,
select {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
  background: none;
  border: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

:focus-visible {
  outline: 2px solid #00f0ff;
  outline-offset: 2px;
}
`,
  },
  {
    id: 'svg-sprite-packer-js',
    filename: 'svg-sprite-packer.js',
    title: 'Zero-Dependency SVG Sprite Packer',
    description: 'Node.js build utility that reads a directory of individual SVG icons and synthesizes a high-performance symbol sprite sheet with SVG viewBox retention.',
    category: 'Build Scripts',
    version: 'v1.8.0',
    fileSize: '4.5 KB',
    fileType: '.js',
    updatedAt: 'Nov 2026',
    content: `/**
 * Fabrica SVG Sprite Packer
 * Usage: node svg-sprite-packer.js ./icons ./dist/sprites.svg
 */
const fs = require('fs');
const path = require('path');

const inputDir = process.argv[2] || './icons';
const outputFile = process.argv[3] || './dist/sprites.svg';

if (!fs.existsSync(inputDir)) {
  console.error(\`Error: Input directory "\${inputDir}" does not exist.\`);
  process.exit(1);
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.svg'));
console.log(\`Found \${files.length} SVGs to pack...\`);

let symbols = [];

for (const file of files) {
  const id = path.basename(file, '.svg').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const raw = fs.readFileSync(path.join(inputDir, file), 'utf8');

  // Extract viewBox and inner SVG contents
  const viewBoxMatch = raw.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  const innerContent = raw
    .replace(/<\\?xml[^>]*>/gi, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\\/svg>/i, '')
    .trim();

  symbols.push(\`  <symbol id="\${id}" viewBox="\${viewBox}">\\n    \${innerContent}\\n  </symbol>\`);
}

const spriteSheet = \`<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\\n\${symbols.join('\\n')}\\n</svg>\\n\`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, spriteSheet, 'utf8');
console.log(\`✔ Created SVG sprite sheet at "\${outputFile}" with \${symbols.length} symbols.\`);
`,
  },
  {
    id: 'gitignore-pack-zip',
    filename: 'fabrica-gitignore-pack.txt',
    title: 'Consolidated Modern Gitignore Master Template',
    description: 'Exhaustive ignore rules for Node, Vite, React, Python, Rust, Go, environment secrets, and operating system artifacts.',
    category: 'Config Presets',
    version: 'v2.0.0',
    fileSize: '3.1 KB',
    fileType: '.txt',
    updatedAt: 'Nov 2026',
    content: `# ==============================================================================
# FABRICA MASTER .GITIGNORE PRESET
# ==============================================================================

# OS Metadata
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Environment & Secrets (NEVER COMMIT CREDENTIALS)
.env
.env.local
.env.*.local
*.pem
*.key
credentials.json

# Node & Package Managers
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Build Outputs & Bundlers
dist/
dist-ssr/
build/
out/
.next/
.nuxt/
.turbo/
.cache/
*.tsbuildinfo

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/

# IDE & Editor artifacts
.idea/
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
*.swp
*.swo
`,
  },
];

export const GUIDES_DATA: GuideItem[] = [
  {
    id: 'variable-typography-roboto-flex',
    title: 'Precision Web Typography with Roboto Flex',
    summary: 'A definitive guide to leveraging parametric axes—weight, optical sizing, width, and grade—for fluid responsive reading experiences.',
    category: 'Typography',
    readTime: '5 min read',
    published: 'Nov 2026',
    author: 'Lonewolf Design Engineering',
    markdownContent: `
# Precision Web Typography with Roboto Flex

Variable fonts represent a profound leap forward in web design. Instead of loading distinct 30KB–50KB files for every font weight (400, 500, 600, 700) and style (italic, condensed), a single variable font file contains continuous interpolation axes.

## 1. Why Roboto Flex?
Roboto Flex is Google's flagship variable font, offering unprecedented control over 12 parametric axes. The most critical axes for web applications include:

- **wght (Weight)**: Continuous scale from \`100\` (Thin) to \`1000\` (Black).
- **opsz (Optical Size)**: Automatically tunes letterforms for microcopy (\`8px\`) versus giant headlines (\`144px\`).
- **wdth (Width)**: Smooth condensation from \`25%\` to \`151%\` width.
- **slnt (Slant)**: Angle variation without faux-italic distortion.

## 2. Implementing in CSS
Loading Roboto Flex via Google Fonts:

\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@100..1000&display=swap" rel="stylesheet" />
\`\`\`

Activating parametric axes in modern CSS:

\`\`\`css
/* Clean standard body text */
body {
  font-family: 'Roboto Flex', -apple-system, sans-serif;
  font-optical-sizing: auto;
  font-variation-settings: 'wght' 420;
}

/* Crisp condensed section kicker */
.kicker {
  font-variation-settings: 'wght' 600, 'wdth' 95;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Hero Display Headline */
h1 {
  font-variation-settings: 'wght' 650, 'wdth' 102;
  letter-spacing: -0.02em;
}
\`\`\`

## 3. Dark Mode Optical Compensation
When light text is rendered on dark backgrounds (e.g., \`#12151e\`), the human eye perceives white glyphs as slightly thinner due to irradiance contrast. With variable fonts, we can optically compensate by shifting the weight:

\`\`\`css
/* Light mode */
.card-title {
  font-variation-settings: 'wght' 600;
}

/* Optical balance in dark mode */
.dark .card-title {
  font-variation-settings: 'wght' 625;
}
\`\`\`
`,
  },
  {
    id: 'high-perf-glassmorphism',
    title: 'High-Performance CSS Glassmorphism Without Frame Drops',
    summary: 'Techniques for crafting silky 60fps glass surfaces, backdrop-filter fallbacks, and layered specular border reflections.',
    category: 'UI & Styling',
    readTime: '4 min read',
    published: 'Nov 2026',
    author: 'Lonewolf Design Engineering',
    markdownContent: `
# High-Performance CSS Glassmorphism Without Frame Drops

Glassmorphism provides depth and tactile presence, but naive implementations can cripple scrolling performance by forcing the browser to repaint complex blurs on every composite cycle.

## 1. The Anatomy of True Glass
A convincing glass panel requires three distinct visual components:
1. **Translucent surface tint**: High opacity neutral tint (70%–85%).
2. **Backdrop blur**: \`backdrop-filter: blur(12px)\` to soften the underlying canvas.
3. **Specular edge reflection**: A 1px translucent border with slightly higher brightness at top and left edges.

## 2. Preventing GPU Frame Drops
To avoid compositor thrashing:
- Avoid nesting blur panels inside other blur panels.
- Do not animate backdrop blur radius during scroll or hover.
- Isolate the glass layer onto a GPU composite layer using \`will-change: transform\` or \`transform: translateZ(0)\` when hovering.

\`\`\`css
.glass-card {
  background: rgba(23, 28, 42, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.2s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 240, 255, 0.3);
}
\`\`\`

## 3. Light Mode Adaptation
In daylight themes (\`#f8fafc\`), pure white frosted glass needs a subtle shadow to separate from the off-white ground:

\`\`\`css
.glass-card-light {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
}
\`\`\`
`,
  },
  {
    id: 'zero-dependency-cli-scripting',
    title: 'Zero-Dependency CLI Scripting in Bash & Python',
    summary: 'Guidelines for authoring resilient, cross-platform developer utility scripts that run out of the box with zero npm or pip installs.',
    category: 'Developer Utilities',
    readTime: '6 min read',
    published: 'Nov 2026',
    author: 'Lonewolf Developer Tools',
    markdownContent: `
# Zero-Dependency CLI Scripting in Bash & Python

Modern development workflows often suffer from dependency rot: a simple helper script requires 80 npm packages, fails when Node upgrades, or breaks in CI containers.

Writing zero-dependency scripts in standard POSIX Bash and Python 3 standard library ensures your tooling runs anywhere, forever.

## 1. The Golden Flags for Bash
Never write a shell script without \`set -euo pipefail\`:

\`\`\`bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\\n\\t'
\`\`\`

- \`-e\`: Exit immediately if any command returns a non-zero exit status.
- \`-u\`: Treat unset variables as an error and exit immediately.
- \`-o pipefail\`: Ensure pipeline return codes reflect the failure of any command in the chain, not just the last one.

## 2. Python 3 Standard Library Superpowers
Python 3 ships with remarkable built-in modules that eliminate external pip packages for common developer workflows:
- \`urllib.request\`: HTTP client for webhooks and API checks.
- \`json\`: High-speed JSON parsing and schema validation.
- \`hashlib\`: SHA-256 and checksum verification.
- \`socketserver\` & \`http.server\`: Instant local static and API mock servers.

\`\`\`python
import json
import urllib.request

def fetch_json(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Fabrica-CLI/1.0"}
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode("utf-8"))
\`\`\`
`,
  },
  {
    id: 'accessible-color-systems-wcag',
    title: 'Accessible Dark & Light Color Systems (WCAG 2.2)',
    summary: 'How to build dual-theme palettes that guarantee 4.5:1 text contrast and 3:1 graphical element readability without visual clutter.',
    category: 'Accessibility',
    readTime: '4 min read',
    published: 'Nov 2026',
    author: 'Lonewolf Design Engineering',
    markdownContent: `
# Accessible Dark & Light Color Systems (WCAG 2.2)

Building an interface that switches seamlessly between deep dark mode (\`#12151e\`) and crisp off-white light mode (\`#f8fafc\`) requires careful contrast budgeting.

## 1. The 60-30-10 Color Architecture
- **60% Dominant Neutral Ground**: The primary canvas background (\`#12151e\` dark / \`#f8fafc\` light).
- **30% Structural Surfaces**: Elevated cards, hairline divider lines, and muted secondary text.
- **10% Accent Budget**: High-intent focal points reserved strictly for primary buttons, active tab indicators, and critical badges.

## 2. Contrast Math in Practice
- Body text (\`text-slate-100\` on \`#12151e\`): Contrast ratio $\\approx 14:1$ (Exceeds WCAG AAA).
- Secondary metadata (\`text-slate-400\` on \`#12151e\`): Contrast ratio $\\approx 5.8:1$ (Exceeds WCAG AA).
- Light mode body (\`text-slate-900\` on \`#f8fafc\`): Contrast ratio $\\approx 16:1$.
- Accent Cyan Dark (\`#00f0ff\` on \`#12151e\`): Vibrant luminance for glowing borders and active text.
- Accent Cyan Light (\`#0284c7\` on \`#f8fafc\`): Shifted to deep sky blue to satisfy WCAG AA 4.5:1 contrast on white surfaces.
`,
  },
  {
    id: 'svg-asset-optimization',
    title: 'Vector SVG Asset Optimization & Coordinate Discipline',
    summary: 'Stripping XML headers, optimizing cubic bezier curves, and avoiding layout reflows with disciplined viewBox usage.',
    category: 'Asset Pipeline',
    readTime: '3 min read',
    published: 'Nov 2026',
    author: 'Lonewolf Design Engineering',
    markdownContent: `
# Vector SVG Asset Optimization & Coordinate Discipline

SVGs exported directly from Figma or Adobe Illustrator are stuffed with redundant metadata, arbitrary \`id\` attributes, and decimal precisions up to 8 decimal places.

## 1. What to Strip Out
1. XML declarations: \`<?xml version="1.0" ... ?>\`
2. DOCTYPE wrappers: \`<!DOCTYPE svg ... >\`
3. Editor metadata: \`<sketch:type>\`, \`xmlns:xlink\`, \`version="1.1"\`
4. Hardcoded width/height that overrides \`viewBox\`.

## 2. Preserving Responsiveness
Always ensure your SVG uses a uniform \`viewBox\` (e.g. \`viewBox="0 0 24 24"\`) and omit fixed \`width\` and \`height\` attributes in raw SVG assets so CSS can scale the vector seamlessly:

\`\`\`svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
</svg>
\`\`\`
`,
  },
  {
    id: 'github-pages-deployment-workflow',
    title: 'GitHub Pages Deployment & CI/CD Actions',
    summary: 'Configuring GitHub Actions for automated static Vite deployment with custom domain routing and HTTPS enforcement.',
    category: 'Deployment',
    readTime: '3 min read',
    published: 'Nov 2026',
    author: 'Lonewolf DevOps',
    markdownContent: `
# GitHub Pages Deployment & CI/CD Actions

Hosting modern single-page applications on GitHub Pages is straightforward with GitHub Actions.

## 1. GitHub Actions Workflow Configuration
Create \`.github/workflows/deploy.yml\` in your repository:

\`\`\`yaml
name: Deploy Fabrica to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Production Assets
        run: npm run build

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
\`\`\`
`,
  },
];
