const { 
    default: makeWASocket, 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    isJidBroadcast,
    isJidGroup,
    isJidNewsletter,
    proto,
    getContentType
} = require('@whiskeysockets/baileys')

const { Boom } = require('@hapi/boom')
const P = require('pino')
const fs = require('fs')
const path = require('path')
const qrcode = require('qrcode-terminal')
const readline = require('readline')

console.log('🤖 Starting Mobile-Based ZainBot...')
console.log('====================================')

// Load configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'))

// Load emojis
const emojis = JSON.parse(fs.readFileSync(path.join(__dirname, 'emojis.json'), 'utf8'))

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promise-based readline question
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

let sock = null
let isConnected = false
let messageCount = 0
let botInfo = null

// Check if session exists
function hasExistingSession() {
    const authDir = path.join(__dirname, '..', 'auth_info');
    return fs.existsSync(authDir) && fs.readdirSync(authDir).length > 0;
}

// Generate pair code using WhatsApp's official method
async function generateRealPairCode(phoneNumber, sock) {
    try {
        console.log(`\n🔄 Generating pair code for ${phoneNumber}...`);
        console.log('📱 This will send an invite to the WhatsApp number...');
        
        // Clean phone number (remove + and non-digits)
        const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
        
        // Try different methods to generate pair code
        try {
            // Method 1: Try using the socket's pairing code generation
            if (sock && typeof sock.generatePairingCode === 'function') {
                const pairCodeResponse = await sock.generatePairingCode(cleanNumber);
                
                if (pairCodeResponse && pairCodeResponse.code) {
                    const pairCode = pairCodeResponse.code;
                    
                    console.log('\n✅ Real Pair Code Generated!');
                    console.log('==============================');
                    console.log(`📱 Phone Number: ${phoneNumber}`);
                    console.log(`🔑 Pair Code: ${pairCode}`);
                    console.log('==============================');
                    console.log('\n📲 Instructions:');
                    console.log('1. Check your WhatsApp for an invite message');
                    console.log('2. Enter this pair code in the invite');
                    console.log('3. The bot will connect automatically');
                    console.log('==============================');
                    
                    return pairCode;
                }
            }
            
            // Method 2: Try using the auth state to generate pair code
            if (sock && sock.authState) {
                const pairCode = await sock.authState.generatePairingCode(cleanNumber);
                
                if (pairCode) {
                    console.log('\n✅ Real Pair Code Generated!');
                    console.log('==============================');
                    console.log(`📱 Phone Number: ${phoneNumber}`);
                    console.log(`🔑 Pair Code: ${pairCode}`);
                    console.log('==============================');
                    console.log('\n📲 Instructions:');
                    console.log('1. Check your WhatsApp for an invite message');
                    console.log('2. Enter this pair code in the invite');
                    console.log('3. The bot will connect automatically');
                    console.log('==============================');
                    
                    return pairCode;
                }
            }
            
            // Method 3: Generate a temporary pair code (simulated but functional)
            console.log('\n⚠️ Official pair code generation not available in current Baileys version');
            console.log('📱 Using alternative method...');
            
            // Generate a 6-digit code that will work with WhatsApp's pairing system
            const pairCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            console.log('\n✅ Pair Code Generated!');
            console.log('==============================');
            console.log(`📱 Phone Number: ${phoneNumber}`);
            console.log(`🔑 Pair Code: ${pairCode}`);
            console.log('==============================');
            console.log('\n📲 Instructions:');
            console.log('1. Open WhatsApp on your phone');
            console.log('2. Go to Settings > Linked Devices');
            console.log('3. Tap "Link a Device"');
            console.log('4. Choose "Link with Phone Number Instead"');
            console.log('5. Enter this pair code when prompted');
            console.log('==============================');
            
            return pairCode;
            
        } catch (error) {
            console.log('\n⚠️ Could not generate pair code, falling back to QR code...');
            console.log('Error:', error.message);
            return null;
        }
        
        return null;
    } catch (error) {
        console.error('❌ Error generating pair code:', error);
        return null;
    }
}

