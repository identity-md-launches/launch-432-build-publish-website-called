import { copyFileSync } from 'node:fs';
copyFileSync('src/data/projects.json', 'dist/projects.json');
copyFileSync('src/data/market.json', 'dist/market.json');
copyFileSync('RESEARCH.md', 'dist/RESEARCH.md');
copyFileSync('src/assets/OFL.txt', 'dist/assets/space-grotesk-OFL.txt');
console.log('Exported project data, market snapshot and research alongside the static app.');
