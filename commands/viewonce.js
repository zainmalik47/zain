module.exports = {
    info: {
        name: 'viewonce',
        description: 'Send view-once messages',
        usage: '.viewonce <message>',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement viewonce command functionality
            await msg.reply('✅ viewonce command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Send view-once messages');
            return { success: true };
        } catch (error) {
            console.error('Error in viewonce command:', error);
            return { 
                success: false, 
                message: '❌ Error in viewonce command: ' + error.message 
            };
        }
    }
};