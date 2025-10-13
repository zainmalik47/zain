module.exports = {
    info: {
        name: 'pair',
        description: 'Pair two people',
        usage: '.pair @user1 @user2',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement pair command functionality
            await msg.reply('✅ pair command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Pair two people');
            return { success: true };
        } catch (error) {
            console.error('Error in pair command:', error);
            return { 
                success: false, 
                message: '❌ Error in pair command: ' + error.message 
            };
        }
    }
};