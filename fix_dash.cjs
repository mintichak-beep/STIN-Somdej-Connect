const fs = require('fs');
let content = fs.readFileSync('src/services/dashboard.service.ts', 'utf8');

// The original dashboard.service.ts had issues
content = content.replace(/void 0 was added successfully\.`,\n\s*userId: actorId,\n\s*userDisplayName: actorName\n\s*}\);/g, 'void 0;');
content = content.replace(/void 0 assigned to room \${roomId}\.`,\n\s*userId: actorId,\n\s*userDisplayName: actorName\n\s*}\);/g, 'void 0;');
// Look for any other `void 0` that is followed by weird stuff
fs.writeFileSync('src/services/dashboard.service.ts', content);
