function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

module.exports = {
    info: {
        name: 'ping',
        description: 'Check bot status and response time',
        usage: '.ping',
        aliases: []
    },

    async handleCommand(sock, chat, msg, args) {
        try {
            const start = Date.now();
            const end = Date.now();
            const ping = Math.round((end - start));

            const uptimeInSeconds = process.uptime();
            const uptimeFormatted = formatTime(uptimeInSeconds);

            const botInfo = `
┏━━〔 🤖 𝐌𝐚𝐳𝐚𝐫𝐢𝐁𝐨𝐭 〕━━┓
┃ 🚀 Ping     : ${ping} ms
┃ ⏱️ Uptime   : ${uptimeFormatted}
┃ 🔖 Version  : v${process.env.VERSION || '1.0.0'}
┃ 📱 Status   : Online & Ready
┃ 🔗 Type     : Mobile-based
┗━━━━━━━━━━━━━━━━━━━┛`.trim();

            await msg.reply(botInfo);
            return { success: true };
        } catch (error) {
            console.error('Error in ping command:', error);
            return {
                success: false,
                message: '❌ Failed to get bot status.'
            };
        }
    }
};
