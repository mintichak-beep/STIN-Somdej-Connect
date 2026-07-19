const fs = require('fs');
let lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');
let depth = 0;
for (let i = 0; i < lines.length; i++) {
  for (let char of lines[i]) {
    if (char === '{') depth++;
    if (char === '}') depth--;
  }
}
console.log('Final depth:', depth);
