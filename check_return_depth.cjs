const fs = require('fs');
let lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');

let depth = 0;
for (let i = 53; i < lines.length; i++) {
  let line = lines[i] || '';
  
  if (line.includes('return')) {
    console.log(`Line ${i + 1} depth ${depth}: ${line.trim()}`);
  }

  for (let char of line) {
    if (char === '{') depth++;
    if (char === '}') depth--;
  }
}
