const fs = require('fs');

const path = 'src/services/hospital.service.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import { auditService }')) {
  code = code.replace(
    "import { Hospital } from '../types/db';",
    "import { Hospital } from '../types/db';\nimport { auditService } from './audit.service';"
  );
}

// In create
code = code.replace(
  'mockDB.saveHospitals(list);\n\n    mockDB.addActivity({',
  'mockDB.saveHospitals(list);\n    await auditService.log(userId, "CREATE", "Hospital", newHospital.id, "Created hospital");\n\n    mockDB.addActivity({'
);

// In update
code = code.replace(
  'mockDB.saveHospitals(list);\n\n    return updatedHospital;',
  'mockDB.saveHospitals(list);\n    await auditService.log(userId, "UPDATE", "Hospital", id, "Updated hospital profile");\n\n    return updatedHospital;'
);

// In delete
code = code.replace(
  'mockDB.saveHospitals(filtered);\n  }',
  'mockDB.saveHospitals(filtered);\n    await auditService.log(userId, "DELETE", "Hospital", id, "Deleted hospital");\n  }'
);

fs.writeFileSync(path, code);
