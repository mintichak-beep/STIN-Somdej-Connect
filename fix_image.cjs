const fs = require('fs');

let content = fs.readFileSync('src/pages/WelcomePage.tsx', 'utf8');

// Replace mock image
content = content.replace(
  /appSettings\?\.loginImageUrl \|\| settings\.medicalIllustration \|\| "\/src\/assets\/images\/medical_premium_background_1784633086843\.jpg"/g,
  'appSettings?.loginImageUrl'
);

fs.writeFileSync('src/pages/WelcomePage.tsx', content);
