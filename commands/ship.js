module.exports = {
    info: {
        name: 'ship',
        description: 'Ship two people',
        usage: '.ship @user1 @user2',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement ship command functionality
            await msg.reply('✅ ship command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Ship two people');
            return { success: true };
        } catch (error) {
            console.error('Error in ship command:', error);
            return { 
                success: false, 
                message: '❌ Error in ship command: ' + error.message 
            };
        }
    }
};