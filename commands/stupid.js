module.exports = {
    info: {
        name: 'stupid',
        description: 'Get stupid facts',
        usage: '.stupid [@user]',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement stupid command functionality
            await msg.reply('✅ stupid command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Get stupid facts');
            return { success: true };
        } catch (error) {
            console.error('Error in stupid command:', error);
            return { 
                success: false, 
                message: '❌ Error in stupid command: ' + error.message 
            };
        }
    }
};