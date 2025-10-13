const BaseCommand = require('./BaseCommand')

class TestCommand extends BaseCommand {
  constructor() {
    super('test')
  }

  async handleCommand(client, chat, msg, args) {
    try {
      const contact = await msg.getContact()
      const chatInfo = await msg.getChat()
      
      const response = `🧪 *Test Command Response*
      
📱 *Message Details:*
- From: ${contact.pushname || 'Unknown'}
- FromMe: ${msg.fromMe}
- Chat Type: ${chatInfo.isGroup ? 'Group' : 'Private'}
- Message ID: ${msg.id._serialized}
- Timestamp: ${msg.timestamp}

✅ Bot is working correctly!
This message was sent at: ${new Date().toLocaleString()}`

      return {
        success: true,
        message: response
      }
    } catch (error) {
      console.error('Error in test command:', error)
      return {
        success: false,
        message: '❌ Error in test command: ' + error.message
      }
    }
  }
}

module.exports = TestCommand