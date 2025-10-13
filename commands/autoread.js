module.exports = {
    info: {
        name: 'autoread',
        description: 'Toggle auto-read messages (automatically mark messages as read)',
        usage: '.autoread [on|off]',
        aliases: ['aread']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            if (!args || args.length === 0) {
                const helpText = `📖 *Auto-Read System*

*Usage:*
.autoread on - Enable auto-read messages
.autoread off - Disable auto-read messages

*What it does:*
- Automatically marks incoming messages as read (shows blue ticks)
- Works for private chats only (not groups)
- Instantly reads messages from others

*Current Status:* Use .autoread on/off to toggle`;
                
                await msg.reply(helpText);
                return { success: true };
            }

            const command = args[0].toLowerCase();

            switch (command) {
                case 'on':
                    await msg.reply('✅ Auto-read messages enabled!\n\nBot will now automatically mark incoming messages as read (show blue ticks) in private chats.');
                    return { 
                        success: true,
                        autoRead: true
                    };

                case 'off':
                    await msg.reply('❌ Auto-read messages disabled!\n\nBot will no longer automatically mark messages as read.');
                    return { 
                        success: true,
                        autoRead: false
                    };

                default:
                    await msg.reply('❌ Invalid option! Use:\n.autoread on - Enable\n.autoread off - Disable');
                    return { success: true };
            }
        } catch (error) {
            console.error('Error in autoread command:', error);
            return { 
                success: false, 
                message: '❌ Error in autoread command: ' + error.message 
            };
        }
    }
};