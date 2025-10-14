# 🚀 Railway Deployment Guide for 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★ WhatsApp Bot

This guide will help you deploy your WhatsApp bot on Railway cloud platform with proper pairing setup.

## 📋 Prerequisites

- GitHub account
- Railway account (free tier available)
- WhatsApp account
- Basic knowledge of terminal/command line

## 🔧 Step 1: Prepare Your Bot

### 1.1 Fork/Clone the Repository
```bash
# Clone your bot repository
git clone https://github.com/yourusername/your-bot-repo.git
cd your-bot-repo

# Or fork the repository on GitHub
```

### 1.2 Update Configuration
Make sure your `src/config.json` is properly configured:
```json
{
  "botName": "𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★",
  "prefix": ".",
  "welcomeMessage": "Welcome! This is 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★. Use .help to see commands.",
  "autoStatusSeen": false,
  "autoReply": false,
  "autoReact": false,
  "private": true
}
```

## 🌐 Step 2: Deploy on Railway

### 2.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### 2.2 Deploy Your Bot
1. Click "New Project" on Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your bot repository
4. Railway will automatically detect it's a Node.js project

### 2.3 Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```env
# Bot Configuration
NODE_ENV=production
PORT=3000

# WhatsApp Configuration (Optional - for auto-pairing)
PHONE_NUMBER=+923437408518

# API Keys (Optional - for enhanced features)
WEATHER_API_KEY=your_weather_api_key
NEWS_API_KEY=your_news_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 2.4 Configure Build Settings
Railway will automatically detect your `package.json`, but you can customize:

```json
{
  "name": "zainbot",
  "version": "1.0.0",
  "description": "𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★ - WhatsApp bot scaffold (Baileys)",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 📱 Step 3: WhatsApp Pairing Setup

### 3.1 Initial Deployment
1. Deploy your bot on Railway
2. Go to Railway dashboard → Deployments
3. Click on your deployment to view logs
4. Your bot will start and show pairing options

### 3.2 Pairing Methods

#### Method 1: QR Code (Recommended for first time)
1. In Railway logs, you'll see a QR code
2. Open WhatsApp on your phone
3. Go to Settings → Linked Devices → Link a Device
4. Scan the QR code from Railway logs
5. Your bot will connect successfully

#### Method 2: Pairing Code
1. In Railway logs, choose pairing code option
2. Enter your WhatsApp number: `+923437408518`
3. Get the pairing code from logs
4. In WhatsApp:
   - Go to Settings → Linked Devices
   - Tap "Link a Device"
   - Choose "Link with Phone Number Instead"
   - Enter the pairing code

### 3.3 Session Persistence
Railway provides persistent storage, so your bot session will be saved and automatically reconnect on restarts.

## 🔄 Step 4: Auto-Deployment Setup

### 4.1 Enable Auto-Deploy
1. In Railway dashboard → Settings
2. Enable "Auto-Deploy" for your branch
3. Any push to your repository will automatically redeploy

### 4.2 Custom Domain (Optional)
1. Go to Railway dashboard → Settings → Domains
2. Add a custom domain if needed
3. Your bot will be accessible at your custom domain

## 📊 Step 5: Monitoring & Logs

### 5.1 View Logs
- Go to Railway dashboard → Deployments
- Click on your latest deployment
- View real-time logs to monitor bot activity

### 5.2 Monitor Usage
- Railway dashboard shows CPU, Memory, and Network usage
- Free tier includes 500 hours/month
- Upgrade if you need more resources

## 🛠️ Step 6: Bot Management

### 6.1 Restart Bot
```bash
# Via Railway dashboard
# Go to Deployments → Click "Redeploy"

# Via Railway CLI (optional)
railway redeploy
```

### 6.2 Update Bot
1. Make changes to your code
2. Push to GitHub
3. Railway will auto-deploy the updates

### 6.3 Environment Variables
Update environment variables in Railway dashboard → Variables tab:
- Changes take effect on next deployment
- No code changes needed for config updates

## 🔒 Step 7: Security Best Practices

### 7.1 Protect Your Session
- Never share your `auth_info` folder
- Use environment variables for sensitive data
- Regularly backup your bot configuration

### 7.2 API Keys Security
- Store API keys in Railway environment variables
- Never commit API keys to your repository
- Use different keys for development and production

## 📱 Step 8: WhatsApp Connection Management

### 8.1 Connection Issues
If your bot disconnects:
1. Check Railway logs for errors
2. The bot will auto-reconnect within 30 seconds
3. If persistent issues, redeploy the bot

### 8.2 Session Recovery
- Railway maintains session data between deployments
- Your bot will automatically reconnect using saved session
- No need to re-pair unless session is corrupted

## 🚨 Troubleshooting

### Common Issues:

#### Bot Not Starting
```bash
# Check Railway logs for errors
# Common fixes:
- Ensure package.json has correct start script
- Check if all dependencies are installed
- Verify Node.js version compatibility
```

#### WhatsApp Connection Failed
```bash
# Solutions:
1. Check if phone number is correct (+923437408518)
2. Ensure WhatsApp is installed and active
3. Try pairing code method instead of QR
4. Wait for auto-reconnection
```

#### Commands Not Working
```bash
# Check:
1. Bot is properly connected to WhatsApp
2. Commands are using correct prefix (.)
3. Check Railway logs for command execution errors
4. Verify all command files are uploaded
```

## 📈 Step 9: Scaling & Performance

### 9.1 Resource Limits
- Free tier: 512MB RAM, 1GB storage
- Upgrade for more resources if needed
- Monitor usage in Railway dashboard

### 9.2 Performance Optimization
```javascript
// In your bot code, you can add:
const config = {
    maxReconnectAttempts: 5,
    reconnectDelay: 5000,
    messageRetryCount: 3
};
```

## 🎯 Step 10: Testing Your Deployment

### 10.1 Test Commands
After deployment, test these commands in WhatsApp:
```
.ping          # Check bot response
.help          # Show all commands
.ownerinfo     # Show owner information
.alive         # Check if bot is online
```

### 10.2 Verify Features
- ✅ Bot responds to commands
- ✅ Auto-reactions work
- ✅ Media downloads function
- ✅ Group management commands work
- ✅ Owner commands are restricted

## 📞 Support & Maintenance

### Regular Maintenance:
1. **Weekly**: Check Railway logs for errors
2. **Monthly**: Update dependencies
3. **As needed**: Monitor resource usage

### Getting Help:
- Check Railway documentation: [docs.railway.app](https://docs.railway.app)
- WhatsApp Bot community forums
- GitHub issues for your bot repository

## 🎉 Congratulations!

Your 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★ WhatsApp Bot is now successfully deployed on Railway! 

### Your Bot Features:
- ✅ Cloud-hosted on Railway
- ✅ Auto-deployment from GitHub
- ✅ Persistent WhatsApp session
- ✅ 24/7 availability
- ✅ Scalable infrastructure
- ✅ Real-time monitoring

### Next Steps:
1. Share your bot with friends
2. Monitor usage in Railway dashboard
3. Add more features as needed
4. Scale up if you get more users

---

**Made with ❤️ by 𝒵𝒜𝐼𝒩 • 𝒳𝒟 ★**

*For support, contact: +92 343 7408518 or Instagram: [@zain.maalik47](https://www.instagram.com/zain.maalik47?utm_source=qr)*
