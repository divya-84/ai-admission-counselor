import fs from 'fs';
import path from 'path';

const srcPath = path.resolve('src/config/admin_settings.json');
const destDir = path.resolve('dist/config');
const destPath = path.join(destDir, 'admin_settings.json');

try {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(srcPath, destPath);
  console.info('Successfully copied admin_settings.json to dist/config');
} catch (err) {
  console.error('Failed to copy admin_settings.json:', err);
  process.exit(1);
}
