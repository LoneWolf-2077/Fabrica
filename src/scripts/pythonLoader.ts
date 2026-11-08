import { DownloadItem } from '../data.ts';

/**
 * Auto-detect all Python scripts dropped into the /src/scripts/python/ folder
 * Using Vite's eager glob import with raw string query.
 */
const scriptModules = import.meta.glob<string>(
  './python/*',
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
    const bannerMatch = content.match(/"""\s*[\r\n]+\s*([A-Za-z0-9\-_\s\(\)]+)/);
    if (bannerMatch && bannerMatch[1] && bannerMatch[1].trim().length > 3 && bannerMatch[1].trim().length < 60) {
      meta.name = bannerMatch[1].trim();
    }
  }

  const descMatch = content.match(/@description\s+([^\r\n]+)/i);
  if (descMatch) {
    meta.description = descMatch[1].trim();
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

export function getAutoDetectedPythonScripts(): DownloadItem[] {
  const detected: DownloadItem[] = [];

  for (const [path, rawContent] of Object.entries(scriptModules)) {
    const filename = path.split('/').pop() || 'script.py';
    
    if (filename.toLowerCase().startsWith('readme') || filename.startsWith('.')) {
      continue;
    }

    const content = typeof rawContent === 'string' ? rawContent : '';
    const meta = parseScriptMetadata(content, filename);
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const size = new Blob([content]).size;

    detected.push({
      id: `py-${filename.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
      filename,
      title: meta.name || prettifyFilename(filename),
      description:
        meta.description ||
        `Zero-dependency Python 3 utility script for developer workflows.`,
      category: 'Python Scripts',
      version: meta.version ? (meta.version.startsWith('v') ? meta.version : `v${meta.version}`) : 'v1.0.0',
      fileSize: formatBytes(size),
      fileType: ext || '.py',
      updatedAt: 'Auto-detected',
      content,
    });
  }

  return detected;
}
