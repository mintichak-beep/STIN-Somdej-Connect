const fs = require('fs');
let lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');

let depth = 0;
for (let i = 53; i < 1294; i++) {
  let line = lines[i] || '';
  for (let char of line) {
    if (char === '{') depth++;
    if (char === '}') depth--;
  }
  if (depth === 2 && lines[i].includes('(')) {
    // maybe a function started here?
  }
}

// Let's print the line where depth became 2 and stayed >= 2 until 1294
let minDepthAfter = [];
let currentMin = 999;
for (let i = 1293; i >= 53; i--) {
  let line = lines[i] || '';
  let lineDepthChange = 0;
  for (let char of line) {
    if (char === '{') lineDepthChange++;
    if (char === '}') lineDepthChange--;
  }
  currentMin = Math.min(currentMin, depth);
  minDepthAfter[i] = currentMin;
  depth -= lineDepthChange;
}

for (let i = 53; i < 1294; i++) {
  if (minDepthAfter[i] >= 2 && (minDepthAfter[i-1] || 1) < 2) {
    console.log(`Depth stays >= 2 starting around line ${i + 1}`);
    console.log(lines[i]);
  }
}
