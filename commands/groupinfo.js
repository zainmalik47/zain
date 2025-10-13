module.exports = {
    info: {
        name: 'groupinfo',
        description: 'Show detailed group information',
        usage: '.groupinfo',
        aliases: ['ginfo', 'group']
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
            
            // Count different types of participants
            const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
            const superAdmins = participants.filter(p => p.admin === 'superadmin');
            const regularMembers = participants.filter(p => !p.admin);
            
            // Format creation date
            const creationDate = new Date(groupMetadata.creation * 1000).toLocaleDateString();
            
            // Get group description
            const description = groupMetadata.desc || 'No description available';
            
            // Create group info message
            const groupInfo = `
┏━━〔 👥 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨 〕━━┓
┃ 📛 Name        : ${groupMetadata.subject}
┃ 👑 Owner       : ${superAdmins.length > 0 ? superAdmins[0].id.split('@')[0] : 'Unknown'}
┃ 👥 Total Members: ${participants.length}
┃ 👮 Admins      : ${admins.length}
┃ 👤 Regular     : ${regularMembers.length}
┃ 📅 Created     : ${creationDate}
┃ 🔗 Group ID    : ${groupMetadata.id}
┗━━━━━━━━━━━━━━━━━━━┛

📝 *Description:*
${description}

👥 *Members List:* (First 10)
${participants.slice(0, 10).map((member, index) => {
    const role = member.admin === 'superadmin' ? '👑' : member.admin === 'admin' ? '👮' : '👤';
    return `${index + 1}. ${role} @${member.id.split('@')[0]}`;
}).join('\n')}

${participants.length > 10 ? `\n... and ${participants.length - 10} more members` : ''}`;

            await msg.reply(groupInfo);
            return { success: true };
        } catch (error) {
            console.error('Error in groupinfo command:', error);
            return { 
                success: false, 
                message: '❌ Error in groupinfo command: ' + error.message 
            };
        }
    }
};