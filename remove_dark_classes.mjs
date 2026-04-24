import fs from 'fs';
import path from 'path';

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      if(file === 'node_modules' || file === '.next') continue;
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

  // Regex to remove anything that is dark:[classname] anywhere in the code.
  // We match \s*dark:[^\s'"`]+ to also eat up the surrounding spaces so we don't end up with double spaces.
  content = content.replace(/\s*dark:[a-zA-Z0-9-\/\[\]#]+/g, '');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
}

console.log(`Removed dark classes from ${changedFiles} files globally.`);
