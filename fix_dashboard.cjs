const fs = require('fs');
const path = 'src/pages/dashboard/DashboardHome.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /activeTab === "xyz".*?StudentImportCenter.*Access Denied<\/div>/s,
  ''
);
// Remove the leftover `) :  ? (` empty check or whatever
code = code.replace(
  /\) :  \? \(\s*\) : isTeacher \? \(/s,
  ') : isTeacher ? ('
);

fs.writeFileSync(path, code);
