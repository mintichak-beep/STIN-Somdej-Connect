const fs = require('fs');
let lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');

let depth = 0;
let minDepthAfter = [];
let currentMin = 999;

// Calculate depth array
let depthArray = [];
for (let i = 53; i < 1299; i++) {
  let line = lines[i] || '';
  for (let char of line) {
    if (char === '{') depth++;
    if (char === '}') depth--;
  }
  depthArray[i] = depth;
}

for (let i = 1298; i >= 53; i--) {
  currentMin = Math.min(currentMin, depthArray[i]);
  minDepthAfter[i] = currentMin;
}

for (let i = 53; i < 1299; i++) {
  if (minDepthAfter[i] > minDepthAfter[i-1 === 52 ? 53 : i-1]) {
    console.log(`Depth increased to ${minDepthAfter[i]} starting at line ${i + 1}`);
    console.log(lines[i]);
  }
}
