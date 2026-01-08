const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

// Load .env from repo root
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = Number(process.env.PORT) || 5173;

function jsString(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

app.get('/config.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(
    `window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};\n` +
      `window.__APP_CONFIG__.DP_URL = \`${jsString(process.env.DP_URL)}\`;\n` +
      `window.__APP_CONFIG__.KITCHEN_URL = \`${jsString(process.env.KITCHEN_URL)}\`;\n`
  );
});

// Serve the workspace as static files
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`[interface] dev server running at http://localhost:${port}`);
  console.log('[interface] config.js injects DP_URL and KITCHEN_URL from .env');
});
