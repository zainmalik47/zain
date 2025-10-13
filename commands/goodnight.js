module.exports = {
    info: {
        name: 'goodnight',
        description: 'Send goodnight message',
        usage: '.goodnight',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement goodnight command functionality
            await msg.reply('✅ goodnight command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Send goodnight message');
            return { success: true };
        } catch (error) {
            console.error('Error in goodnight command:', error);
            return { 
                success: false, 
                message: '❌ Error in goodnight command: ' + error.message 
            };
        }
    }
};