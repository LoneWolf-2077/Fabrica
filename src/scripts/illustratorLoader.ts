import { DownloadItem } from '../data.ts';

/**
 * Auto-detect all Illustrator scripts dropped into the /src/scripts/illustrator/ folder
 * Using Vite's eager glob import with raw string query.
 */
const scriptModules = import.meta.glob<string>(
  './illustrator/*',
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
    // Check if the first comment line looks like a title (e.g., "RANGE-BASED ARTBOARD RENAMER")
    const bannerMatch = content.match(/\/\*+\s*[\r\n]+\s*([A-Za-z0-9\-_\s\(\)]+)/);
    if (bannerMatch && bannerMatch[1] && bannerMatch[1].trim().length > 3 && bannerMatch[1].trim().length < 60) {
      meta.name = bannerMatch[1].trim();
    }
  }

  const descMatch = content.match(/@description\s+([^\r\n]+)/i);
  if (descMatch) {
    meta.description = descMatch[1].trim();
  } else {
    // Check for "Part of..." or summary line
    const partOfMatch = content.match(/Part of[^\r\n]+/i);
    if (partOfMatch) {
      meta.description = `${partOfMatch[0].trim()}. Renames artboards with custom prefix/suffix and sequential ranges.`;
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
    // Extract filename from path (e.g., "./illustrator/batch-artboard-exporter.jsx")
    const filename = path.split('/').pop() || 'script.jsx';
    
    // Skip non-scripts like README or hidden files if any match
    if (filename.toLowerCase().startsWith('readme') || filename.startsWith('.')) {
      continue;
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
      category: 'Adobe Illustrator Scripts',
      version: meta.version ? (meta.version.startsWith('v') ? meta.version : `v${meta.version}`) : 'v1.0.0',
      fileSize: formatBytes(size),
      fileType: ext || '.jsx',
      updatedAt: 'Auto-detected',
      content,
    });
  }

  return detected;
}
