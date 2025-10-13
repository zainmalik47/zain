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
┃ 📛 Name     : ZOXER & MAZARI
┃ 📱 Number   : +923232391033
┃ 🤖 Bot Name      : MazariBot
┃ 🔗 Type     : Mobile-based
┃ 📅 Created  : 2025
┗━━━━━━━━━━━━━━━━━━━┛

📢 *Official Channels:*
🔗 [ZOXER Official](https://whatsapp.com/channel/0029VbBRITODzgTGQhZSFT3P)
🔗 [MAZARI TECH](https://whatsapp.com/channel/0029Vb6GUj8BPzjOWNfnhm1B)

📺 *YouTube Channel:*
🎥 [ZOXER Tech](https://youtube.com/@zoxertech)

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
