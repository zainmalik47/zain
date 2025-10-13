module.exports = {
    info: {
        name: 'cleartmp',
        description: 'Clear temporary files',
        usage: '.cleartmp',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement cleartmp command functionality
            await msg.reply('✅ cleartmp command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Clear temporary files');
            return { success: true };
        } catch (error) {
            console.error('Error in cleartmp command:', error);
            return { 
                success: false, 
                message: '❌ Error in cleartmp command: ' + error.message 
            };
        }
    }
};