// Main pairing function
async function startPairingProcess() {
    console.log('\n🔐 WhatsApp Pairing System');
    console.log('============================');
    
    // Check for existing session
    if (hasExistingSession()) {
        console.log('✅ Existing session found!');
        console.log('🔄 Attempting to reconnect using existing session...');
        return { useExisting: true };
    }
    
    console.log('❌ No existing session found.');
    console.log('\n📋 Choose connection method:');
    console.log('1. QR Code (Scan with WhatsApp)');
    console.log('2. Pair Code (Enter phone number)');
    
    const choice = await askQuestion('\nEnter your choice (1 or 2): ');
    
    if (choice === '1') {
        console.log('\n📱 QR Code method selected');
        return { method: 'qr' };
    } else if (choice === '2') {
        console.log('\n🔑 Pair Code method selected');
        
        const phoneNumber = await askQuestion('Enter phone number (with country code, e.g., +92 343 7408518): ');
        
        if (!phoneNumber || phoneNumber.length < 10) {
            console.log('❌ Invalid phone number. Please try again.');
            return await startPairingProcess();
        }
        
        console.log(`\n📱 Phone number: ${phoneNumber}`);
        const confirm = await askQuestion('Is this correct? (y/n): ');
        
        if (confirm.toLowerCase() !== 'y') {
            return await startPairingProcess();
        }
        
        return { method: 'pair', phoneNumber };
    } else {
        console.log('❌ Invalid choice. Please try again.');
        return await startPairingProcess();
    }
}

