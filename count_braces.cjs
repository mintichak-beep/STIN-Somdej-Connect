const fs = require('fs');
let lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');

let depth = 0;
for (let i = 53; i < 1299; i++) { // from function TeacherTabs to return (
  let line = lines[i] || '';
  for (let char of line) {
    if (char === '{') depth++;
    if (char === '}') depth--;
  }
}
console.log('Depth at line 1299:', depth);
