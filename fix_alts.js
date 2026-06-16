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

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match <img but avoid cases where alt= is already on the same or next few lines. 
  // It's safer to just do a simple replacement if the <img tag is closed on the same line and has no alt.
  // Actually, a simpler way is: replace `<img` with `<img alt=""` only if `alt=` doesn't exist before `>`
  
  // A robust regex to find <img ... >
  let newContent = content.replace(/<img([^>]*?)>/g, (match, attrs) => {
    if (!/alt\s*=\s*/i.test(attrs)) {
      return `<img alt=""${attrs}>`;
    }
    return match;
  });

  // Also handle self-closing <img ... />
  newContent = newContent.replace(/<img([^>]*?)\/>/g, (match, attrs) => {
    if (!/alt\s*=\s*/i.test(attrs)) {
      return `<img alt=""${attrs}/>`;
    }
    return match;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
