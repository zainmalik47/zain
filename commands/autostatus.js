module.exports = {
    info: {
        name: 'autostatus',
        description: 'Toggle auto-status viewing (automatically view saved contact statuses)',
        usage: '.autostatus [on|off]',
        aliases: ['astatus']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            if (!args || args.length === 0) {
                const helpText = `📱 *Auto-Status System*

*Usage:*
.autostatus on - Enable auto-status viewing
.autostatus off - Disable auto-status viewing

*What it does:*
- Automatically views status updates from saved contacts
- Checks for new statuses every 30 seconds
- Marks statuses as seen automatically

*Current Status:* Use .autostatus on/off to toggle`;
                
                await msg.reply(helpText);
                return { success: true };
            }

            const command = args[0].toLowerCase();

            switch (command) {
                case 'on':
                    await msg.reply('✅ Auto-status viewing enabled!\n\nBot will now automatically view status updates from saved contacts every 30 seconds.');
                    return { 
                        success: true,
                        autoStatusSeen: true
                    };

                case 'off':
                    await msg.reply('❌ Auto-status viewing disabled!\n\nBot will no longer automatically view status updates.');
                    return { 
                        success: true,
                        autoStatusSeen: false
                    };

                default:
                    await msg.reply('❌ Invalid option! Use:\n.autostatus on - Enable\n.autostatus off - Disable');
                    return { success: true };
            }
        } catch (error) {
            console.error('Error in autostatus command:', error);
            return { 
                success: false, 
                message: '❌ Error in autostatus command: ' + error.message 
            };
        }
    }
};