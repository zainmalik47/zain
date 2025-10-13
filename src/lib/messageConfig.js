/**
 * Message configuration and formatting utilities
 */

module.exports = {
    /**
     * Format message text with proper styling
     * @param {String} text - Text to format
     * @returns {String} Formatted text
     */
    formatMessage(text) {
        if (!text) return '';
        return text.toString()
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t');
    },

    /**
     * Create quoted message
     * @param {Object} client - WhatsApp client
     * @param {String} jid - Chat JID 
     * @param {String} text - Message text
     * @param {Object} quoted - Message to quote
     */
    async sendQuoted(client, jid, text, quoted) {
        await client.sendMessage(jid, { 
            text,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '0029Vb6GUj8BPzjOWNfnhm1B@newsletter',
                    newsletterName: 'MAZARI TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted });
    },

    /**
     * Reply to a message
     * @param {Object} client - WhatsApp client 
     * @param {Object} msg - Message to reply to
     * @param {String} text - Reply text
     */
    async reply(client, msg, text) {
        await msg.reply(text);
    },

    /**
     * React to a message 
     * @param {Object} client - WhatsApp client
     * @param {Object} msg - Message to react to
     * @param {String} emoji - Reaction emoji
     */
    async react(client, msg, emoji) {
        await msg.react(emoji);
    }
};