const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const distIndex = path.join(root, 'dist', 'index.html');
const androidIndex = path.join(root, 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html');

function fail(msg) {
  console.error(`Android asset validation failed: ${msg}`);
  process.exit(1);
}

function getRefs(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const refs = [];

  const regex = /(?:src|href)=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const value = match[1];
    if (!value || value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//') || value.startsWith('mailto:')) {
      continue;
    }
    refs.push(value);
  }

  return refs;
}

function ensureExists(filePath, label) {
  if (!fs.existsSync(filePath)) {
    fail(`${label} is missing: ${filePath}`);
  }
}

function ensureRelativeAssets(filePath, label) {
  const refs = getRefs(filePath);
  const bad = refs.filter((ref) => ref.startsWith('/') || ref.startsWith('./') === false && ref.startsWith('../') === false && ref.startsWith('assets/') === false);
  if (bad.length) {
    fail(`${label} contains incorrect asset URLs: ${bad.join(', ')}`);
  }
}

ensureExists(distIndex, 'dist/index.html');
ensureExists(androidIndex, 'android generated index.html');

ensureRelativeAssets(distIndex, 'dist/index.html');
ensureRelativeAssets(androidIndex, 'android generated index.html');

for (const filePath of [distIndex, androidIndex]) {
  const refs = getRefs(filePath);
  for (const ref of refs) {
    const resolved = ref.startsWith('/') ? path.join(root, ref.replace(/^\//, '')) : path.join(path.dirname(filePath), ref);
    if (!fs.existsSync(resolved)) {
      fail(`Referenced asset does not exist: ${ref} (${resolved})`);
    }
  }
}

console.log('Android asset validation passed: generated index files and referenced assets are valid.');
