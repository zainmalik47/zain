/**
 * MazariBot - A WhatsApp Bot
 * Copyright (c) 2024 ZOXER & MAZARI
 * MIT License
 */

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const qrcode = require('qrcode-terminal')
const NodeCache = require('node-cache')
const pino = require('pino')
const readline = require('readline')
const path = require('path')

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidDecode,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  delay,
  isJidGroup,
  getContentType,
  proto
} = require('@whiskeysockets/baileys')

// ==== CONFIG ==== 
const SESSION_DIR = process.env.SESSION_DIR || './auth_info'
const STORE_FILE = process.env.STORE_FILE || './baileys_store.json'
const PHONE_NUMBER = process.env.PHONE_NUMBER || null
const RECONNECT_DELAY_MS = 5000
const MAX_RECONNECT_ATTEMPTS = 3

// Load configuration
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'))
const emojis = JSON.parse(fs.readFileSync(path.join(__dirname, 'emojis.json'), 'utf8'))

// Auto feature states
let autoStatusSeen = config.autoStatusSeen || false
let autoReact = config.autoReact || false
let autoRead = false
let autoTyping = false

// Function to save auto feature states
function saveAutoStates() {
  try {
    const configPath = path.join(__dirname, 'config.json')
    const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    currentConfig.autoStatusSeen = autoStatusSeen
    currentConfig.autoReact = autoReact
    fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2))
  } catch (error) {
    console.error('Error saving auto states:', error)
  }
}

// Function to load auto feature states
function loadAutoStates() {
  try {
    const configPath = path.join(__dirname, 'config.json')
    const currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    autoStatusSeen = currentConfig.autoStatusSeen || false
    autoReact = currentConfig.autoReact || false
  } catch (error) {
    console.error('Error loading auto states:', error)
  }
}

// ==== LIGHTWEIGHT STORE ==== 
const store = { messages: {}, contacts: {}, chats: {} }
store.readFromFile = (filePath = STORE_FILE) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      store.messages = data.messages || {}
      store.contacts = data.contacts || {}
      store.chats = data.chats || {}
    }
  } catch (e) { console.warn('Failed to read store:', e.message) }
}
store.writeToFile = (filePath = STORE_FILE) => {
  try {
    const data = JSON.stringify({ messages: store.messages, contacts: store.contacts, chats: store.chats })
    fs.writeFileSync(filePath, data)
  } catch (e) { console.warn('Failed to write store:', e.message) }
}
store.readFromFile(STORE_FILE)
setInterval(() => store.writeToFile(STORE_FILE), 10_000)

// ==== PROMPT UTILS (local/dev only) ==== 
function askQuestion(text) {
  if (!process.stdin.isTTY) return Promise.reject(new Error('Non-interactive terminal'))
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  })
  return new Promise(resolve => rl.question(text, ans => {
    rl.close()
    resolve(ans)
  }))
}

// ==== GLOBAL FLAGS ==== 
let reconnectAttempts = 0
let restarting = false
let messageCount = 0

