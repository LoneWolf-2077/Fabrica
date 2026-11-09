import { DownloadItem } from '../data.ts';

/**
 * Auto-detect all Illustrator scripts dropped into subfolders (Script Packs) under /src/scripts/illustrator/
 * Using Vite's eager recursive glob import with raw string query.
 */
const scriptModules = import.meta.glob<string>(
  './illustrator/**/*',
  { query: '?raw', import: 'default', eager: true }
);

interface ParsedMetadata {
  name?: string;
  description?: string;
  version?: string;
  author?: string;
}

function parseScriptMetadata(content: string, filename: string): ParsedMetadata {
  const meta: ParsedMetadata = {};

  const nameMatch = content.match(/@name\s+([^\r\n]+)/i) || content.match(/@title\s+([^\r\n]+)/i);
  if (nameMatch) {
    meta.name = nameMatch[1].trim();
  } else {
    const bannerMatch = content.match(/\/\*+\s*[\r\n]+\s*([A-Za-z0-9\-_\s\(\)]+)/);
    if (bannerMatch && bannerMatch[1] && bannerMatch[1].trim().length > 3 && bannerMatch[1].trim().length < 60) {
      meta.name = bannerMatch[1].trim();
    }
  }

  const descMatch = content.match(/@description\s+([^\r\n]+)/i);
  if (descMatch) {
    meta.description = descMatch[1].trim();
  } else {
    const partOfMatch = content.match(/Part of[^\r\n]+/i);
    if (partOfMatch) {
      meta.description = `${partOfMatch[0].trim()}. Adobe Illustrator ExtendScript automation workflow.`;
    }
  }

  const versionMatch = content.match(/@version\s+([^\r\n]+)/i);
  if (versionMatch) meta.version = versionMatch[1].trim();

  const authorMatch = content.match(/@author\s+([^\r\n]+)/i);
  if (authorMatch) meta.author = authorMatch[1].trim();

  return meta;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function prettifyFilename(filename: string): string {
  const base = filename.replace(/\.[^/.]+$/, '');
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getAutoDetectedIllustratorScripts(): DownloadItem[] {
  const detected: DownloadItem[] = [];

  for (const [path, rawContent] of Object.entries(scriptModules)) {
    // path format: "./illustrator/Artboard Tools/batch-artboard-rename.jsx"
    const parts = path.split('/');
    const filename = parts.pop() || 'script.jsx';
    
    // Skip non-scripts like README, directories, or hidden files
    if (filename.toLowerCase().startsWith('readme') || filename.startsWith('.') || !filename.includes('.')) {
      continue;
    }

    // Determine Script Pack category from subfolder if present
    // parts will be [., illustrator, Artboard Tools]
    let packName = 'Adobe Illustrator Scripts';
    if (parts.length > 2) {
      const subfolder = parts.slice(2).join(' / ');
      if (subfolder) {
        packName = `AI Pack: ${subfolder}`;
      }
    }

    const content = typeof rawContent === 'string' ? rawContent : '';
    const meta = parseScriptMetadata(content, filename);
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const size = new Blob([content]).size;

    detected.push({
      id: `ai-${filename.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
      filename,
      title: meta.name || prettifyFilename(filename),
      description:
        meta.description ||
        `Automated Adobe Illustrator ExtendScript for vector manipulation and artboard workflows.`,
      category: packName,
      version: meta.version ? (meta.version.startsWith('v') ? meta.version : `v${meta.version}`) : 'v1.0.0',
      fileSize: formatBytes(size),
      fileType: ext || '.jsx',
      updatedAt: 'Auto-detected',
      content,
    });
  }

  return detected;
}
