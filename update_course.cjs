const fs = require('fs');

const path = 'src/services/course.service.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { auditService }')) {
  code = code.replace(
    "import { Course } from '../types/db';",
    "import { Course } from '../types/db';\nimport { auditService } from './audit.service';\n\nfunction getCurrentUserId(): string {\n  try {\n    const user = localStorage.getItem('cpatms_user');\n    return user ? JSON.parse(user).uid : 'system';\n  } catch {\n    return 'system';\n  }\n}"
  );
}

// In create
code = code.replace(
  'mockDB.saveCourses(list);\n    return newCourse;',
  'mockDB.saveCourses(list);\n    await auditService.log(getCurrentUserId(), "CREATE", "Course", newCourse.id, "Created course");\n    return newCourse;'
);

// In update
code = code.replace(
  'mockDB.saveCourses(list);\n    return updated;',
  'mockDB.saveCourses(list);\n    await auditService.log(getCurrentUserId(), "UPDATE", "Course", id, "Updated course");\n    return updated;'
);

fs.writeFileSync(path, code);
