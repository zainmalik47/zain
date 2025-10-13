# 🤖 MazariBot - WhatsApp Bot

A powerful, mobile-based WhatsApp bot built with Baileys library. This bot supports both QR code and pairing code authentication methods.

## 📱 Features

- **Mobile-based Connection** (NOT WhatsApp Web)
- **Pair Code System** - Real WhatsApp pairing codes
- **80+ Commands** - Fun, utility, admin, and owner commands
- **Auto-reactions** and **Auto-replies**
- **Group Management** tools
- **Media Download** (YouTube, TikTok, Instagram, etc.)
- **AI Integration** capabilities
- **Multi-language Support**

## 🚀 Quick Start in Termux

### Prerequisites
- Android device with Termux installed
- WhatsApp account
- Internet connection

### Step 1: Install Termux Dependencies

```bash
# Update packages
pkg update && pkg upgrade

# Install Node.js and essential tools
pkg install nodejs git curl wget

# Verify installation
node --version
npm --version
```

### Step 2: Clone/Download the Bot

```bash
# Create a directory for the bot
mkdir ~/MazariBot
cd ~/MazariBot

# If you have the bot files, copy them here
# Or clone from repository if available
```

### Step 3: Install Bot Dependencies

```bash
# Install all required packages
npm install @whiskeysockets/baileys @hapi/boom qrcode-terminal node-cache pino

# If you encounter dependency conflicts, use:
npm install @whiskeysockets/baileys @hapi/boom qrcode-terminal node-cache pino --legacy-peer-deps --force
```

### Step 4: Configure the Bot

```bash
# Check if config files exist
ls -la src/

# If config.json doesn't exist, create it:
cat > src/config.json << EOF
{
  "botName": "MazariBot",
  "prefix": ".",
  "private": true,
  "autoReply": false,
  "autoReact": false,
  "autoStatusSeen": false,
  "welcomeMessage": "Welcome! This is MazariBot. Use .help to see commands."
}
EOF

# Create emojis.json if it doesn't exist:
cat > src/emojis.json << EOF
["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"]
EOF
```

### Step 5: Start the Bot

```bash
# Navigate to bot directory
cd ~/MazariBot

# Start the bot
node src/index.js
```

## 🔐 Authentication Methods

### Method 1: QR Code (Recommended for first time)

1. Run `node src/index.js`
2. Choose option `1` (QR Code)
3. Scan the QR code with WhatsApp:
   - Open WhatsApp → Settings → Linked Devices → Link a Device
   - Scan the QR code displayed in Termux

### Method 2: Pair Code (Alternative method)

1. Run `node src/index.js`
2. Choose option `2` (Pairing Code)
3. Enter your WhatsApp number (e.g., `923232391033`)
4. Get the pairing code from terminal
5. In WhatsApp:
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Choose "Link with Phone Number Instead"
   - Enter the pairing code

## 📋 Available Commands

### 🤖 Bot Commands
- `.ping` - Check bot response time
- `.help` - Show all commands
- `.alive` - Check if bot is online
- `.info` - Show bot information
- `.menu` - Show command menu

### 👑 Owner Commands
- `.addowner <number>` - Add new owner
- `.removeowner <number>` - Remove owner
- `.ownerinfo` - Show owner details
- `.setpp` - Set bot profile picture

### 👮 Admin Commands (Group)
- `.kick @user` - Kick member from group
- `.ban @user` - Ban user from group
- `.promote @user` - Promote to admin
- `.demote @user` - Demote admin
- `.mute @user` - Mute user
- `.warn @user` - Warn user

### 🎮 Fun Commands
- `.joke` - Random jokes
- `.quote` - Inspirational quotes
- `.meme` - Random memes
- `.truth` - Truth questions
- `.dare` - Dare challenges
- `.compliment` - Get compliments
- `.ship @user1 @user2` - Ship two people

### 📺 Media Commands
- `.video <query>` - Download YouTube video
- `.song <name>` - Download songs
- `.tiktok <url>` - Download TikTok video
- `.instagram <url>` - Download Instagram content
- `.sticker` - Create sticker from image

