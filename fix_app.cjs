const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// For Teacher:
content = content.replace(
  "        case 'welcome-settings':\n          return <WelcomeSettings />;\n        default:",
  "        case 'welcome-settings':\n          return <WelcomeSettings />;\n        case 'announcements':\n          return <Announcements role=\"Teacher\" />;\n        default:"
);

// For Student:
content = content.replace(
  "        case 'my-transportation':\n          return <MyTransportation userId={selectedStudentId} role=\"Student\" />;\n        default:",
  "        case 'my-transportation':\n          return <MyTransportation userId={selectedStudentId} role=\"Student\" />;\n        case 'announcements':\n          return <Announcements role=\"Student\" />;\n        default:"
);

fs.writeFileSync('src/App.tsx', content);
