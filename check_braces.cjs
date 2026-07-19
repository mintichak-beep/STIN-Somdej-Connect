const fs = require('fs');
const lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className=') && lines[i-1] && lines[i-1].match(/}\s*$/)) {
    console.log(i + 1);
    console.log(lines[i-3] || '');
    console.log(lines[i-2] || '');
    console.log(lines[i-1]);
    console.log(lines[i]);
    console.log('---');
  }
}
