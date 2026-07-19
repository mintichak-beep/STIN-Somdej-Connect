const fs = require('fs');
let lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');

let depth = 0;
let depths = [];
for (let i = 0; i < 1294; i++) {
  let line = lines[i] || '';
  for (let char of line) {
    if (char === '{') depth++;
    if (char === '}') depth--;
  }
  depths[i] = depth;
}

// Find where depth never drops below N again
function findThreshold(n) {
  for (let i = 0; i < 1294; i++) {
    let drops = false;
    for (let j = i; j < 1294; j++) {
      if (depths[j] < n) {
        drops = true;
        break;
      }
    }
    if (!drops) return i;
  }
  return -1;
}

console.log('Depth 2 starts at:', findThreshold(2));
console.log('Depth 3 starts at:', findThreshold(3));
console.log('Depth 4 starts at:', findThreshold(4));
