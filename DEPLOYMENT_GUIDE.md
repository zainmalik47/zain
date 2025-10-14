# 🚀 Complete Deployment Guide - 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★ Bot

## 🎯 Quick Deploy Options

### Option 1: Railway (Recommended) 🚄

**One-Click Deploy**: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/sarukhmazari/zainbot&envs=BOT_NAME%2CPHONE_NUMBER)

#### Steps:
1. **Click the Railway button above**
2. **Connect your GitHub account**
3. **Set environment variables**:
   - `BOT_NAME`: `𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★`
   - `PHONE_NUMBER`: Your WhatsApp number (e.g., `923437408518`)
4. **Click Deploy**
5. **Wait for deployment** (2-3 minutes)
6. **Check logs** for QR code or pairing code
7. **Pair your WhatsApp** using the code

### Option 2: Local Development 💻

#### Prerequisites:
- Node.js 18+ installed
- Git installed
- WhatsApp account

#### Steps:
```bash
# 1. Clone the repository
git clone https://github.com/sarukhmazari/zainbot.git
cd zainbot

# 2. Install dependencies
npm install

# 3. Configure bot (optional)
# Edit src/config.json to customize settings

# 4. Start the bot
node src/index.js

# 5. Choose authentication method:
# Option 1: QR Code (scan with WhatsApp)
# Option 2: Pairing Code (enter in WhatsApp)
```

### Option 3: Termux (Android) 📱

#### Prerequisites:
- Android device with Termux
- WhatsApp account
- Internet connection

#### Steps:
```bash
# 1. Update Termux
pkg update && pkg upgrade

# 2. Install Node.js
pkg install nodejs git

# 3. Clone repository
git clone https://github.com/sarukhmazari/zainbot.git
cd zainbot

# 4. Install dependencies
npm install

# 5. Start bot
node src/index.js
```

## 🔐 Authentication Methods

### QR Code Method (Recommended)
1. Run the bot
2. Choose option `1` (QR Code)
3. Scan QR code with WhatsApp:
   - Open WhatsApp → Settings → Linked Devices → Link a Device
   - Scan the displayed QR code

### Pairing Code Method
1. Run the bot
2. Choose option `2` (Pairing Code)
3. Enter your WhatsApp number (e.g., `923437408518`)
4. Copy the pairing code from terminal
5. In WhatsApp:
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Choose "Link with Phone Number Instead"
   - Enter the pairing code

## ⚙️ Configuration

### Environment Variables (Railway)
- `BOT_NAME`: Bot display name
- `PHONE_NUMBER`: WhatsApp number for pairing
- `PREFIX`: Command prefix (default: `.`)
- `PRIVATE`: Private mode (true/false)

### Config File (Local/Termux)
Edit `src/config.json`:
```json
{
  "botName": "𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★",
  "prefix": ".",
  "private": true,
  "autoReply": true,
  "autoReact": false,
  "autoStatusSeen": false,
  "welcomeMessage": "𝐻𝑒𝓁𝓁𝑜 𝒲𝑒 𝒜𝓇𝑒 𝓊𝓃𝒶𝓋𝒶𝒾𝓁𝒶𝓫𝓁𝑒 𝑅𝒾𝑔𝒽𝓉 𝒩𝑜𝓌 𝓅𝓁𝑒𝒶𝓈𝑒 𝒷𝑒 𝒫𝒶𝓉𝒾𝑒𝓃𝓉 .... 🌸\n\n𝐵𝑒𝓈𝓉 𝑅𝑒𝑔𝒶𝓇𝒹𝓈:- 𝒴𝑜𝓊𝓈'𝓈 𝒵𝒶𝒾𝓃 𝒳𝒟"
}
```

## 🎮 Bot Features

### 🤖 Core Features
- **Mobile-based connection** (no WhatsApp Web)
- **Auto-reply system** with custom messages
- **Auto-reactions** to messages
- **Auto-read** messages
- **Status viewer** functionality

### 📱 Commands (100+)
- **Bot Commands**: `.ping`, `.help`, `.alive`, `.info`
- **Owner Commands**: `.addowner`, `.ownerinfo`, `.setpp`
- **Admin Commands**: `.kick`, `.ban`, `.promote`, `.mute`
- **Fun Commands**: `.joke`, `.quote`, `.meme`, `.truth`, `.dare`
- **Media Commands**: `.video`, `.song`, `.tiktok`, `.instagram`
- **Utility Commands**: `.translate`, `.weather`, `.news`, `.ai`

## 🔧 Troubleshooting

### Common Issues

#### Bot Not Starting
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Authentication Failed
```bash
# Clear session data
rm -rf auth_info/
rm -f baileys_store.json

# Restart bot
node src/index.js
```

#### Railway Deployment Issues
1. Check environment variables
2. Verify repository is public
3. Check Railway logs for errors
4. Ensure all files are committed

### Getting Help
- **Owner**: 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★
- **Contact**: +92 343 7408518
- **Instagram**: [@zain.maalik47](https://www.instagram.com/zain.maalik47?utm_source=qr)

## 📊 Bot Statistics

- **Commands**: 100+
- **Features**: Auto-reply, Auto-react, Media download
- **Languages**: Multi-language support
- **Platforms**: Railway, Local, Termux
- **Authentication**: QR Code + Pairing Code

## 🎉 Success Checklist

After deployment, verify:
- [ ] Bot starts without errors
- [ ] WhatsApp connection established
- [ ] Commands respond correctly
- [ ] Auto-reply works (if enabled)
- [ ] All features functional

---

**🎯 Ready to deploy? Click the Railway button above for instant deployment!**

*Made with ❤️ by 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★*
