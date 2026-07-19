const fs = require('fs');
let lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');
const errorLines = fs.readFileSync('missing_brace_lines.txt', 'utf8').split('\n').filter(Boolean).map(Number);

for (let lineNum of errorLines) {
  if (lineNum === 5211) continue;
  let idx = lineNum - 1; // 0-indexed
  // we want to fix idx - 1
  let prevIdx = idx - 1;
  
  if (lines[prevIdx] && lines[prevIdx].trim() === '}') {
    lines[prevIdx] = lines[prevIdx].replace('}', '}}');
  } else if (lines[prevIdx] && lines[prevIdx].trim() === '}}') {
    // Already fixed?
  } else {
    console.log(`Could not fix line ${lineNum}: prev line is ${lines[prevIdx]}`);
  }
}
fs.writeFileSync('src/components/tabs/TeacherTabs.tsx', lines.join('\n'));
