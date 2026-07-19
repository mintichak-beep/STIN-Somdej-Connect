const fs = require('fs');
const path = 'src/components/AppLayout.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /Settings, Users,?\s*/,
  'Settings, Users, Shield, '
);
fs.writeFileSync(path, code);
