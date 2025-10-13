/**
 * Base command structure for all commands
 */
module.exports = class BaseCommand {
    constructor() {
        this.client = null;
    }

    /**
     * Handle command execution
     * @param {object} client - WhatsApp client instance
     * @param {object} chat - Chat object where command was sent
     * @param {object} msg - Message object that triggered command
     * @param {array} args - Command arguments
     * @returns {object} - { success: boolean, message: string }
     */
    async handleCommand(client, chat, msg, args) {
        throw new Error('Command must implement handleCommand method');
    }
};