// ==== MESSAGE HANDLER ====
async function handleMessages(sock, messageUpdate, isFromMe = false) {
  try {
    const msg = messageUpdate.messages[0]
    if (!msg.message) return

    const messageContent = getMessageContent(msg)
    
    if (!messageContent || messageContent.trim() === '') {
      return
    }

    messageCount++
    
    const senderJid = msg.key.remoteJid
    const isFromMeMsg = msg.key.fromMe
    const isGroup = isJidGroup(senderJid)
    
    console.log(`\n📨 Message #${messageCount}: "${messageContent}" from ${isFromMeMsg ? 'YOU' : 'OTHER'} (${senderJid})`)
    
    // Bot is open to all users - no owner restrictions
    
    if (messageContent.startsWith(config.prefix)) {
      console.log(`🎯 COMMAND DETECTED: ${messageContent}`)
    }

    // Auto react feature - only react to messages from others (not bot responses)
    if (autoReact && !isFromMeMsg && !isGroup && !messageContent.startsWith(config.prefix)) {
      try {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)]
        await sock.sendMessage(senderJid, { react: { text: emoji, key: msg.key } })
        console.log(`😊 Auto-reacted with: ${emoji}`)
      } catch (e) {
        console.error('Error reacting to message:', e)
      }
    }

    // Auto typing feature - show typing indicator for incoming messages
    if (!isFromMeMsg && !isGroup && !messageContent.startsWith(config.prefix)) {
      try {
        const autotypingModule = require('../commands/autotyping.js')
        await autotypingModule.handleAutotypingForMessage(sock, senderJid, messageContent)
      } catch (e) {
        console.error('Error in auto-typing for message:', e)
      }
    }

    // Auto read feature - mark messages as read (show blue ticks)
    if (autoRead && !isFromMeMsg && !isGroup) {
      try {
        await sock.readMessages([msg.key])
        console.log(`📖 Auto-read message from ${senderJid}`)
      } catch (e) {
        console.error('Error auto-reading message:', e)
      }
    }

    // Auto reply feature
    if (config.autoReply && !isFromMeMsg && !isGroup) {
      try {
        await sock.sendMessage(senderJid, { text: config.welcomeMessage })
        console.log(`💬 Auto-reply sent`)
      } catch (e) {
        console.error('Error sending welcome message:', e)
      }
    }

    // Command processing
    const text = messageContent || ''
    
    if (text.startsWith(config.prefix)) {
      const commandName = text.split(' ')[0].slice(config.prefix.length).toLowerCase()
      const args = text.split(' ').slice(1)

      console.log(`🚀 EXECUTING COMMAND: ${commandName} with args: [${args.join(', ')}]`)

      const response = await executeCommand(commandName, args, msg, senderJid, isFromMeMsg)
      
      if (response) {
        try {
          await sock.sendMessage(senderJid, { text: response })
          console.log(`✅ RESPONSE SENT: ${response.substring(0, 50)}...`)
          
          // Show typing indicator after command response
          try {
            const autotypingModule = require('../commands/autotyping.js')
            await autotypingModule.showTypingAfterCommand(sock, senderJid)
          } catch (e) {
            console.error('Error in post-command auto-typing:', e)
          }
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
}

// ==== COMMAND EXECUTOR ====
async function executeCommand(commandName, args, msg, senderJid, isFromMe) {
  try {
    console.log(`Executing command: ${commandName}`)
    
    const commandPath = path.join(__dirname, '..', 'commands', `${commandName}.js`)
    
    if (fs.existsSync(commandPath)) {
      try {
        console.log(`Loading external command: ${commandPath}`)
        
        delete require.cache[require.resolve(commandPath)]
        
        const commandModule = require(commandPath)
        
        const mockChat = {
          id: senderJid,
          isGroup: isJidGroup(senderJid)
        }
        
        const mockMsg = {
          ...msg,
          reply: async (text) => {
            // Don't send immediately - let main handler send it
            return { success: true, message: text }
          },
          getContact: async () => ({
            id: { _serialized: senderJid },
            pushname: isFromMe ? 'You' : 'User',
            number: senderJid.split('@')[0]
          }),
          getChat: async () => mockChat
        }
        
        let result
        console.log(`Command module keys: ${Object.keys(commandModule)}`)
        
          if (commandModule.handleCommand) {
            console.log('Using handleCommand function')
            result = await commandModule.handleCommand(sock, mockChat, mockMsg, args)
            
            // Update global auto feature states based on command results
            if (result && result.autoStatusSeen !== undefined) {
              autoStatusSeen = result.autoStatusSeen
              saveAutoStates()
            }
            if (result && result.autoReact !== undefined) {
              autoReact = result.autoReact
              saveAutoStates()
            }
            if (result && result.autoRead !== undefined) {
              autoRead = result.autoRead
            }
            if (result && result.autoTyping !== undefined) {
              autoTyping = result.autoTyping
              console.log(`🔄 Auto-typing status updated: ${autoTyping ? 'Enabled' : 'Disabled'}`)
            }
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
          return `✅ ${commandName} command received! (External command not fully compatible yet)`
        }
        
        if (result && result.message) {
          return result.message
        } else if (typeof result === 'string') {
          return result
        } else if (result && result.success) {
          // Command executed successfully but no message to return
          return '✅ Command executed successfully'
        } else {
          return '✅ Command executed successfully'
        }
      } catch (commandError) {
        console.error(`Error in external command ${commandName}:`, commandError)
        return `❌ Error in ${commandName} command: ${commandError.message}`
      }
    }
    
    // Fallback to built-in commands
    switch (commandName) {
      case 'ping':
        return 'Pong! 🏓'
      case 'help':
        return `*🤖 MazariBot Commands*
        
👑 Owner Commands
  *.addowner* - Add a new owner to the bot
  *.removeowner* - Remove an owner from the bot
  *.broadcast* - Broadcast a message to all chats
  *.setpp* - Set bot's profile picture

👮 Admin Commands
  *.kick* - Kick a member from the group
  *.add* - Add a member to the group
  *.promote* - Promote a member to admin
  *.demote* - Demote an admin to member
  *.ban* - Ban a user from using the bot
  *.unban* - Unban a user
  *.mute* - Mute a user in group
  *.unmute* - Unmute a user in group

🤖 Bot Commands
  *.help* - Show this help message
  *.menu* - Show command menu
  *.ping* - Check bot's response time
  *.info* - Show bot information
  *.ownerinfo* - Show bot owner information

⚙️ Features
  *.autostatus* - Toggle auto status viewer
  *.autoreply* - Toggle auto reply
  *.autoreact* - Toggle auto reactions
  *.autoread* - Toggle auto read messages
  *.welcome* - Toggle welcome messages
  *.goodbye* - Toggle goodbye messages

🎮 Fun Commands
  *.sticker* - Create sticker from image/video
  *.quote* - Get a random quote
  *.meme* - Get a random meme
  *.joke* - Get a random joke
  *.ship* - Ship two people together
  *.truth* - Get a truth question
  *.dare* - Get a dare
  *.compliment* - Get a compliment
  *.flirt* - Get a flirty line
  *.insult* - Get a funny insult

📺 Media Commands
  *.play* - Play YouTube audio
  *.video* - Download YouTube video
  *.song* - Search and download songs
  *.lyrics* - Find song lyrics
  *.tiktok* - Download TikTok video
  *.instagram* - Download Instagram content
  *.facebook* - Download Facebook video

🛠️ Utilities
  *.translate* - Translate text
  *.weather* - Get weather information
  *.news* - Get latest news
  *.ss* - Take website screenshot
  *.github* - Get GitHub user/repo info
  *.ai* - Chat with AI

👥 Group Commands
  *.groupinfo* - Show group information
  *.tagall* - Tag all group members
  *.tag* - Tag specific members
  *.warnings* - Show user warnings
  *.warn* - Warn a user
  *.topmembers* - Show most active members

Use .help <command> for detailed information about a specific command.`
      case 'alive':
        return 'I am alive! 🤖 (Mobile-based connection)'
      case 'test':
        return `✅ Test successful!
📱 Bot Status: Connected
🔗 Connection Type: Mobile-based
⏰ Uptime: ${Math.floor(process.uptime())} seconds
📊 Messages Processed: ${messageCount}`
      case 'info':
        return `*Bot Information:*
🤖 Name: ${config.botName}
📱 Type: Mobile-based WhatsApp Bot
🔗 Protocol: Baileys
📊 Messages: ${messageCount}
⏰ Uptime: ${Math.floor(process.uptime())}s
✅ Status: Online & Ready`
      default:
        return `❌ Command "${commandName}" not found.
Use ${config.prefix}help to see available commands.`
    }
  } catch (error) {
    console.error('Error executing command:', error)
    return '❌ Error executing command: ' + error.message
  }
}

// ==== MESSAGE CONTENT EXTRACTOR ====
function getMessageContent(msg) {
  const msgType = getContentType(msg.message)
  
  if (msgType === 'conversation') {
    return msg.message.conversation
  } else if (msgType === 'extendedTextMessage') {
    return msg.message.extendedTextMessage.text
  } else if (msgType === 'imageMessage') {
    return msg.message.imageMessage.caption || ''
  } else if (msgType === 'videoMessage') {
    return msg.message.videoMessage.caption || ''
  } else if (msgType === 'documentMessage') {
    return msg.message.documentMessage.caption || ''
  }
  
  return ''
}

// ===== BOT FUNCTIONALITY INITIALIZATION =====

// Initialize auto-typing feature using the improved system
function initializeAutoTyping() {
  console.log('🔄 Initializing improved auto-typing feature...')
  
  // Load the autotyping module
  const autotypingModule = require('../commands/autotyping.js')
  
  // Show initial typing to demonstrate it's working
  setTimeout(async () => {
    try {
      const chatIds = Object.keys(store.chats)
      const privateChats = chatIds.filter(id => !id.includes('@g.us'))
      
      if (privateChats.length > 0) {
        const randomChat = privateChats[0]
        await autotypingModule.showTypingAfterCommand(sock, randomChat)
        console.log(`⌨️ Initial auto-typing demonstration completed`)
      }
    } catch (e) {
      console.error('Error in initial auto-typing:', e)
    }
  }, 2000)
}

async function initializeBot(sock) {
  try {
    console.log('🔧 Initializing bot functionality...')

    sock.ev.on('messages.upsert', async (messageUpdate) => {
      try {
        await handleMessages(sock, messageUpdate, false)
      } catch (error) {
        console.error('❌ Error handling message:', error)
      }
    })

    // Auto-status feature - periodically check for status updates
    if (autoStatusSeen) {
      setInterval(async () => {
        try {
          // Listen for status updates
          sock.ev.on('contacts.update', async (updates) => {
            for (const update of updates) {
              if (update.status) {
                console.log(`📱 Status update from ${update.id}: ${update.status}`)
                // Auto-view the status
                try {
                  await sock.sendReadReceipt(update.id)
                  console.log(`📱 Auto-viewed status from ${update.id}`)
                } catch (e) {
                  console.error('Error viewing status:', e)
                }
              }
            }
          })
        } catch (error) {
          console.error('Error auto-viewing status:', error)
        }
      }, 30000) // Check every 30 seconds
    }

    // Initialize auto-typing if enabled
    if (autoTyping) {
      initializeAutoTyping()
    }

    console.log('✅ Bot functionality initialized successfully!')
    console.log('📝 Bot will now respond to messages and commands')
  } catch (error) {
    console.error('❌ Error initializing bot functionality:', error)
  }
}

async function startBot() {
  try {
    console.log('🚀 Starting MazariBot...')

    const { version } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
    const msgRetryCounterCache = new NodeCache()

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      browser: ['Ubuntu', 'Chrome', '20.0.04'],
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }))
      },
      markOnlineOnConnect: true,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000
    })

    // Store sock globally for command execution
    global.sock = sock

    // ===== FIRST RUN AUTH FLOW =====
    if (!sock.authState.creds.registered) {
      if (!process.stdin.isTTY) {
        // Server mode: use PHONE_NUMBER env var
        if (PHONE_NUMBER) {
          const num = PHONE_NUMBER.replace(/[^0-9]/g, '')
          console.log(`📞 Using PHONE_NUMBER env var to request a pairing code for ${num}`)
          try {
            let code = await sock.requestPairingCode(num)
            code = code?.match(/.{1,4}/g)?.join('-') || code
            console.log(`\n🔐 Pairing Code: ${code}`)
            console.log('📱 WhatsApp → Settings → Linked Devices → Link with phone number')
          } catch (err) {
            console.error('❌ Failed to request pairing code:', err?.message || err)
          }
        }
      } else {
        // Local/dev interactive mode
        console.log('🔐 Choose login method')
        console.log('1️⃣  QR Code (scan in WhatsApp)')
        console.log('2️⃣  Pairing Code (enter your phone number)')

        const choice = await askQuestion('👉 Enter 1 or 2: ')
        if (choice === '1') {
          console.log('📷 QR Code mode selected. Waiting for QR...')
          sock.ev.on('connection.update', ({ qr }) => {
            if (qr) qrcode.generate(qr, { small: true })
          })
        } else if (choice === '2') {
          console.log('📱 Pairing Code mode selected.')
          const pn = await askQuestion('\n📞 Enter your WhatsApp number (e.g., 923232391033): ')
          const cleanPn = pn.replace(/[^0-9]/g, '')
          try {
            let code = await sock.requestPairingCode(cleanPn)
            code = code?.match(/.{1,4}/g)?.join('-') || code
            console.log(`\n🔐 Pairing Code: ${code}`)
            console.log('📱 WhatsApp → Settings → Linked Devices → Link with phone number')
          } catch (err) {
            console.error('❌ Failed to get pairing code:', err?.message || err)
          }
        } else {
          console.log('❌ Invalid choice.')
        }
      }
    }

    // ===== CONNECTION EVENTS =====
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      const status = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (connection === 'open') {
        console.log('✅ MazariBot connected successfully!')
        console.log('=====================================')
        console.log(`Bot Configuration:`)
        console.log(`- Bot Name: ${config.botName}`)
        console.log(`- Prefix: ${config.prefix}`)
        console.log(`- Private mode: ${config.private}`)
        console.log(`- Auto-reply: ${config.autoReply}`)
        console.log(`- Auto-react: ${autoReact}`)
        console.log(`- Auto-read: ${autoRead}`)
        console.log(`- Auto-status: ${autoStatusSeen}`)
        console.log(`- Auto-typing: ${autoTyping}`)
        console.log(`- Access: Everyone can use commands`)
        console.log(`- Connection: Mobile-based (NOT WhatsApp Web)`)
        console.log('=====================================')
        console.log('Ready to process commands!')
        console.log('Try: .ping, .help, .alive')
        console.log('✅ Bot is now listening for ALL messages (including self-messages)...')
        
        if (sock.user) {
          console.log(`Bot Info: { id: '${sock.user.id}', name: '${sock.user.name || 'Unknown'}' }`)
          console.log(`Bot Number: ${sock.user.id}`)
          console.log(`Bot Name: ${sock.user.name || 'Unknown'}`)
        }
        console.log(`⏰ Bot Status: Connected=true, Messages Received=${messageCount}`)
        
        reconnectAttempts = 0

        try {
          const botJid = sock.user.id
          if (botJid) {
            await sock.sendMessage(botJid, {
              text: '🤖 MazariBot is now ONLINE!\n✅ Ready to receive messages.\nUse `.help` for commands.'
            })
            console.log('📱 Connection status message sent')
          }
        } catch {}

        await initializeBot(sock)
      }

      if (connection === 'close') {
        const reason = DisconnectReason[status] || status
        console.log(`Connection closed. Reason: ${reason}`)

        if (status === DisconnectReason.loggedOut || status === 401) {
          console.log('Session logged out. Please re-link.')
          return
        }

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++
          console.log(`Reconnecting in ${RECONNECT_DELAY_MS / 1000}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`)
          await delay(RECONNECT_DELAY_MS)
          startBot()
        } else {
          console.log('❌ Max reconnect attempts reached. Exiting.')
          process.exit(1)
        }
      }
    })

    sock.ev.on('creds.update', saveCreds)
    return sock
  } catch (error) {
    console.error('❌ Error starting bot:', error)
    throw error
  }
}

// ====== PROCESS-LEVEL SAFETY NETS ====== 
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...')
  process.exit(0)
})

// Start the bot
startBot().catch((err) => {
  console.error('❌ Fatal startup error:', err)
  process.exit(1)
})
