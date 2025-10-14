/**
 * MazariBot - A WhatsApp Bot
 * Copyright (c) 2024 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★
 * MIT License
 */

require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const qrcode = require('qrcode-terminal')
const NodeCache = require('node-cache')
const pino = require('pino')
const readline = require('readline')
const path = require('path')
const express = require('express')

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
    
    console.log(chalk.cyan(`\n📨 Message #${messageCount}: "${messageContent}" from ${isFromMeMsg ? 'YOU' : 'OTHER'} (${senderJid})`))
    
    if (messageContent.startsWith(config.prefix)) {
      console.log(chalk.yellow(`🎯 COMMAND DETECTED: ${messageContent}`))
    }

    // Auto react feature
    if (config.autoReact && !isGroup && !messageContent.startsWith(config.prefix) && !messageContent.match(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]$/u)) {
      try {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)]
        await sock.sendMessage(senderJid, { react: { text: emoji, key: msg.key } })
        console.log(chalk.green(`😊 Auto-reacted with: ${emoji}`))
      } catch (e) {
        console.error(chalk.red('Error reacting to message:'), e)
      }
    }

    // Auto reply feature
    if (config.autoReply && !isFromMeMsg && !isGroup) {
      try {
        await sock.sendMessage(senderJid, { text: config.welcomeMessage })
        console.log(chalk.green(`💬 Auto-reply sent`))
      } catch (e) {
        console.error(chalk.red('Error sending welcome message:'), e)
      }
    }

    // Command processing
    const text = messageContent || ''
    
    if (text.startsWith(config.prefix)) {
      const commandName = text.split(' ')[0].slice(config.prefix.length).toLowerCase()
      const args = text.split(' ').slice(1)

      console.log(chalk.magenta(`🚀 EXECUTING COMMAND: ${commandName} with args: [${args.join(', ')}]`))

      const response = await executeCommand(commandName, args, msg, senderJid, isFromMeMsg)
      
      if (response) {
        try {
          await sock.sendMessage(senderJid, { text: response })
          console.log(chalk.green(`✅ RESPONSE SENT: ${response.substring(0, 50)}...`))
        } catch (e) {
          console.error(chalk.red('❌ Error sending command response:'), e)
        }
      } else {
        console.log(chalk.yellow(`⚠️ No response from command: ${commandName}`))
      }
    }

  } catch (error) {
    console.error(chalk.red('❌ Error in message handler:'), error)
  }
}

