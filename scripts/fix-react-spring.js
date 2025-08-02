const fs = require('fs');
const path = require('path');

// Path to react-spring dist folder
const distPath = path.join(__dirname, '..', 'node_modules', 'react-spring', 'dist');
const cjsDir = path.join(distPath, 'cjs');
const srcFile = path.join(distPath, 'react-spring.cjs.js');
const destFile = path.join(cjsDir, 'index.js');

try {
  if (!fs.existsSync(cjsDir)) {
    fs.mkdirSync(cjsDir);
  }
  if (!fs.existsSync(destFile) && fs.existsSync(srcFile)) {
    fs.writeFileSync(destFile, "module.exports = require('../react-spring.cjs.js');\n");
    console.log('[fix-react-spring] created dist/cjs/index.js shim');
  }
} catch (err) {
  console.warn('[fix-react-spring] unable to create shim:', err.message);
} 