const fs = require('fs');

const path = 'src/services/practiceGroup.service.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { auditService }')) {
  code = code.replace(
    "import { PracticeGroup, Student } from '../types/db';",
    "import { PracticeGroup, Student } from '../types/db';\nimport { auditService } from './audit.service';\n\nfunction getCurrentUserId(): string {\n  try {\n    const user = localStorage.getItem('cpatms_user');\n    return user ? JSON.parse(user).uid : 'system';\n  } catch {\n    return 'system';\n  }\n}"
  );
}

// In create
code = code.replace(
  'mockDB.savePracticeGroups(list);\n    return newGroup;',
  'mockDB.savePracticeGroups(list);\n    await auditService.log(getCurrentUserId(), "CREATE", "PracticeGroup", newGroup.id, "Created practice group");\n    return newGroup;'
);

// In update
code = code.replace(
  'mockDB.savePracticeGroups(list);\n    return updated;',
  'mockDB.savePracticeGroups(list);\n    await auditService.log(getCurrentUserId(), "UPDATE", "PracticeGroup", id, "Updated practice group");\n    return updated;'
);

// In delete
code = code.replace(
  'mockDB.savePracticeGroups(filtered);\n  }',
  'mockDB.savePracticeGroups(filtered);\n    await auditService.log(getCurrentUserId(), "DELETE", "PracticeGroup", id, "Deleted practice group");\n  }'
);

fs.writeFileSync(path, code);
