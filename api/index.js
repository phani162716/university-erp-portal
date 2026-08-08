/**
 * Vercel serverless entry.
 * This folder has package.json with "type": "commonjs" so require() works.
 */
const path = require('path');
const fs = require('fs');

function loadApp() {
  const candidates = [
    path.join(__dirname, '..', 'server', 'dist', 'app.js'),
    path.join(process.cwd(), 'server', 'dist', 'app.js'),
  ];

  let lastErr;
  for (const file of candidates) {
    try {
      if (!fs.existsSync(file)) {
        lastErr = new Error('File not found: ' + file);
        continue;
      }
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const mod = require(file);
      return mod.default || mod;
    } catch (err) {
      lastErr = err;
    }
  }
  console.error('Unable to load Express app. Tried:', candidates, lastErr);
  throw lastErr;
}

module.exports = loadApp();
