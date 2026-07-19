const fs = require('fs');

let content = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8');

content = content.replace(/setIsGroupFormOpen\(true\);\n\s*}/g, 'setIsGroupFormOpen(true);');
content = content.replace(/setIsGroupFormOpen\(false\);\n\s*}/g, 'setIsGroupFormOpen(false);');

fs.writeFileSync('src/components/tabs/TeacherTabs.tsx', content);
