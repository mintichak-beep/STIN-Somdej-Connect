const fs = require('fs');
const path = 'src/pages/dashboard/DashboardHome.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /) : \n      \) : isTeacher \? \(/s,
  ') : isTeacher ? ('
);

fs.writeFileSync(path, code);
