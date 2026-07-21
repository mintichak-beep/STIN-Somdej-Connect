const fs = require('fs');
let content = fs.readFileSync('src/pages/WelcomePage.tsx', 'utf8');

const s1 = `<AssetImage \n              src={appSettings?.loginImageUrl} \n              alt="Medical Illustrations" \n              className="max-w-[100%] max-h-[100%] object-contain drop-shadow-lg" \n              fallbackType="medical_bg"\n            />`;

const r1 = `{appSettings?.loginImageUrl && <img src={appSettings.loginImageUrl} alt="Login Image" className="max-w-[100%] max-h-[100%] object-contain drop-shadow-lg" />}`;

const s2 = `<AssetImage \n            src={appSettings?.loginImageUrl} \n            alt="Medical Illustrations" \n            className="max-w-[100%] w-[100%] max-h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-1000" \n            fallbackType="medical_bg"\n          />`;

const r2 = `{appSettings?.loginImageUrl && <img src={appSettings.loginImageUrl} alt="Login Image" className="max-w-[100%] w-[100%] max-h-full object-contain drop-shadow-2xl animate-in zoom-in-95 duration-1000" />}`;

content = content.replace(s1, r1);
content = content.replace(s2, r2);

fs.writeFileSync('src/pages/WelcomePage.tsx', content);
