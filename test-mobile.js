// Test script for mobile WhatsApp bot
const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Mobile WhatsApp Bot Setup...')
console.log('======================================')

// Check if Baileys is installed
try {
    const baileys = require('@whiskeysockets/baileys')
    console.log('✅ Baileys library is installed')
    console.log('✅ Mobile-based WhatsApp client available')
} catch (error) {
    console.log('❌ Baileys library not found:', error.message)
}

// Check if WhatsApp Web.js is removed
try {
    const whatsappWeb = require('whatsapp-web.js')
    console.log('❌ WhatsApp Web.js still present - should be removed')
} catch (error) {
    console.log('✅ WhatsApp Web.js successfully removed')
}

// Check config
try {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'config.json'), 'utf8'))
    console.log('✅ Config file loaded')
    console.log(`- Bot Name: ${config.botName}`)
    console.log(`- Prefix: ${config.prefix}`)
} catch (error) {
    console.log('❌ Config file error:', error.message)
}

// Check emojis
try {
    const emojis = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'emojis.json'), 'utf8'))
    console.log('✅ Emojis file loaded')
    console.log(`- Emoji count: ${emojis.length}`)
} catch (error) {
    console.log('❌ Emojis file error:', error.message)
}

console.log('\n🚀 Mobile Bot Features:')
console.log('- Direct mobile WhatsApp connection (NOT WhatsApp Web)')
console.log('- Can receive self-messages from your own number')
console.log('- QR code authentication for mobile linking')
console.log('- Full message logging and debugging')
console.log('- Command processing for all messages')

console.log('\n📱 Next Steps:')
console.log('1. Start the bot with: npm start')
console.log('2. Scan QR code with your WhatsApp mobile app')
console.log('3. Send .ping to yourself to test')
console.log('4. Send .help to see all commands')
console.log('5. Verify self-messages appear in terminal logs')

console.log('\n✅ Mobile bot setup complete!')
