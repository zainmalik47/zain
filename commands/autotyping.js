/**
 * MazariBot - A WhatsApp Bot
 * Autotyping Command - Shows fake typing status
 */

const fs = require('fs');
const path = require('path');

// Path to store the configuration
const configPath = path.join(__dirname, '..', 'data', 'autotyping.json');

// Initialize configuration file if it doesn't exist
function initConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath));
}

module.exports = {
    info: {
        name: 'autotyping',
        description: 'Toggle auto-typing indicator (show typing status to contacts)',
        usage: '.autotyping [on|off]',
        aliases: ['atyping']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // Get command arguments
            const commandArgs = args || [];
            
            // Initialize or read config
            const config = initConfig();
            
            if (commandArgs.length === 0) {
                const helpText = `⌨️ *Auto-Typing System*

*Usage:*
.autotyping on - Enable auto-typing indicator
.autotyping off - Disable auto-typing indicator

*What it does:*
- Shows typing indicator when someone opens chat
- Detects when contacts are online or typing
- Makes the bot appear active and responsive
- Works with all private contacts

*Current Status:* ${config.enabled ? 'Enabled' : 'Disabled'}
Use .autotyping on/off to toggle`;
                
                await msg.reply(helpText);
                return { success: true };
            }
            
            // Toggle based on argument
            const action = commandArgs[0].toLowerCase();
            if (action === 'on' || action === 'enable') {
                config.enabled = true;
                // Save updated configuration
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await msg.reply('✅ Auto-typing indicator enabled!\n\nBot will now show typing status when someone opens chat or is online.');
                return { success: true, autoTyping: true };
            } else if (action === 'off' || action === 'disable') {
                config.enabled = false;
                // Save updated configuration
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await msg.reply('❌ Auto-typing indicator disabled!\n\nBot will no longer show automatic typing status.');
                return { success: true, autoTyping: false };
            } else {
                await msg.reply('❌ Invalid option! Use:\n.autotyping on - Enable\n.autotyping off - Disable');
                return { success: true };
            }
            
        } catch (error) {
            console.error('Error in autotyping command:', error);
            return { 
                success: false, 
                message: '❌ Error in autotyping command: ' + error.message 
            };
        }
    },

    // Function to check if autotyping is enabled
    isAutotypingEnabled() {
        try {
            const config = initConfig();
            return config.enabled;
        } catch (error) {
            console.error('Error checking autotyping status:', error);
            return false;
        }
    },

    // Function to handle autotyping for regular messages
    async handleAutotypingForMessage(sock, chatId, userMessage) {
        if (this.isAutotypingEnabled()) {
            try {
                // First subscribe to presence updates for this chat
                await sock.presenceSubscribe(chatId);
                
                // Send available status first
                await sock.sendPresenceUpdate('available', chatId);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Then send the composing status
                await sock.sendPresenceUpdate('composing', chatId);
                
                // Simulate typing time based on message length with increased minimum time
                const typingDelay = Math.max(3000, Math.min(8000, userMessage.length * 150));
                await new Promise(resolve => setTimeout(resolve, typingDelay));
                
                // Send composing again to ensure it stays visible
                await sock.sendPresenceUpdate('composing', chatId);
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Finally send paused status
                await sock.sendPresenceUpdate('paused', chatId);
                
                console.log(`⌨️ Auto-typed for message in ${chatId}`);
                return true; // Indicates typing was shown
            } catch (error) {
                console.error('❌ Error sending typing indicator:', error);
                return false; // Indicates typing failed
            }
        }
        return false; // Autotyping is disabled
    },

    // Function to show typing status AFTER command execution
    async showTypingAfterCommand(sock, chatId) {
        if (this.isAutotypingEnabled()) {
            try {
                // This function runs after the command has been executed and response sent
                // So we just need to show a brief typing indicator
                
                // Subscribe to presence updates
                await sock.presenceSubscribe(chatId);
                
                // Show typing status briefly
                await sock.sendPresenceUpdate('composing', chatId);
                
                // Keep typing visible for a short time
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Then pause
                await sock.sendPresenceUpdate('paused', chatId);
                
                console.log(`⌨️ Auto-typed after command in ${chatId}`);
                return true;
            } catch (error) {
                console.error('❌ Error sending post-command typing indicator:', error);
                return false;
            }
        }
        return false; // Autotyping is disabled
    }
};