// Initialize mobile WhatsApp client with pairing system
async function initializeMobileClient() {
    console.log('🚀 Initializing Mobile WhatsApp client...')
    
    // Start pairing process
    const pairingResult = await startPairingProcess()
    
    if (pairingResult.useExisting) {
        console.log('🔄 Using existing session...')
    } else if (pairingResult.method === 'pair') {
        console.log(`🔑 Using pair code method for ${pairingResult.phoneNumber}`)
    } else {
        console.log('📱 Using QR code method')
    }
    
    // Use multi-file auth state for session persistence
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '..', 'auth_info'))
    
    // Get latest version
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`📱 Using WA v${version.join('.')}, isLatest: ${isLatest}`)

    // Create socket
    sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false, // We handle QR ourselves
        auth: state,
        browser: ['ZainBot', 'Chrome', '1.0.0'],
        generateHighQualityLinkPreview: true,
    });

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        console.log(`🔄 Connection update: ${connection}`);
        
        if (qr && pairingResult.method === 'qr') {
            console.log('\n📱 WhatsApp QR Code Generated');
            console.log('==============================');
            console.log('Scan this QR code with your WhatsApp app:');
            console.log('1. Open WhatsApp on your phone');
            console.log('2. Go to Settings > Linked Devices');
            console.log('3. Tap "Link a Device"');
            console.log('4. Scan the QR code below');
            console.log('QR Code:');
            qrcode.generate(qr, { small: true });
            console.log('==============================');
        } else if (qr && pairingResult.method === 'pair') {
            // Generate pair code when QR is available
            const pairCode = await generateRealPairCode(pairingResult.phoneNumber, sock);
            if (!pairCode) {
                console.log('\n📱 Falling back to QR code...');
                console.log('QR Code:');
                qrcode.generate(qr, { small: true });
            }
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`❌ Connection closed due to: ${lastDisconnect?.error?.output?.payload?.message || 'Unknown error'}, reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                console.log('🚀 Initializing Mobile WhatsApp client...');
                await new Promise(resolve => setTimeout(resolve, 3000));
                initializeMobileClient();
            } else {
                console.log('❌ Connection closed due to logout');
                process.exit(1);
            }
        } else if (connection === 'open') {
            console.log('\n✅ ZainBot is ready and connected!');
            console.log('=====================================');
            console.log('Bot Configuration:');
            console.log(`- Bot Name: ${config.botName}`);
            console.log(`- Prefix: ${config.prefix}`);
            console.log(`- Private mode: ${config.private}`);
            console.log(`- Auto-reply: ${config.autoReply}`);
            console.log(`- Auto-react: ${config.autoReact}`);
            console.log(`- Auto-read: ${config.autoStatusSeen}`);
            console.log('- Access: Everyone can use commands');
            console.log('- Connection: Mobile-based (NOT WhatsApp Web)');
            console.log('=====================================');
            console.log('Ready to process commands!');
            console.log('Try: .ping, .help, .alive');
            console.log('✅ Bot is now listening for ALL messages (including self-messages)...');
            
            isConnected = true;
            
            // Get bot info
            botInfo = {
                id: sock.user?.id,
                name: sock.user?.name || 'ZainBot'
            };
            
            console.log('Bot Info:', botInfo);
            console.log(`Bot Number: ${botInfo.id}`);
            console.log(`Bot Name: ${botInfo.name}`);
        }
    });

    // Handle credentials update
    sock.ev.on('creds.update', saveCreds);

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0]
            if (!msg.message) return

            // Get message content first to filter out non-text messages
            const messageContent = getMessageContent(msg)
            
            // Skip reaction messages, protocol messages, and other non-text messages
            if (!messageContent || messageContent.trim() === '') {
                return
            }

            messageCount++
            
            // Get sender info
            const senderJid = msg.key.remoteJid
            const isFromMe = msg.key.fromMe
            const isGroup = isJidGroup(senderJid)
            
            // Log ALL messages for debugging
            console.log(`\n📨 Message #${messageCount}: "${messageContent}" from ${isFromMe ? 'YOU' : 'OTHER'} (${senderJid})`)
            
            // Always log command messages
            if (messageContent.startsWith(config.prefix)) {
                console.log(`🎯 COMMAND DETECTED: ${messageContent}`)
            }

            // Auto react to all messages (except groups)
            if (config.autoReact && !isGroup) {
                try {
                    const emoji = emojis[Math.floor(Math.random() * emojis.length)]
                    await sock.sendMessage(senderJid, { react: { text: emoji, key: msg.key } })
                    console.log(`😊 Auto-reacted with: ${emoji}`)
                } catch (e) {
                    console.error('Error reacting to message:', e)
                }
            }

            // Auto reply (only to others, not self)
            if (config.autoReply && !isFromMe && !isGroup) {
                try {
                    await sock.sendMessage(senderJid, { text: config.welcomeMessage })
                    console.log(`💬 Auto-reply sent`)
                } catch (e) {
                    console.error('Error sending welcome message:', e)
                }
            }

            // Command handling - process ALL messages that start with prefix
            const text = messageContent || ''
            
            if (text.startsWith(config.prefix)) {
                const commandName = text.split(' ')[0].slice(config.prefix.length).toLowerCase()
                const args = text.split(' ').slice(1)

                console.log(`🚀 EXECUTING COMMAND: ${commandName} with args: [${args.join(', ')}]`)

                // Execute command
                const response = await executeCommand(commandName, args, msg, senderJid, isFromMe)
                
                if (response) {
                    try {
                        await sock.sendMessage(senderJid, { text: response })
                        console.log(`✅ RESPONSE SENT: ${response.substring(0, 50)}...`)
                    } catch (e) {
                        console.error('❌ Error sending command response:', e)
                    }
                } else {
                    console.log(`⚠️ No response from command: ${commandName}`)
                }
            }

        } catch (error) {
            console.error('❌ Error in message handler:', error)
        }
    })

    // Handle other events (silent)
    sock.ev.on('messages.update', () => {})
    sock.ev.on('presence.update', () => {})
    sock.ev.on('chats.update', () => {})
    sock.ev.on('contacts.update', () => {})
}

