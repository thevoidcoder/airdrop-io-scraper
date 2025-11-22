# 🚀 Quick Start Guide

## Get Running in 3 Steps!

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Configure Telegram Bot
```bash
# Copy the example file
cp .env.example .env

# Edit with your credentials
nano .env
```

Add your Telegram credentials:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
TELEGRAM_TOPIC_HOT=hot_topic_id
TELEGRAM_TOPIC_LATEST=latest_topic_id
TELEGRAM_TOPIC_UPDATED=updated_topic_id
```

Need help? See [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) for detailed instructions.

### 3️⃣ Run the Scraper
```bash
npm start
```

## 📊 What Happens?

1. **First Run**: All ~589 airdrops sent to Telegram
2. **Subsequent Runs**: Only new/changed airdrops sent

## 🎯 Smart Notifications

- **🔥 Hot Topic**: Only NEW hot airdrops
- **⚡ Latest Topic**: Only NEW latest airdrops  
- **🔄 Updated Topic**: ALL updates (new + changed)

## ⏰ Schedule Automatic Updates

### Option 1: Cron Job
```bash
# Edit crontab
crontab -e

# Run every 30 minutes
*/30 * * * * cd /path/to/airdrop-io-scraper && npm start
```

### Option 2: PM2
```bash
# Install PM2
npm install -g pm2

# Start with cron
pm2 start index.js --cron "*/30 * * * *"
```

## 📁 Important Files

- `.env` - Your credentials (NOT committed to git)
- `airdrops.json` - Scraped data (updated each run)
- `telegram-bot.js` - Bot logic
- `change-detector.js` - Change detection logic

## 🔧 Commands

```bash
npm start           # Run scraper
npm run summary     # View statistics
```

## 📚 Documentation

- [README.md](README.md) - Full documentation
- [TELEGRAM_SETUP.md](TELEGRAM_SETUP.md) - Telegram bot setup
- [STRUCTURE.md](STRUCTURE.md) - JSON structure
- [UPDATE_SUMMARY.md](UPDATE_SUMMARY.md) - Changelog

## 🆘 Troubleshooting

### No messages sent?
- Check `.env` file exists and has correct values
- Ensure bot is added to group as admin
- Verify topic IDs are correct

### Wrong messages/topics?
- Double-check topic IDs in `.env`
- Try sending test message in each topic
- Re-check the getUpdates URL

### Rate limiting?
- Default 2s delay is safe
- Increase delay in `telegram-bot.js` if needed

## ✨ You're All Set!

The scraper will automatically:
- ✅ Track changes between runs
- ✅ Send only new airdrops to hot/latest
- ✅ Send all updates to updated topic  
- ✅ Include summary reports
- ✅ Handle rate limiting

Happy airdrop hunting! 🎁
