module.exports = {
    info: {
        name: 'alive',
        description: 'Check if bot is alive',
        usage: '.alive',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement alive command functionality
            await msg.reply('✅ alive command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Check if bot is alive');
            return { success: true };
        } catch (error) {
            console.error('Error in alive command:', error);
            return { 
                success: false, 
                message: '❌ Error in alive command: ' + error.message 
            };
        }
    }
};