// Production web build. Refuses to run without EXPO_PUBLIC_API_URL, so a deploy can never
// ship a bundle that falls back to http://localhost:8787 (src/api/config.ts).
const { spawnSync } = require('node:child_process');

const url = process.env.EXPO_PUBLIC_API_URL;
if (!url || /localhost|127\.0\.0\.1/.test(url)) {
  console.error(
    'build:web needs EXPO_PUBLIC_API_URL set to the deployed worker URL (not localhost).\n' +
      'Example: EXPO_PUBLIC_API_URL=https://api.lattefinance.app npm run build:web',
  );
  process.exit(1);
}

const result = spawnSync('npx', ['expo', 'export', '--platform', 'web'], { stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(result.status ?? 1);
