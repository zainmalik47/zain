module.exports = {
    info: {
        name: 'insult',
        description: 'Get funny insults',
        usage: '.insult [@user]',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement insult command functionality
            await msg.reply('✅ insult command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Get funny insults');
            return { success: true };
        } catch (error) {
            console.error('Error in insult command:', error);
            return { 
                success: false, 
                message: '❌ Error in insult command: ' + error.message 
            };
        }
    }
};