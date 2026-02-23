#!/usr/bin/env node
/**
 * Cross-platform pre-dev script to kill processes on ports 3000 and 8000
 * Works on macOS, Linux, and Windows
 */

const { execSync } = require('child_process');
const platform = process.platform;

function killProcessOnPort(port) {
  try {
    if (platform === 'win32') {
      // Windows: netstat -ano | findstr :PORT | findstr LISTENING
      const result = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8' });
      const match = result.match(/(\d+)\s*$/m);
      if (match) {
        execSync(`taskkill /F /PID ${match[1]}`, { stdio: 'ignore' });
        console.log(`Killed process on port ${port} (PID: ${match[1]})`);
      }
    } else {
      // macOS/Linux: lsof -ti :PORT
      const pid = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
      if (pid) {
        execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        console.log(`Killed process on port ${port} (PID: ${pid})`);
      }
    }
  } catch (e) {
    // No process found on this port, which is fine
  }
}

killProcessOnPort(3000);
killProcessOnPort(8000);
