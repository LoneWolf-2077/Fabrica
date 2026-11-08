import fs from 'node:fs';

// Ensure docs folder is freshly synced with dist
if (fs.existsSync('docs')) {
  fs.rmSync('docs', { recursive: true, force: true });
}
fs.cpSync('dist', 'docs', { recursive: true });

// Ensure .nojekyll exists in both dist/ and docs/ to prevent GitHub Pages Jekyll processing
fs.writeFileSync('docs/.nojekyll', '');
fs.writeFileSync('dist/.nojekyll', '');

console.log('✔ Successfully compiled and synced dist/ to docs/ with .nojekyll for GitHub Pages.');
