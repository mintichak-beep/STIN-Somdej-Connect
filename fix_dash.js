const fs = require('fs');

let content = fs.readFileSync('src/services/dashboard.service.ts', 'utf8');

// The regex replaced `mockDB.add...(` up to `)`. Wait, no, it stopped at the first `)`.
// We can just find all syntax errors manually in those 4 files. 
// For dashboard.service.ts:
content = content.replace(/void 0 was added successfully\.`,\n\s*userId: actorId,\n\s*userDisplayName: actorName\n\s*}\);/g, 'void 0;');
content = content.replace(/void 0 assigned to room \${roomId}\.`,\n\s*userId: actorId,\n\s*userDisplayName: actorName\n\s*}\);/g, 'void 0;');

fs.writeFileSync('src/services/dashboard.service.ts', content);
