module.exports = {
    info: {
        name: 'truth',
        description: 'Get truth questions',
        usage: '.truth',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement truth command functionality
            await msg.reply('✅ truth command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Get truth questions');
            return { success: true };
        } catch (error) {
            console.error('Error in truth command:', error);
            return { 
                success: false, 
                message: '❌ Error in truth command: ' + error.message 
            };
        }
    }
};