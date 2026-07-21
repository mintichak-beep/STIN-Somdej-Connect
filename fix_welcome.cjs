const fs = require('fs');

let content = fs.readFileSync('src/pages/WelcomePage.tsx', 'utf8');

// Add import
content = content.replace(
  'import { welcomeSettingsService } from "../services/welcomeSettings.service";',
  'import { welcomeSettingsService } from "../services/welcomeSettings.service";\nimport { appSettingsService, AppSettings } from "../services/appSettings.service";'
);

// Add state
content = content.replace(
  '  const [settings, setSettings] = useState<Record<string, string>>({});',
  '  const [settings, setSettings] = useState<Record<string, string>>({});\n  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);'
);

// Add effect
content = content.replace(
  '    return () => unsubscribe();\n  }, []);',
  '    return () => unsubscribe();\n  }, []);\n\n  useEffect(() => {\n    const fetchAppSet = async () => {\n      const set = await appSettingsService.getSettings();\n      setAppSettings(set);\n    };\n    fetchAppSet();\n  }, []);'
);

// Replace mock image
content = content.replace(
  /settings\.medicalIllustration \|\| "\/src\/assets\/images\/medical_premium_background_1784633086843\.jpg"/g,
  'appSettings?.loginImageUrl || settings.medicalIllustration || "/src/assets/images/medical_premium_background_1784633086843.jpg"'
);

fs.writeFileSync('src/pages/WelcomePage.tsx', content);
