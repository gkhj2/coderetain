#!/usr/bin/env node
// Manual expo launcher for CodeRetain
const { execSync } = require('child_process');
const path = require('path');

process.chdir(path.resolve(__dirname));
const cli = path.join(__dirname, 'node_modules', 'expo', 'build', 'Expo.js');
const cliAlt = path.join(__dirname, 'node_modules', 'expo', 'AppEntry.js');

// Try to find the expo CLI entry
const fs = require('fs');
const candidates = [
  'node_modules/expo/Expo.js',
  'node_modules/expo/AppEntry.js',
  'node_modules/@expo/cli/build/bin/cli',
];

let found = false;
for (const c of candidates) {
  const full = path.join(__dirname, c);
  if (fs.existsSync(full)) {
    console.log(`Found: ${c}`);
    found = true;
  }
}

if (!found) {
  // Expo SDK 56 uses @expo/cli
  const entries = fs.readdirSync('node_modules/@expo/cli/build/bin/');
  console.log('Available in @expo/cli/bin:', entries);
}
