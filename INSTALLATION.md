# MazariBot Installation Guide

## Prerequisites

### System Requirements
- **Node.js**: Version 16.x or higher
- **FFmpeg**: Required for media processing
- **Operating System**: Windows, macOS, or Linux

### Install Node.js
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Install with default settings
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Install FFmpeg

#### Windows:
1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html)
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your PATH environment variable
4. Verify installation:
   ```cmd
   ffmpeg -version
   ```

#### macOS:
```bash
brew install ffmpeg
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install ffmpeg
```

## Quick Installation

### Method 1: Using requirements.txt (Recommended)
```bash
# Clone or download the MazariBot project
# Navigate to the project directory
cd MazariBot

# Install all dependencies
npm install

# Start the bot
npm start
```

### Method 2: Manual Installation
```bash
# Install core dependencies
npm install @whiskeysockets/baileys@^6.7.20
npm install @hapi/boom@^10.0.1
npm install qrcode-terminal@^0.12.0
npm install node-cache@^5.1.2
npm install pino@^8.0.0

# Install additional features
npm install fs-extra@^11.3.2
npm install axios@^1.12.2
npm install jimp@^1.6.0
npm install gtts@^0.2.1
npm install moment@^2.30.1

# Start the bot
npm start
```

## First Time Setup

1. **Run the bot**:
   ```bash
   node src/index.js
   ```

2. **Choose connection method**:
   - QR Code: Scan with your phone
   - Pairing Code: Enter your phone number

3. **Configure the bot**:
   - Edit `src/config.json` for basic settings
   - Use commands like `.autoreact on` to enable features

## Troubleshooting

### Common Issues

#### "FFmpeg not found"
- Ensure FFmpeg is installed and in your PATH
- Restart your terminal/command prompt after installation

#### "Cannot find module"
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again

#### "Connection failed"
- Clear the `auth_info` folder
- Restart the bot and re-pair

#### "Permission denied" (Linux/macOS)
- Use `sudo` if needed for system-wide installations
- Or install Node.js via a version manager like nvm

### Getting Help
- Check the README.md for basic usage
- Use `.help` command in the bot for available commands
- Contact: +923232391033

## Project Structure
```
MazariBot/
├── src/
│   ├── index.js          # Main bot file
│   └── config.json       # Bot configuration
├── commands/             # Bot commands
├── data/                 # Data storage
├── lib/                  # Utility libraries
├── requirements.txt      # Dependencies list
└── README.md            # Basic documentation
```

## Features Included
- ✅ WhatsApp connection via Baileys
- ✅ 80+ commands
- ✅ Auto-reactions and auto-replies
- ✅ Media processing (images, audio, video) - Mobile compatible
- ✅ Group management tools
- ✅ AI integration
- ✅ Mobile-based connection (not WhatsApp Web)
- ✅ **Android/Termux Compatible** - Uses jimp instead of sharp for image processing

## Support
- **Owners**: ZOXER & MAZARI
- **WhatsApp**: +923232391033
- **Channels**: 
  - ZOXER Official: https://whatsapp.com/channel/0029VbBRITODzgTGQhZSFT3P
  - MAZARI TECH: https://whatsapp.com/channel/0029Vb6GUj8BPzjOWNfnhm1B

---
*Made with ❤️ by ZOXER & MAZARI*

