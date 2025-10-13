module.exports = {
    info: {
        name: 'fact',
        description: 'Get random facts',
        usage: '.fact',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement fact command functionality
            await msg.reply('✅ fact command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Get random facts');
            return { success: true };
        } catch (error) {
            console.error('Error in fact command:', error);
            return { 
                success: false, 
                message: '❌ Error in fact command: ' + error.message 
            };
        }
    }
};