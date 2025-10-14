module.exports = {
    info: {
        name: 'owner',
        description: 'Show bot owner information',
        usage: '.owner',
        aliases: ['ownerinfo']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            const ownerInfo = `👑 *ZAIN BOT OWNER INFO* 👑

*Owner Names:* 
• 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★ (Primary Owner)

*Owner Number:*
• 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★: +92 343 7408518

*Bot Version:* 2.0.5

*📺 Channels:*
• Instagram: https://www.instagram.com/zain.maalik47?utm_source=qr

*📱 Contact:*
Instagram: @https://www.instagram.com/zain.maalik47?utm_source=qr

*🔗 Social Media:*
Instagram: @https://www.instagram.com/zain.maalik47?utm_source=qr

*⚡ Bot Features:*
• 80+ Commands
• Mobile-based connection
• Auto-reactions & Auto-replies
• Group management tools
• Media downloader
• AI integration
*Made with ❤️ by 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★*

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
