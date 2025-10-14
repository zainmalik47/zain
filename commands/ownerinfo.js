module.exports = {
    info: {
        name: 'ownerinfo',
        description: 'Show bot owner information and contact details',
        usage: '.ownerinfo',
        aliases: ['owner']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            const ownerInfo = `
┏━━〔 👑 𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫 〕━━┓
┃ 📛 Name     : 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★
┃ 📱 Number   : +92 343 7408518
┃ 🤖 Bot Name      : 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★
┃ 🔗 Type     : Mobile-based
┃ 📅 Created  : 2025
┗━━━━━━━━━━━━━━━━━━━┛

📢 *Official Channels:*
🔗 [Instagram](https://www.instagram.com/zain.maalik47?utm_source=qr)

📺 *Social Media:*
🎥 [Instagram](https://www.instagram.com/zain.maalik47?utm_source=qr)

💡 *About:*
• Premium Tech Learning Courses
• Mobile Tricks & Tips
• Cyber Security Guides
• Fake Number & SIM Tricks
• Board/SIM Secrets
• Pro Tips & More

⚠️ *Note:*
📚 Educational purposes only
🚫 No illegal content
🌟 Where Learning Meets Innovation`;

            await msg.reply(ownerInfo);
            return { success: true };
        } catch (error) {
            console.error('Error in ownerinfo command:', error);
            return { 
                success: false, 
                message: '❌ Error in ownerinfo command: ' + error.message 
            };
        }
    }
};
