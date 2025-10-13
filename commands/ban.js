const fs = require('fs');
const { channelInfo } = require('../src/lib/messageConfig');

module.exports = {
    info: {
        name: 'ban',
        description: 'Ban a user from using the bot',
        usage: '.ban @user or .ban (reply to message)',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            let userToBan;
            
            // Check for mentioned users
            if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                userToBan = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
            }
            // Check for replied message
            else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
                userToBan = msg.message.extendedTextMessage.contextInfo.participant;
            }
            
            if (!userToBan) {
                await msg.reply('Please mention the user or reply to their message to ban!');
                return { success: true };
            }

            try {
                // Create data directory if it doesn't exist
                if (!fs.existsSync('./data')) {
                    fs.mkdirSync('./data');
                }
                
                // Add user to banned list
                let bannedUsers = [];
                if (fs.existsSync('./data/banned.json')) {
                    bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
                }
                
                if (!bannedUsers.includes(userToBan)) {
                    bannedUsers.push(userToBan);
                    fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
                    
                    await msg.reply(`Successfully banned @${userToBan.split('@')[0]}!`);
                } else {
                    await msg.reply(`${userToBan.split('@')[0]} is already banned!`);
                }
            } catch (error) {
                console.error('Error in ban command:', error);
                await msg.reply('Failed to ban user!');
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error in ban command:', error);
            return { 
                success: false, 
                message: '❌ Error in ban command: ' + error.message 
            };
        }
    }
};
