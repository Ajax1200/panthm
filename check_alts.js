const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let missingCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/<img[^>]*>/g);
  if (matches) {
    matches.forEach(m => {
      if (!/alt\s*=\s*/.test(m)) {
        console.log(`Missing alt in ${file}: ${m.replace(/\n/g, ' ')}`);
        missingCount++;
      }
    });
  }
});
console.log(`Total missing: ${missingCount}`);
