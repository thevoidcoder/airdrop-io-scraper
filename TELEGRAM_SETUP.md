# Telegram Bot Setup Guide

This guide will help you set up the Telegram bot integration for the Airdrop Scraper.

## 📋 Prerequisites

- A Telegram account
- Admin access to a Telegram group (or create a new one)
- The group must have Topics enabled

## 🤖 Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a conversation and send `/newbot`
3. Follow the prompts:
   - Choose a name for your bot (e.g., "Airdrop Notifier")
   - Choose a username ending in "bot" (e.g., "airdrop_notifier_bot")
4. **Save the bot token** - You'll need this for the `.env` file

Example:
```
Use this token to access the HTTP API:
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
```

## 👥 Step 2: Set Up Your Telegram Group

1. Create a new Telegram group or use an existing one
2. Add your bot to the group:
   - Click on group name → "Add Members"
   - Search for your bot username
   - Add the bot
3. Make the bot an admin (optional but recommended):
   - Group Settings → Administrators
   - Add your bot as administrator

## 📝 Step 3: Enable Topics

1. Open group settings
2. Enable "Topics" if not already enabled
3. Create three topics:
   - **🔥 Hot Airdrops** - For trending airdrops
   - **⚡ Latest Airdrops** - For newest airdrops
   - **🔄 Updated Airdrops** - For recently updated airdrops

## 🔍 Step 4: Get Chat ID and Topic IDs

### Get Chat ID:

1. Send any message in your group
2. Open this URL in your browser (replace `<BOT_TOKEN>` with your bot token):
   ```
   https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
   ```
3. Look for the `chat` object in the response:
   ```json
   {
     "chat": {
       "id": -1001234567890,
       "title": "Your Group Name",
       "type": "supergroup"
     }
   }
   ```
4. **Save the chat ID** (including the negative sign if present)

### Get Topic IDs:

1. Send a message **in each topic** you created
2. Refresh the getUpdates URL
3. For each message, find the `message_thread_id`:
   ```json
   {
     "message": {
       "message_thread_id": 2,
       "chat": { ... },
       "text": "test message"
     }
   }
   ```
4. **Save each topic ID** corresponding to:
   - Hot Airdrops topic
   - Latest Airdrops topic
   - Updated Airdrops topic

## ⚙️ Step 5: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your credentials:
   ```env
   # Your bot token from BotFather
   TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
   
   # Your group's chat ID (include the negative sign)
   TELEGRAM_CHAT_ID=-1001234567890
   
   # Topic IDs (numbers only)
   TELEGRAM_TOPIC_HOT=2
   TELEGRAM_TOPIC_LATEST=3
   TELEGRAM_TOPIC_UPDATED=4
   ```

3. Save the file

## ✅ Step 6: Test the Setup

Run the scraper to test:
```bash
npm start
```

The scraper will:
1. ✓ Validate your environment variables
2. ✓ Test the bot connection
3. ✓ Fetch airdrops
4. ✓ Detect changes
5. ✓ Send notifications to your Telegram topics

You should see messages like:
```
✓ Bot connected: @your_bot_username
🔥 Sending X new hot airdrops...
   ✓ Sent: X, Failed: 0
⚡ Sending X new latest airdrops...
   ✓ Sent: X, Failed: 0
```

## 🎯 Expected Behavior

### First Run:
- All airdrops are considered "new"
- Notifications sent to all three topics
- Summary reports sent to each topic

### Subsequent Runs:
- **Hot & Latest Topics**: Only truly new airdrops are sent
- **Updated Topic**: All airdrops (new + changed) are sent
- No notifications if no changes detected

## 📱 Message Format

Each airdrop notification includes:
- ✅/🔔 Confirmation status
- 🆕/🔄 New or Updated badge
- 📌 Airdrop title
- 🌡️ Temperature rating
- ⚡ Required actions
- 🏷️ Categories (as hashtags)
- 📋 Requirements (Twitter, Telegram, KYC, etc.)
- 🔗 Links to details and claim pages

## 🔧 Troubleshooting

### Bot Not Sending Messages:
- Ensure bot is added to the group
- Check bot has permission to post messages
- Verify topic IDs are correct numbers

### Wrong Topic:
- Double-check topic IDs in `.env`
- Messages sent to wrong topics? Swap the IDs

### Rate Limiting:
- Default delay is 2 seconds between messages
- Increase delay in `index.js` if needed

### Connection Errors:
- Check internet connection
- Verify bot token is correct
- Ensure chat ID includes negative sign if present

## 🔒 Security Notes

- **Never commit your `.env` file** to git
- Keep your bot token secret
- Don't share chat IDs publicly
- The `.env` file is already in `.gitignore`

## 📊 Rate Limits

Telegram has the following limits:
- 30 messages per second per bot
- 20 messages per minute per group

The scraper implements:
- 2-second delay between messages (safe)
- Batch processing with error handling
- Automatic retry on failures (future enhancement)

## 🎨 Customization

You can customize the message format in `telegram-bot.js`:
- Change emojis
- Modify message structure
- Add/remove fields
- Adjust formatting

## 📝 Example .env File

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
TELEGRAM_CHAT_ID=-1001234567890
TELEGRAM_TOPIC_HOT=2
TELEGRAM_TOPIC_LATEST=3
TELEGRAM_TOPIC_UPDATED=4
```

## 🚀 Ready to Go!

Once configured, the scraper will automatically:
1. Track changes between runs
2. Send only new airdrops to hot/latest
3. Send all updates to the updated topic
4. Provide summary reports
5. Handle rate limiting gracefully

Happy airdrop hunting! 🎁
