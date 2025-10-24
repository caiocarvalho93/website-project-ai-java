#!/usr/bin/env node

// 🤖 CAI STARTUP SCRIPT - Start the Custom AI Assistant Server
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Starting CAI - Custom AI Assistant Server...');
console.log('📁 Working directory:', __dirname);

// Start the CAI server
const caiServer = spawn('node', ['backend/cai/cai-server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

caiServer.on('error', (error) => {
  console.error('🚨 Failed to start CAI server:', error);
  process.exit(1);
});

caiServer.on('close', (code) => {
  console.log(`🤖 CAI server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down CAI server...');
  caiServer.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminating CAI server...');
  caiServer.kill('SIGTERM');
});