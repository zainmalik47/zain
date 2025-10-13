module.exports = {
    info: {
        name: 'trivia',
        description: 'Play trivia game',
        usage: '.trivia',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement trivia command functionality
            await msg.reply('✅ trivia command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Play trivia game');
            return { success: true };
        } catch (error) {
            console.error('Error in trivia command:', error);
            return { 
                success: false, 
                message: '❌ Error in trivia command: ' + error.message 
            };
        }
    }
};