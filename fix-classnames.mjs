#!/usr/bin/env node
/**
 * fix-classnames-FINAL.mjs
 * Definitive fix for:
 *   <Button className="X"    <- tag + first className, line ends with "
 *     variant="..."
 *     className="Y"          <- second className (ERROR)
 *   >
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

function getAllTsxFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) files.push(...getAllTsxFiles(full));
    else if (extname(entry) === '.tsx') files.push(full);
  }
  return files;
}

function fixOnce(lines) {
  let changed = false;
  let inTag = false;
  let firstClassIdx = -1;
  let firstClass = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!inTag) {
      // Start of multi-line JSX tag: <Tag className="X"  (ends with quote, no >)
      // OR <Tag  alone (no props, no >)
      const mWithClass = line.match(/^(\s*<[A-Za-z][A-Za-z0-9.]*)\s+className="([^"]*)"\s*$/);
      const mAlone = line.match(/^\s*<[A-Za-z][A-Za-z0-9.]*\s*$/);

      if (mWithClass) {
        inTag = true;
        firstClassIdx = i;
        firstClass = mWithClass[2];
      } else if (mAlone) {
        inTag = true;
        firstClassIdx = -1;
        firstClass = '';
      }
    } else {
      // Inside a multi-line tag
      // Tag closes here
      if (trimmed === '>' || trimmed === '/>') {
        inTag = false;
        firstClassIdx = -1;
        firstClass = '';
        continue;
      }

      // className= found on this line (alone, like "        className="Y"")
      const mClass = line.match(/^(\s*)className="([^"]*)"\s*$/);
      if (mClass) {
        if (firstClassIdx === -1) {
          // First className in this tag
          firstClassIdx = i;
          firstClass = mClass[2];
        } else {
          // Second className — MERGE
          const merged = `${firstClass} ${mClass[2]}`.trim().replace(/\s+/g, ' ');
          lines[firstClassIdx] = lines[firstClassIdx].replace(
            `className="${firstClass}"`,
            `className="${merged}"`
          );
          lines[i] = null; // Mark for removal
          firstClass = merged;
          changed = true;
        }
        continue;
      }

      // If we see a new tag opening, the current tag context is lost
      // (shouldn't happen for valid JSX but safety check)
      if (/^\s*<[A-Za-z]/.test(trimmed) && !trimmed.startsWith('</')) {
        // New tag starts - only if current line has > it closes properly
        // Reset tag tracking
        if (!trimmed.includes('>') ) {
          // Nested opening tag without close - complex case, just stop tracking
          inTag = false;
          firstClassIdx = -1;
        }
      }
    }
  }

  const result = lines.filter(l => l !== null);
  return { lines: result, changed };
}

function fixFile(content) {
  let lines = content.split('\n');
  let totalChanged = false;
  
  for (let pass = 0; pass < 50; pass++) {
    const { lines: newLines, changed } = fixOnce(lines);
    lines = newLines;
    if (!changed) break;
    totalChanged = true;
  }

  return { result: lines.join('\n'), changed: totalChanged };
}

const files = getAllTsxFiles(join(process.cwd(), 'client', 'src'));
let totalFiles = 0;

for (const f of files) {
  const orig = readFileSync(f, 'utf8');
  const { result, changed } = fixFile(orig);

  if (changed) {
    writeFileSync(f, result, 'utf8');
    const rel = f.split('client\\src\\')[1] || f.split('client/src/')[1] || f;
    console.log(`✅ ${rel}`);
    totalFiles++;
  }
}

console.log(`\n🎉 Fixed ${totalFiles} files.`);
