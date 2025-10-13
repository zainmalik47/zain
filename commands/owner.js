module.exports = {
    info: {
        name: 'owner',
        description: 'Show bot owner information',
        usage: '.owner',
        aliases: ['ownerinfo']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            const ownerInfo = `👑 *MAZARI BOT OWNER INFO* 👑

*Owner Names:* 
• ZOXER (Primary Owner)
• MAZARI (Primary Owner)

*Owner Number:*
• ZOXER: +923232391033

*Bot Version:* 2.0.5

*📺 Channels:*
• ZOXER Official: https://whatsapp.com/channel/0029VbBRITODzgTGQhZSFT3P
• MAZARI TECH: https://whatsapp.com/channel/0029Vb6GUj8BPzjOWNfnhm1B

*📱 Contact:*
WhatsApp: +923232391033

*🔗 Social Media:*
YouTube: @zoxertech

*⚡ Bot Features:*
• 80+ Commands
• Mobile-based connection
• Auto-reactions & Auto-replies
• Group management tools
• Media downloader
• AI integration

*Made with ❤️ by ZOXER & MAZARI*

*Note: This bot is for educational purposes only.*`;

            await msg.reply(ownerInfo);
            
            return { success: true };
        } catch (error) {
            console.error('Error in owner command:', error);
            return { 
                success: false, 
                message: '❌ Error in owner command: ' + error.message 
            };
        }
    }
};