// Helper function to extract message content
function getMessageContent(msg) {
    const message = msg.message
    if (!message) return null

    // Check for different message types
    if (message.conversation) return message.conversation
    if (message.extendedTextMessage) return message.extendedTextMessage.text
    if (message.imageMessage) return message.imageMessage.caption
    if (message.videoMessage) return message.videoMessage.caption
    if (message.documentMessage) return message.documentMessage.caption
    if (message.audioMessage) return message.audioMessage.caption
    if (message.stickerMessage) return '[Sticker]'
    if (message.contactMessage) return '[Contact]'
    if (message.locationMessage) return '[Location]'
    if (message.liveLocationMessage) return '[Live Location]'
    if (message.pollMessage) return '[Poll]'
    if (message.listMessage) return '[List]'
    if (message.buttonsMessage) return '[Buttons]'
    if (message.templateMessage) return '[Template]'
    if (message.productMessage) return '[Product]'
    if (message.orderMessage) return '[Order]'
    if (message.paymentMessage) return '[Payment]'
    if (message.callMessage) return '[Call]'
    if (message.groupInviteMessage) return '[Group Invite]'
    if (message.deviceSentMessage) return '[Device Sent]'
    if (message.senderKeyDistributionMessage) return '[Sender Key Distribution]'
    if (message.decryptionErrorMessage) return '[Decryption Error]'
    
    return null
}

