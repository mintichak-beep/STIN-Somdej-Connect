const fs = require('fs');
let content = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8');
content = content.replace(/      void 0;\n    }/g, '      void 0;');
fs.writeFileSync('src/components/tabs/TeacherTabs.tsx', content);
