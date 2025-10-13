// Debug command to check admin status and group info
module.exports = {
    info: {
        name: 'debug',
        description: 'Debug command to check admin status and group info',
        usage: '.debug',
        aliases: ['testadmin', 'checkadmin']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            // Check if it's a group chat
            if (!chat.isGroup) {
                await msg.reply('❌ This command can only be used in group chats!');
                return { success: true };
            }

            // Get group metadata
            const groupMetadata = await sock.groupMetadata(chat.id);
            const participants = groupMetadata.participants;
            
            // Get sender info
            const senderJid = msg.key.remoteJid;
            const senderInfo = participants.find(p => p.id === senderJid);
            
            // Debug info
            const debugInfo = `
🔍 *Debug Information*

👥 *Group Info:*
• Group ID: ${groupMetadata.id}
• Group Name: ${groupMetadata.subject}
• Total Members: ${participants.length}

👤 *Your Info:*
• Your JID: ${senderJid}
• Admin Status: ${senderInfo?.admin || 'No admin status'}
• Is Admin: ${senderInfo?.admin === 'admin' || senderInfo?.admin === 'superadmin'}
• Is Super Admin: ${senderInfo?.admin === 'superadmin'}

👥 *All Participants:*
${participants.slice(0, 10).map((p, i) => {
    const role = p.admin === 'superadmin' ? '👑' : p.admin === 'admin' ? '👮' : '👤';
    const isYou = p.id === senderJid ? ' (YOU)' : '';
    return `${i + 1}. ${role} @${p.id.split('@')[0]}${isYou}`;
}).join('\n')}

${participants.length > 10 ? `... and ${participants.length - 10} more` : ''}`;

            await msg.reply(debugInfo);
            return { success: true };
        } catch (error) {
            console.error('Error in debug command:', error);
            return { 
                success: false, 
                message: '❌ Error in debug command: ' + error.message 
            };
        }
    }
};
