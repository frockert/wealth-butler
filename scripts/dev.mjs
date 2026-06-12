import { spawn } from 'node:child_process';

const API_PORT = process.env.PORT || 3001;
const HEALTH_URL = `http://127.0.0.1:${API_PORT}/health`;
const isWin = process.platform === 'win32';

const children = [];
let shuttingDown = false;

function run(command, args, label) {
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: isWin,
    env: process.env,
  });

  child.on('exit', (code) => {
    if (shuttingDown) return;
    if (code !== 0 && code !== null) {
      console.error(`[${label}] exited with code ${code}`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 100);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function waitForServer() {
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(HEALTH_URL);
      if (res.ok) return true;
    } catch {
      /* retry */
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return false;
}

console.log('Starting API server…');
run('node', ['server/index.js'], 'api');

const ready = await waitForServer();
if (ready) {
  console.log(`API ready at http://localhost:${API_PORT}`);
} else {
  console.warn('API did not respond in time — Vite will start anyway');
}

console.log('Starting Vite…');
run('npx', ['vite'], 'vite');
