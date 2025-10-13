const BaseCommand = require('./BaseCommand')

class SimpleCommand extends BaseCommand {
  constructor() {
    super('simple')
  }

  async handleCommand(client, chat, msg, args) {
    try {
      const response = `✅ Simple command working!
- Bot is responding to your messages
- Self-message handling: ✅ Working
- Command processing: ✅ Working
- Time: ${new Date().toLocaleString()}`

      return {
        success: true,
        message: response
      }
    } catch (error) {
      console.error('Error in simple command:', error)
      return {
        success: false,
        message: '❌ Error in simple command: ' + error.message
      }
    }
  }
}

module.exports = SimpleCommand
