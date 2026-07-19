const fs = require('fs');
let lines = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8').split('\n');

// Find the line with "// Reset Form" and insert closing braces for handleAssignRoom
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('// Reset Form') && lines[i-1] === '') {
    // lines[i-2] is void 0;
    lines.splice(i, 0, '    }', '  };', '', '  const handleGenerateBills = (e: any) => {', '    e.preventDefault();');
    break;
  }
}
fs.writeFileSync('src/components/tabs/TeacherTabs.tsx', lines.join('\n'));
