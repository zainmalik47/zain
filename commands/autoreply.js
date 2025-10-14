const fs = require('fs');
const path = require('path');

module.exports = {
    info: {
        name: 'autoreply',
        description: 'Toggle auto-reply feature',
        usage: '.autoreply [on|off]',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            const configPath = path.join(__dirname, '../src/config.json');
            
            // Load current config
            let config = {};
            if (fs.existsSync(configPath)) {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
            
            if (args.length === 0) {
                const status = config.autoReply ? 'ON' : 'OFF';
                await msg.reply(`📱 Auto-reply is currently: *${status}*\n\nUse: .autoreply on/off to toggle`);
                return { success: true };
            }
            
            const action = args[0].toLowerCase();
            
            if (action === 'on' || action === 'enable') {
                config.autoReply = true;
                await msg.reply('✅ Auto-reply enabled!\nBot will now send automatic replies to incoming messages.');
            } else if (action === 'off' || action === 'disable') {
                config.autoReply = false;
                await msg.reply('❌ Auto-reply disabled!\nBot will no longer send automatic replies.');
            } else {
                await msg.reply('❌ Invalid option!\nUse: .autoreply on/off');
                return { success: true };
            }
            
            // Save updated config
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            
            return { success: true };
        } catch (error) {
            console.error('Error in autoreply command:', error);
            return { 
                success: false, 
                message: '❌ Error in autoreply command: ' + error.message 
            };
        }
    }
};