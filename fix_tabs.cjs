const fs = require('fs');

let content = fs.readFileSync('src/components/tabs/TeacherTabs.tsx', 'utf8');

// Replace these broken fragments
// 1. void 0 followed by random text, then userId, userDisplayName, });
content = content.replace(/void 0[\s\S]*?userId: "admin-123",\s*userDisplayName: "STIN Lead Teacher",\s*}\);/g, 'void 0;');

// 2. Also look for `void 0` that is followed by `);` or `});` but with syntax errors inside.
// Wait, is there any other broken thing?
fs.writeFileSync('src/components/tabs/TeacherTabs.tsx', content);
