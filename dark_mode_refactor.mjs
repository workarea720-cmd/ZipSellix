import fs from 'fs';
import path from 'path';

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
}

const files = walkSync('./src');
console.log(`Found ${files.length} ts/tsx files.`);

let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Backgrounds
  content = content.replace(/\bbg-white\b/g, 'bg-card-bg');
  content = content.replace(/\bbg-slate-50\b/g, 'bg-bg-subtle');
  content = content.replace(/\bbg-slate-100\b/g, 'bg-bg-muted');

  // Text
  content = content.replace(/\btext-slate-900\b/g, 'text-text-main');
  content = content.replace(/\btext-slate-800\b/g, 'text-text-main');
  content = content.replace(/\btext-slate-700\b/g, 'text-text-main');
  content = content.replace(/\btext-slate-600\b/g, 'text-text-muted');
  content = content.replace(/\btext-slate-500\b/g, 'text-text-muted');
  content = content.replace(/\btext-slate-400\b/g, 'text-text-muted-light');

  // Borders
  content = content.replace(/\bborder-slate-200\b/g, 'border-card-border');
  content = content.replace(/\bborder-slate-100\b/g, 'border-card-border-subtle');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
}

console.log(`Updated ${changedFiles} files with semantic tokens.`);
