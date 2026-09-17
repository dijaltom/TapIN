const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '../node_modules/react-native-gesture-handler/package.json');

try {
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.codegenConfig) {
      delete pkg.codegenConfig;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      console.log('Successfully disabled codegen for react-native-gesture-handler');
    }
  }
} catch (e) {
  console.error('Failed to patch react-native-gesture-handler:', e);
}
