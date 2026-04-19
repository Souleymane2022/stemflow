// test-regex.mjs
import { readFileSync } from 'fs';

const content = readFileSync('client/src/pages/Community.tsx', 'utf8');
const lines = content.split('\n');

// Show lines around the known duplicate
console.log("=== Lines 116-125 ===");
for (let i = 116; i <= 125; i++) {
  const l = lines[i];
  const m1 = l.match(/^(\s*<[A-Za-z][A-Za-z0-9.]*)\s+className="([^"]*)"\s*$/);
  const m2 = l.match(/^\s*<[A-Za-z][A-Za-z0-9.]*\s*$/);
  const mClass = l.match(/^(\s*)className="([^"]*)"\s*$/);
  console.log(`${i}: [${l}] | mWithClass=${!!m1} mAlone=${!!m2} mClass=${!!mClass}`);
}
