// Alternative tagall command without admin restrictions
module.exports = {
    info: {
        name: 'tagall-simple',
        description: 'Tag all group members (no admin restriction)',
        usage: '.tagall-simple <message>',
        aliases: ['tagalls', 'mentionalls']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // Check if it's a group chat
            if (!chat.isGroup) {
                await msg.reply('❌ This command can only be used in group chats!');
                return { success: true };
            }

            // Get the message to send with tags
            const message = args.length > 0 ? args.join(' ') : 'Hello everyone! 👋';
            
            // Get group participants
            const groupMetadata = await sock.groupMetadata(chat.id);
            const participants = groupMetadata.participants;
            
            if (!participants || participants.length === 0) {
                await msg.reply('❌ Could not fetch group members!');
                return { success: true };
            }

            // Create mentions array (exclude the bot itself and sender)
            const senderJid = msg.key.remoteJid;
            const mentions = participants
                .filter(participant => 
                    participant.id !== sock.user?.id && 
                    participant.id !== senderJid
                )
                .map(participant => participant.id);

            if (mentions.length === 0) {
                await msg.reply('❌ No members to tag!');
                return { success: true };
            }

            // Create the message with mentions
            const tagMessage = `📢 *Group Announcement*\n\n${message}\n\n${mentions.map(id => `@${id.split('@')[0]}`).join(' ')}`;

            // Send the message with mentions
            await sock.sendMessage(chat.id, {
                text: tagMessage,
                mentions: mentions
            });

            // Send confirmation to the command sender
            await msg.reply(`✅ Successfully tagged ${mentions.length} members!`);
            return { success: true };
        } catch (error) {
            console.error('Error in tagall-simple command:', error);
            return { 
                success: false, 
                message: '❌ Error in tagall-simple command: ' + error.message 
            };
        }
    }
};
