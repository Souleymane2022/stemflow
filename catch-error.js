const { spawnSync } = require('child_process');
const fs = require('fs');
const result = spawnSync('npx.cmd', ['tsx', 'server/index.ts'], { encoding: 'utf-8' });
let out = "STDOUT:\n" + result.stdout + "\nSTDERR:\n" + result.stderr;
if (result.error) {
    out += "\nERROR:\n" + result.error.message;
}
fs.writeFileSync('crash.txt', out);
console.log("Crash log written to crash.txt");