### 🛠️ Utility Commands
- `.translate <text>` - Translate text
- `.weather <city>` - Weather information
- `.news` - Latest news
- `.ai <message>` - Chat with AI
- `.github <username>` - GitHub profile

### 👥 Group Commands
- `.groupinfo` - Show group information
- `.tagall` - Tag all members
- `.topmembers` - Most active members
- `.warnings` - Show user warnings

## ⚙️ Configuration

### Bot Settings (src/config.json)

```json
{
  "botName": "MazariBot",
  "prefix": ".",
  "private": true,
  "autoReply": false,
  "autoReact": false,
  "autoStatusSeen": false,
  "welcomeMessage": "Welcome! This is MazariBot. Use .help to see commands."
}
```

### Environment Variables (Optional)

```bash
# Set session directory
export SESSION_DIR="./auth_info"

# Set phone number for auto-pairing (server mode)
export PHONE_NUMBER="923232391033"
```

## 🔧 Troubleshooting

### Common Issues in Termux

#### 1. Node.js Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall Node.js
pkg remove nodejs
pkg install nodejs
```

#### 2. Permission Errors
```bash
# Grant storage permission to Termux
termux-setup-storage

# Fix file permissions
chmod +x src/index.js
```

#### 3. Dependency Conflicts
```bash
# Install with legacy peer deps
npm install --legacy-peer-deps --force

# Or install specific versions
npm install @whiskeysockets/baileys@6.7.20 --legacy-peer-deps
```

#### 4. QR Code Not Displaying
```bash
# Install additional terminal tools
pkg install termux-api

# Or use external QR viewer
# The QR code will be displayed as text - you can scan it with any QR scanner app
```

#### 5. Bot Not Responding
```bash
# Check if bot is running
ps aux | grep node

# Check logs for errors
node src/index.js 2>&1 | tee bot.log
```

### Session Management

#### Clear Session (Start Fresh)
```bash
# Remove authentication data
rm -rf auth_info/
rm -rf baileys_store.json

# Restart bot
node src/index.js
```

#### Backup Session
```bash
# Create backup
tar -czf session_backup.tar.gz auth_info/ baileys_store.json

# Restore backup
tar -xzf session_backup.tar.gz
```

## 📱 Termux Tips

### Running Bot in Background
```bash
# Using nohup
nohup node src/index.js > bot.log 2>&1 &

# Using screen (install first: pkg install screen)
screen -S mazaribot
node src/index.js
# Press Ctrl+A, then D to detach
# Use 'screen -r mazaribot' to reattach
```

### Auto-start on Boot
```bash
# Create startup script
cat > ~/.termux/boot/start-bot.sh << EOF
#!/bin/bash
cd ~/MazariBot
node src/index.js &
EOF

chmod +x ~/.termux/boot/start-bot.sh
```

### Monitoring Bot Status
```bash
# Check if bot is running
pgrep -f "node src/index.js"

# View recent logs
tail -f bot.log

# Check memory usage
ps -o pid,ppid,cmd,%mem,%cpu --sort=-%mem | grep node
```

## 🔒 Security Notes

- Never share your session files (`auth_info/` directory)
- Keep your bot number private
- Use strong, unique phone numbers for production
- Regularly backup your configuration

## 📞 Support

For support and updates:
- **Owner**: ZOXER
- **Number**: +923232391033
- **Channels**: 
  - [ZOXER Official](https://whatsapp.com/channel/0029VbBRITODzgTGQhZSFT3P)
  - [MAZARI TECH](https://whatsapp.com/channel/0029Vb6GUj8BPzjOWNfnhm1B)
- **YouTube**: [ZOXER Tech](https://youtube.com/@zoxertech)

## 📄 License

MIT License - Feel free to modify and distribute.

---

**Made with ❤️ by ZOXER & MAZARI**

*This bot is for educational purposes only. Use responsibly and in accordance with WhatsApp's Terms of Service.*