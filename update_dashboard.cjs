const fs = require('fs');
const path = 'src/pages/dashboard/DashboardHome.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { SystemActivityLog }')) {
  code = code.replace(
    'import { ReportsCenter } from "../ReportsCenter";',
    'import { ReportsCenter } from "../ReportsCenter";\nimport { SystemActivityLog } from "../SystemActivityLog";'
  );
  
  code = code.replace(
    'activeTab === "import-students" ? (',
    'activeTab === "import-students" ? (\n        isTeacher ? <StudentImportCenter /> : <div>Access Denied</div>\n      ) : activeTab === "activity-log" ? (\n        isTeacher ? <SystemActivityLog /> : <div>Access Denied</div>\n      ) : activeTab === "xyz" ? ('
  );
}
fs.writeFileSync(path, code);
