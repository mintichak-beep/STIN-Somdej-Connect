const fs = require('fs');
let lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('className=') && lines[i-1] && lines[i-1].match(/^\s*}}\s*$/)) {
    // Check line i-2
    let lineAbove = lines[i-2];
    if (lineAbove && !lineAbove.trim().endsWith('}')) {
      // It's a mistake! Change }} to }
      lines[i-1] = lines[i-1].replace('}}', '}');
    }
  }
}
fs.writeFileSync('src/components/tabs/TeacherTabs.tsx', lines.join('\n'));
