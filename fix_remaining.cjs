const fs = require('fs');

function fixMock(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/mockDB\.[A-Za-z0-9_]+/g, '[]');
  fs.writeFileSync(filePath, content);
}

fixMock('src/components/tabs/StudentTabs.tsx');
fixMock('src/components/tabs/TeacherTabs.tsx');
fixMock('src/services/studentImport.service.ts');