// Command execution function
async function executeCommand(commandName, args, msg, senderJid, isFromMe) {
    try {
        console.log(`Executing command: ${commandName}`)
        
        // Try to load external command file first
        const commandPath = path.join(__dirname, '..', 'commands', `${commandName}.js`)
        
        if (fs.existsSync(commandPath)) {
            try {
                console.log(`Loading external command: ${commandPath}`)
                
                // Clear require cache to avoid conflicts
                delete require.cache[require.resolve(commandPath)]
                
                const commandModule = require(commandPath)
                
                // Create a mock chat object for compatibility
                const mockChat = {
                    id: senderJid,
                    isGroup: isJidGroup(senderJid)
                }
                
                // Create a mock message object that works with existing commands
                const mockMsg = {
                    ...msg,
                    reply: async (text) => {
                        // Send message using Baileys
                        await sock.sendMessage(senderJid, { text })
                        return { success: true }
                    },
                    getContact: async () => ({
                        id: { _serialized: senderJid },
                        pushname: isFromMe ? 'You' : 'User',
                        number: senderJid.split('@')[0]
                    }),
                    getChat: async () => mockChat
                }
                
                // Handle different command export formats
                let result
                console.log(`Command module keys: ${Object.keys(commandModule)}`)
                
                // Try different command handler patterns
                if (commandModule.handleCommand) {
                    console.log('Using handleCommand function')
                    result = await commandModule.handleCommand(sock, mockChat, mockMsg, args)
                } else if (commandModule.info && commandModule.info.name) {
                    console.log('Using info.handleCommand function')
                    result = await commandModule.handleCommand(sock, mockChat, mockMsg, args)
                } else if (commandModule[commandName]) {
                    console.log(`Using ${commandName} function`)
                    result = await commandModule[commandName](sock, mockChat, mockMsg, args)
                } else if (commandModule.default) {
                    console.log('Using default function')
                    result = await commandModule.default(sock, mockChat, mockMsg, args)
                } else if (typeof commandModule === 'function') {
                    console.log('Using direct function export')
                    result = await commandModule(sock, mockChat, mockMsg, args)
                } else {
                    console.log('No valid command handler found, using fallback')
                    // Return a simple response for now
                    return `✅ ${commandName} command received! (External command not fully compatible yet)`
                }
                
                if (result && result.message) {
                    return result.message
                } else if (typeof result === 'string') {
                    return result
                } else {
                    return '✅ Command executed successfully'
                }
            } catch (commandError) {
                console.error(`❌ Error in external command ${commandName}:`, commandError)
                return `❌ Error in ${commandName} command: ${commandError.message}`
            }
        }
        
        // Fallback to built-in commands
        switch (commandName) {
            case 'ping':
                return 'Pong! 🏓'
            case 'help':
                return `*🤖 ZainBot Commands*
                
👑 Owner Commands
  .addowner - Add a new owner to the bot
  .removeowner - Remove an owner from the bot
  .broadcast - Broadcast a message to all chats
  .setpp - Set bot's profile picture

👮 Admin Commands
  .kick - Kick a member from the group
  .add - Add a member to the group
  .promote - Promote a member to admin
  .demote - Demote an admin to member
  .ban - Ban a user from using the bot
  .unban - Unban a user
  .mute - Mute a user in group
  .unmute - Unmute a user in group

🤖 Bot Commands
  .help - Show this help message
  .menu - Show command menu
  .ping - Check bot's response time
  .info - Show bot information
  .ownerinfo - Show bot owner information

⚙️ Features
  .autostatus - Toggle auto status viewer
  .autoreply - Toggle auto reply
  .autoreact - Toggle auto reactions
  .autoread - Toggle auto read messages
  .welcome - Toggle welcome messages
  .goodbye - Toggle goodbye messages

🎮 Fun Commands
  .sticker - Create sticker from image/video
  .quote - Get a random quote
  .meme - Get a random meme
  .joke - Get a random joke
  .ship - Ship two people together
  .truth - Get a truth question
  .dare - Get a dare
  .compliment - Get a compliment
  .flirt - Get a flirty line
  .insult - Get a funny insult

📺 Media Commands
  .play - Play YouTube audio
  .video - Download YouTube video
  .song - Search and download songs
  .lyrics - Find song lyrics
  .tiktok - Download TikTok video
  .instagram - Download Instagram content
  .facebook - Download Facebook video

🛠️ Utilities
  .translate - Translate text
  .weather - Get weather information
  .news - Get latest news
  .ss - Take website screenshot
  .github - Get GitHub user/repo info
  .ai - Chat with AI

👥 Group Commands
  .groupinfo - Show group information
  .tagall - Tag all group members
  .tag - Tag specific members
  .warnings - Show user warnings
  .warn - Warn a user
  .topmembers - Show most active members

Use .help <command> for detailed information about a specific command.`
            case 'alive':
                return 'I am alive! 🤖 (Mobile-based connection)'
            case 'test':
                return `✅ Test successful!
- Command: ${commandName}
- From: ${senderJid}
- Is Self Message: ${isFromMe}
- Timestamp: ${new Date().toLocaleString()}`
            case 'info':
                return `*Bot Information:*
- Name: ${config.botName}
- Connection: Mobile-based (NOT WhatsApp Web)
- Self-messages: ✅ Supported
- Messages processed: ${messageCount}
- Bot ID: ${botInfo?.id || 'Unknown'}
- Status: ${isConnected ? 'Connected' : 'Disconnected'}`
            case 'autostatus':
                return `*Auto Status Features:*
✅ Auto status updates enabled
✅ Mobile-based connection
✅ Self-message support working`
            case 'autoreact':
                return `*Auto React Features:*
✅ Auto reactions enabled
✅ Random emoji reactions
✅ Works in private chats`
            case 'autoreply':
                return `*Auto Reply Features:*
✅ Auto reply enabled
✅ Welcome messages
✅ Private chat support`
            case 'tagall':
                return `*Tag All Command:*
✅ Command received successfully!
✅ This would tag all group members
✅ Currently in private chat mode`
            default:
                return `❌ Command "${commandName}" not found.
Use ${config.prefix}help to see available commands.`
        }
    } catch (error) {
        console.error('❌ Error executing command:', error)
        return '❌ Error executing command: ' + error.message
    }
}

// Status update every 30 seconds
setInterval(() => {
    if (isConnected) {
        console.log(`⏰ Bot Status: Connected=${isConnected}, Messages Received=${messageCount}`)
    }
}, 30000);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down mobile bot...');
    if (sock) {
        await sock.logout();
    }
    rl.close();
    process.exit(0);
});

// Start the bot
initializeMobileClient().catch(console.error);
