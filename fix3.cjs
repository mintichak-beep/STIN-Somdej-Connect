const fs = require('fs');
const path = 'src/pages/dashboard/DashboardHome.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'isTeacher ? <SystemActivityLog /> : <div>Access Denied</div>\n      ) : \n      ) : isTeacher ? (',
  'isTeacher ? <SystemActivityLog /> : <div>Access Denied</div>\n      ) : isTeacher ? ('
);

fs.writeFileSync(path, code);
