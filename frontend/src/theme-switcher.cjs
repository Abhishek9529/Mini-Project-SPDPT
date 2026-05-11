const fs = require('fs');
const path = require('path');

const map = {
  // Original Dark Colors -> New Light Colors
  '#1e1e2f': '#ffffff', // Cards, sections
  '#1E1E2F': '#ffffff',
  '#242424': '#f4f6f9', // Root bg
  '#0f172a': '#f8fafc', // Badges, labels bg
  '#0F172A': '#f8fafc',
  '#1e293b': '#e2e8f0', // Hover states, borders, tracks
  '#1E293B': '#e2e8f0',
  '#334155': '#cbd5e1', // Darker borders/tracks
  '#161625': '#ffffff', // MyDay cards
  '#1a1a2e': '#ffffff', // Other dark cards

  // Original Light Colors (mostly text in dark mode) -> Darker Text for light mode
  '#f1f5f9': '#0f172a', // Main headers
  '#F1F5F9': '#0f172a',
  '#e2e8f0': '#1e293b', // Subtext
  '#E2E8F0': '#1e293b',
  '#ffffff': '#ffffff', // We don't want to change the literal white they used initially for some texts, although that might be risky... wait, what if they used #fff?
};

// Also let's fix any occurrences of '#1e1e2f', '#0f172a', '#1e293b' that currently exist
// in the CSS files (which were created by my broken script that swapped things).
// Wait, my broken script basically REVERTED them. So the current state of those hexes represents the state AFTER the script ran.

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith('.css')) {
      results.push(fullPath);
    }
  });
  return results;
}

const cssFiles = walk(path.join(__dirname));

const searchRegex = new RegExp("(" + Object.keys(map).join("|") + ")", "gi");

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Single pass replace to avoid swapping issues
  const newContent = content.replace(searchRegex, (match) => {
    return map[match.toLowerCase()] || match;
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Fixed theme conversion complete!');
