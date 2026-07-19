const fs = require('fs');
const path = 'src/components/AppLayout.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('{ id: "activity-log"')) {
  code = code.replace(
    '{ id: "import-students", label: "Student Import", icon: FileText },',
    '{ id: "import-students", label: "Student Import", icon: FileText },\n    { id: "activity-log", label: "System Activity Log", icon: Shield },'
  );
  
  if (!code.includes('Shield')) {
    code = code.replace(
      'Settings, Users',
      'Settings, Users, Shield'
    );
  }
}
fs.writeFileSync(path, code);
