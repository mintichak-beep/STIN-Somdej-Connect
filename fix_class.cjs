const fs = require('fs');

let content = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8');
// Fix missing brace before className
content = content.replace(/(\n\s*})\n(\s*className=")/g, '$1}\n$2');

fs.writeFileSync('src/components/tabs/TeacherTabs.tsx', content);
