const fs = require('fs');
let content = fs.readFileSync('src/pages/WelcomePage.tsx', 'utf8');

// Replace AssetImage with regular img and only show if loginImageUrl exists
content = content.replace(
  /<AssetImage\s*src=\{appSettings\?\.loginImageUrl\}\s*alt="Medical Illustrations"\s*className="max-w-\[100%\] max-h-\[100%\] object-contain drop-shadow-lg"\s*\/>/g,
  '{appSettings?.loginImageUrl && <img src={appSettings.loginImageUrl} alt="Login Image" className="max-w-[100%] max-h-[100%] object-contain drop-shadow-lg" />}'
);

content = content.replace(
  /<AssetImage\s*src=\{appSettings\?\.loginImageUrl\}\s*alt="Medical Illustrations"\s*className="max-w-\[100%\] w-\[100%\] max-h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-1000"\s*\/>/g,
  '{appSettings?.loginImageUrl && <img src={appSettings.loginImageUrl} alt="Login Image" className="max-w-[100%] w-[100%] max-h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-1000" />}'
);

fs.writeFileSync('src/pages/WelcomePage.tsx', content);
