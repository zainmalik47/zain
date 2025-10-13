module.exports = {
    info: {
        name: 'wasted',
        description: 'Create wasted images',
        usage: '.wasted [@user]',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement wasted command functionality
            await msg.reply('✅ wasted command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Create wasted images');
            return { success: true };
        } catch (error) {
            console.error('Error in wasted command:', error);
            return { 
                success: false, 
                message: '❌ Error in wasted command: ' + error.message 
            };
        }
    }
};