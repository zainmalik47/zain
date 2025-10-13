#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🤖 Starting MazariBot...\n');

// Check if we're in the right directory
if (!require('fs').existsSync('src/index.js')) {
    console.error('❌ Please run this script from the MazariBot root directory');
    process.exit(1);
}

// Start the bot
const botProcess = spawn('node', ['src/index.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

// Handle process events
botProcess.on('close', (code) => {
    if (code === 0) {
        console.log('\n✅ Bot stopped gracefully');
    } else {
        console.log(`\n❌ Bot stopped with error code: ${code}`);
    }
});

botProcess.on('error', (error) => {
    console.error('❌ Failed to start bot:', error.message);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping bot...');
    botProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping bot...');
    botProcess.kill('SIGTERM');
});
