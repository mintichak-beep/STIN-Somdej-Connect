const fs = require('fs');
const glob = require('glob'); // Note: we can use simple fs methods instead of glob to avoid missing deps

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = dir + '/' + f;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      callback(dirPath);
    }
  });
}

walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Remove import
  content = content.replace(/import\s*\{\s*mockDB\s*\}\s*from\s*['"].*mockData['"];?\n?/g, '');
  
  // Replace mockDB.getXXX() with []
  content = content.replace(/mockDB\.get[A-Za-z0-9_]+\s*\(\s*\)/g, '[]');
  
  // Replace mockDB.saveXXX(...) with void 0
  content = content.replace(/mockDB\.save[A-Za-z0-9_]+\s*\([^)]*\)/g, 'void 0');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
});