// ==== COMMAND EXECUTOR ====
async function executeCommand(commandName, args, msg, senderJid, isFromMe) {
  try {
    console.log(chalk.blue(`Executing command: ${commandName}`))
    
    const commandPath = path.join(__dirname, '..', 'commands', `${commandName}.js`)
    
    if (fs.existsSync(commandPath)) {
      try {
        console.log(chalk.blue(`Loading external command: ${commandPath}`))
        
        delete require.cache[require.resolve(commandPath)]
        
        const commandModule = require(commandPath)
        
        const mockChat = {
          id: senderJid,
          isGroup: isJidGroup(senderJid)
        }
        
        const mockMsg = {
          ...msg,
          reply: async (text) => {
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
        
        let result
        console.log(chalk.blue(`Command module keys: ${Object.keys(commandModule)}`))
        
        if (commandModule.handleCommand) {
          console.log(chalk.blue('Using handleCommand function'))
          result = await commandModule.handleCommand(sock, mockChat, mockMsg, args)
        } else if (commandModule.info && commandModule.info.name) {
          console.log(chalk.blue('Using info.handleCommand function'))
          result = await commandModule.handleCommand(sock, mockChat, mockMsg, args)
        } else if (commandModule[commandName]) {
          console.log(chalk.blue(`Using ${commandName} function`))
          result = await commandModule[commandName](sock, mockChat, mockMsg, args)
        } else if (commandModule.default) {
          console.log(chalk.blue('Using default function'))
          result = await commandModule.default(sock, mockChat, mockMsg, args)
        } else if (typeof commandModule === 'function') {
          console.log(chalk.blue('Using direct function export'))
          result = await commandModule(sock, mockChat, mockMsg, args)
        } else {
          console.log(chalk.yellow('No valid command handler found, using fallback'))
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
        console.error(chalk.red(`Error in external command ${commandName}:`), commandError)
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
    console.error(chalk.red('Error executing command:'), error)
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
async function initializeBot(sock) {
  try {
    console.log(chalk.blue('🔧 Initializing bot functionality...'))

    sock.ev.on('messages.upsert', async (messageUpdate) => {
      try {
        await handleMessages(sock, messageUpdate, true)
      } catch (error) {
        console.error(chalk.red('❌ Error handling message:'), error)
      }
    })

    console.log(chalk.green('✅ Bot functionality initialized successfully!'))
    console.log(chalk.cyan('📝 Bot will now respond to messages and commands'))
  } catch (error) {
    console.error(chalk.red('❌ Error initializing bot functionality:'), error)
  }
}

async function startBot() {
  try {
    console.log(chalk.cyan('🚀 Starting 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★...'))

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
          console.log(chalk.yellow(`📞 Using PHONE_NUMBER env var to request a pairing code for ${num}`))
          try {
            let code = await sock.requestPairingCode(num)
            code = code?.match(/.{1,4}/g)?.join('-') || code
            console.log(chalk.magenta('\n🔐 Pairing Code:'), chalk.bgGreen.black(code))
            console.log(chalk.cyan('📱 WhatsApp → Settings → Linked Devices → Link with phone number'))
          } catch (err) {
            console.error(chalk.red('❌ Failed to request pairing code:'), err?.message || err)
          }
        }
      } else {
        // Local/dev interactive mode
        console.log(chalk.cyan('🔐 Choose login method'))
        console.log(chalk.yellow('1️⃣  QR Code (scan in WhatsApp)'))
        console.log(chalk.yellow('2️⃣  Pairing Code (enter your phone number)'))

        const choice = await askQuestion(chalk.green('👉 Enter 1 or 2: '))
        if (choice === '1') {
          console.log(chalk.green('📷 QR Code mode selected. Waiting for QR...'))
          sock.ev.on('connection.update', ({ qr }) => {
            if (qr) qrcode.generate(qr, { small: true })
          })
        } else if (choice === '2') {
          console.log(chalk.green('📱 Pairing Code mode selected.'))
          const pn = await askQuestion(chalk.green('\n📞 Enter your WhatsApp number (e.g., 923232391033): '))
          const cleanPn = pn.replace(/[^0-9]/g, '')
          try {
            let code = await sock.requestPairingCode(cleanPn)
            code = code?.match(/.{1,4}/g)?.join('-') || code
            console.log(chalk.magenta('\n🔐 Pairing Code:'), chalk.bgGreen.black(code))
            console.log(chalk.cyan('📱 WhatsApp → Settings → Linked Devices → Link with phone number'))
          } catch (err) {
            console.error(chalk.red('❌ Failed to get pairing code:'), err?.message || err)
          }
        } else {
          console.log(chalk.red('❌ Invalid choice.'))
        }
      }
    }

    // ===== CONNECTION EVENTS =====
    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      const status = new Boom(lastDisconnect?.error)?.output?.statusCode
      if (connection === 'open') {
        console.log(chalk.green('✅ 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★ connected successfully!'))
        console.log(chalk.cyan('====================================='))
        console.log(chalk.blue(`Bot Configuration:`))
        console.log(chalk.blue(`- Bot Name: ${config.botName}`))
        console.log(chalk.blue(`- Prefix: ${config.prefix}`))
        console.log(chalk.blue(`- Private mode: ${config.private}`))
        console.log(chalk.blue(`- Auto-reply: ${config.autoReply}`))
        console.log(chalk.blue(`- Auto-react: ${config.autoReact}`))
        console.log(chalk.blue(`- Auto-read: ${config.autoStatusSeen}`))
        console.log(chalk.blue(`- Access: Everyone can use commands`))
        console.log(chalk.blue(`- Connection: Mobile-based (NOT WhatsApp Web)`))
        console.log(chalk.cyan('====================================='))
        console.log(chalk.green('Ready to process commands!'))
        console.log(chalk.yellow('Try: .ping, .help, .alive'))
        console.log(chalk.green('✅ Bot is now listening for ALL messages (including self-messages)...'))
        
        if (sock.user) {
          console.log(chalk.blue(`Bot Info: { id: '${sock.user.id}', name: '${sock.user.name || 'Unknown'}' }`))
          console.log(chalk.blue(`Bot Number: ${sock.user.id}`))
          console.log(chalk.blue(`Bot Name: ${sock.user.name || 'Unknown'}`))
        }
        console.log(chalk.blue(`⏰ Bot Status: Connected=true, Messages Received=${messageCount}`))
        
        reconnectAttempts = 0

        try {
          const botJid = sock.user.id
          if (botJid) {
            await sock.sendMessage(botJid, {
              text: '🤖 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★ is now ONLINE!\n✅ Ready to receive messages.\nUse `.help` for commands.'
            })
            console.log(chalk.green('📱 Connection status message sent'))
          }
        } catch {}

        await initializeBot(sock)
      }

      if (connection === 'close') {
        const reason = DisconnectReason[status] || status
        console.log(chalk.yellow(`Connection closed. Reason: ${reason}`))

        if (status === DisconnectReason.loggedOut || status === 401) {
          console.log(chalk.red('Session logged out. Please re-link.'))
          return
        }

        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++
          console.log(chalk.gray(`Reconnecting in ${RECONNECT_DELAY_MS / 1000}s... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`))
          await delay(RECONNECT_DELAY_MS)
          startBot()
        } else {
          console.log(chalk.red('❌ Max reconnect attempts reached. Exiting.'))
          process.exit(1)
        }
      }
    })

    sock.ev.on('creds.update', saveCreds)
    return sock
  } catch (error) {
    console.error(chalk.red('❌ Error starting bot:'), error)
    throw error
  }
}

// ====== PROCESS-LEVEL SAFETY NETS ====== 
process.on('uncaughtException', (err) => {
  console.error(chalk.red('❌ Uncaught Exception:'), err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error(chalk.red('❌ Unhandled Rejection:'), err)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Shutting down gracefully...'))
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n🛑 Received SIGTERM, shutting down...'))
  process.exit(0)
})

// Start the bot
startBot().catch((err) => {
  console.error(chalk.red('❌ Fatal startup error:'), err)
  process.exit(1)
})

