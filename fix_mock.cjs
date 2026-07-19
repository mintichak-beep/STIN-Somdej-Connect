const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = dir + '/' + f;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') {
        walkDir(dirPath, callback);
      }
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      callback(dirPath);
    }
  });
}

walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Remove import mockDB line exactly
  const lines = content.split('\n');
  const filteredLines = lines.filter(line => !line.includes('mockData'));
  content = filteredLines.join('\n');
  
  // Replace mockDB.getXXX() with []
  content = content.replace(/mockDB\.get[A-Za-z0-9_]+\s*\(\s*\)/g, '[]');
  
  // Replace mockDB.saveXXX(...) with void 0
  content = content.replace(/mockDB\.save[A-Za-z0-9_]+\s*\([^)]*\)/g, 'void 0');

  // Replace mockDB.addXXX(...) with void 0
  content = content.replace(/mockDB\.add[A-Za-z0-9_]+\s*\([^)]*\)/g, 'void 0');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed', filePath);
  }
});
