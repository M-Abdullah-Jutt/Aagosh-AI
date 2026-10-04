import fs from 'fs';
import path from 'path';

const filePaths = [
  path.join(process.cwd(), 'node_modules', 'simli-client', 'dist', 'index.js'),
  path.join(process.cwd(), 'node_modules', 'simli-client', 'dist', 'index.d.ts')
];

for (const filePath of filePaths) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/\.\/Client/g, './client');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${filePath}`);
  }
}
