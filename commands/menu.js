module.exports = {
    info: {
        name: 'menu',
        description: 'Show command menu',
        usage: '.menu',
        aliases: ['commands']
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            const menuText = `
╔═══════════════════╗
🤖 *ZAIN BOT MENU*
╚═══════════════════╝

┏━━〔 👑 Owner 〕━━┓
┃ .ownerinfo - Owner details
┃ .addowner <num> - Add owner
┃ .removeowner <num> - Remove owner
┃ .setpp - Set profile pic
┗━━━━━━━━━━━━━━━━━┛

┏━━〔 👮 Admin 〕━━┓
┃ .ban @user - Ban user
┃ .kick @user - Kick user
┃ .mute @user - Mute user
┃ .promote @user - Promote
┃ .demote @user - Demote
┃ .warn @user - Warn user
┗━━━━━━━━━━━━━━━━━┛

┏━━〔 🎮 Fun 〕━━┓
┃ .joke - Random jokes
┃ .quote - Random quotes
┃ .meme - Random memes
┃ .truth - Truth questions
┃ .dare - Dare challenges
┃ .compliment - Compliments
┗━━━━━━━━━━━━━━━━━┛

┏━━〔 📺 Media 〕━━┓
┃ .sticker - Create stickers
┃ .video <query> - Download video
┃ .song <name> - Download songs
┃ .instagram <url> - Instagram DL
┃ .tiktok <url> - TikTok DL
┃ .youtube <query> - YouTube search
┗━━━━━━━━━━━━━━━━━┛

┏━━〔 🛠️ Utility 〕━━┓
┃ .weather <city> - Weather info
┃ .translate <text> - Translate
┃ .news - Latest news
┃ .github <user> - GitHub info
┃ .ss <url> - Screenshot
┃ .ai <message> - AI chat
┗━━━━━━━━━━━━━━━━━┛

┏━━〔 ⚙️ Features 〕━━┓
┃ .autoreact [on/off] - Auto react
┃ .autoreply [on/off] - Auto reply
┃ .autostatus [on/off] - Auto status
┃ .welcome [on/off] - Welcome msgs
┗━━━━━━━━━━━━━━━━━┛

📱 *Owner:* +92 343 7408518
🔗 *Channels:* Use .ownerinfo for links
💡 *Help:* Use .help for detailed info`;

            await msg.reply(menuText);
            return { success: true };
        } catch (error) {
            console.error('Error in menu command:', error);
            return { 
                success: false, 
                message: '❌ Error in menu command: ' + error.message 
            };
        }
    }
};
