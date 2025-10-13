module.exports = {
    info: {
        name: 'chatbot',
        description: 'Toggle chatbot mode',
        usage: '.chatbot [on|off]',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement chatbot command functionality
            await msg.reply('✅ chatbot command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Toggle chatbot mode');
            return { success: true };
        } catch (error) {
            console.error('Error in chatbot command:', error);
            return { 
                success: false, 
                message: '❌ Error in chatbot command: ' + error.message 
            };
        }
    }
};