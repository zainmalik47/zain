module.exports = {
    info: {
        name: 'tagall',
        description: 'Tag all group members with a message',
        usage: '.tagall <message>',
        aliases: ['tagall', 'mentionall']
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
            
            // Get group participants and metadata
            const groupMetadata = await sock.groupMetadata(chat.id);
            const participants = groupMetadata.participants;
            
            if (!participants || participants.length === 0) {
                await msg.reply('❌ Could not fetch group members!');
                return { success: true };
            }

            // Get sender info
            const senderJid = msg.key.remoteJid;
            const senderInfo = participants.find(p => p.id === senderJid);
            
            // Debug: Log admin status
            console.log(`Sender JID: ${senderJid}`);
            console.log(`Sender Info:`, senderInfo);
            console.log(`Admin Status:`, senderInfo?.admin);
            
            // Check if sender is admin or owner
            const isAdmin = senderInfo && (senderInfo.admin === 'admin' || senderInfo.admin === 'superadmin');
            const isOwner = senderInfo && senderInfo.admin === 'superadmin';
            
            // For now, let's allow everyone to use it (remove admin restriction)
            // You can uncomment the lines below to enable admin-only mode
            /*
            if (!isAdmin && !isOwner) {
                await msg.reply('❌ Only group admins can use this command!');
                return { success: true };
            }
            */

            // Create mentions array (exclude the bot itself and sender)
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
            console.error('Error in tagall command:', error);
            return { 
                success: false, 
                message: '❌ Error in tagall command: ' + error.message 
            };
        }
    }
};