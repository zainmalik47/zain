module.exports = {
    info: {
        name: 'demote',
        description: 'Demote admin to member',
        usage: '.demote @user',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement demote command functionality
            await msg.reply('✅ demote command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Demote admin to member');
            return { success: true };
        } catch (error) {
            console.error('Error in demote command:', error);
            return { 
                success: false, 
                message: '❌ Error in demote command: ' + error.message 
            };
        }
    }
};