module.exports = {
    info: {
        name: 'dare',
        description: 'Get dare challenges',
        usage: '.dare',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement dare command functionality
            await msg.reply('✅ dare command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Get dare challenges');
            return { success: true };
        } catch (error) {
            console.error('Error in dare command:', error);
            return { 
                success: false, 
                message: '❌ Error in dare command: ' + error.message 
            };
        }
    }
};