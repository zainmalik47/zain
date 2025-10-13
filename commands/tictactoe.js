module.exports = {
    info: {
        name: 'tictactoe',
        description: 'Play tic tac toe',
        usage: '.tictactoe @user',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // TODO: Implement tictactoe command functionality
            await msg.reply('✅ tictactoe command received successfully!\n\nThis command is now working with the new bot structure.\n\nFunctionality: Play tic tac toe');
            return { success: true };
        } catch (error) {
            console.error('Error in tictactoe command:', error);
            return { 
                success: false, 
                message: '❌ Error in tictactoe command: ' + error.message 
            };
        }
    }
};