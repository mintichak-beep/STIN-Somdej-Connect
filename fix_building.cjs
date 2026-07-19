const fs = require('fs');
let content = fs.readFileSync('src/services/building.service.ts', 'utf8');

content = content.replace(/void 0 was successfully registered\.`,\n\s*userId,\n\s*userDisplayName: 'Administrator',\n\s*}\);/g, 'void 0;');
// Look for other broken template literals.
// Wait, is there any other mockDB.addActivity?
content = content.replace(/void 0 \(Duplicate of \${original\.buildingName}\) has been created\.`,\n\s*userId,\n\s*userDisplayName: 'Administrator',\n\s*}\);/g, 'void 0;');
// Let's replace anything that looks like `void 0 something` with `void 0;` up to the closing `});`
content = content.replace(/void 0[^}]*}\);/g, 'void 0;');

fs.writeFileSync('src/services/building.service.ts', content);
