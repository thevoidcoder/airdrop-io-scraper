# Airdrop.io Scraper

A Node.js web scraper that fetches and extracts crypto airdrop data from airdrops.io and saves it to a JSON file.

## Features

- 🌐 Fetches live data from airdrops.io using multiple methods:
  - **API endpoints** for Hot and Latest airdrops (16 pages each)
  - **HTML scraping** for Updated airdrops from homepage
- 📂 Organizes airdrops into 3 sections: Latest, Hottest, Updated
- 🚀 Fetches **~600 airdrops** (288 hot + 288 latest + 13 updated)
- 🔍 **Change Detection**: Tracks previous data and detects new/updated airdrops
- 📱 **Telegram Integration**: Automatically sends notifications to Telegram topics
  - Sends only **new** airdrops to Hot and Latest topics
  - Sends **all** airdrops (new and updated) to Updated topic
  - Includes summary reports for each category
  - Rate-limited to avoid spam (2 second delay between messages)
- 📊 Extracts comprehensive airdrop information:
  - Title and URL
  - Thumbnail image
  - Temperature rating
  - Publication date
  - Actions/estimated value
  - Categories/tags
  - Confirmation status
  - Claim URL
  - All requirements (Telegram, Twitter, KYC, etc.)
- 💾 Saves data to structured JSON format
- 📈 Provides scraping statistics
- ⚡ Parallel fetching for optimal performance

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Then edit `.env` file with your Telegram bot credentials:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=your_group_chat_id
TELEGRAM_TOPIC_HOT=hot_topic_id
TELEGRAM_TOPIC_LATEST=latest_topic_id
TELEGRAM_TOPIC_UPDATED=updated_topic_id
```

### Getting Telegram Credentials

1. **Create a bot**: Talk to [@BotFather](https://t.me/BotFather) on Telegram
   - Send `/newbot` and follow instructions
   - Copy the bot token

2. **Get Chat ID**: Add your bot to the group
   - Send a message in the group
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find the `chat.id` in the response

3. **Get Topic IDs**: 
   - Create topics in your Telegram group
   - Send a message in each topic
   - Visit the getUpdates URL again
   - Find `message_thread_id` for each topic

## Usage

### Run the Scraper
```bash
npm start
```

The scraper will:
1. **Load Previous Data** - Reads the last `airdrops.json` to track changes
2. **Fetch Hot Airdrops** - Makes API calls to fetch 16 pages of hot airdrops (~288 items)
3. **Fetch Latest Airdrops** - Makes API calls to fetch 16 pages of latest airdrops (~288 items)
4. **Scrape Updated Airdrops** - Scrapes homepage HTML for updated airdrops (~13 items)
5. **Detect Changes** - Compares new data with previous data to find:
   - New airdrops (not seen before)
   - Updated airdrops (existing but with changes)
6. **Save Results** - Saves all data to `airdrops.json`
7. **Send to Telegram** - If changes detected:
   - Sends **only new** airdrops to Hot and Latest topics
   - Sends **all** airdrops (new + updated) to Updated topic
   - Sends summary reports to each topic

The scraper uses:
- **API endpoints** for hot and latest airdrops (faster and more reliable)
- **HTML scraping** for updated airdrops (only available on homepage)
- **Parallel fetching** for hot and latest categories (faster execution)
- **Change detection** to avoid duplicate notifications
- **Rate limiting** with 500ms delays between API requests and 2s between Telegram messages

### View Summary of Scraped Data
After scraping, you can view a detailed summary:
```bash
npm run summary
```

This displays:
- Section-wise breakdown
- Total count and confirmation status
- Temperature statistics
- Top categories
- Common requirements
- Top 5 airdrops from each section

## Output Format

The generated `airdrops.json` file is organized into three sections:

```json
{
  "scrapedAt": "2025-11-22T12:16:40.627Z",
  "totalCount": 589,
  "sections": {
    "latest": {
      "count": 288,
      "airdrops": [...]
    },
    "hottest": {
      "count": 288,
      "airdrops": [...]
    },
    "updated": {
      "count": 13,
      "airdrops": [...]
    }
  }
}
```

Each airdrop object contains:
```json
{
  "id": "post-1562314",
  "title": "Airdrop Name",
  "url": "https://airdrops.io/airdrop-name/",
  "thumbnail": "https://airdrops.io/wp-content/uploads/...",
  "temperature": 28,
  "published": "20251121164847",
  "actions": "Trade to earn",
  "categories": ["launchpad"],
  "isConfirmed": false,
  "claimUrl": "https://airdrops.io/visit/...",
  "requirements": {
    "telegram": false,
    "twitter": false,
    "kyc": false,
    ...
  }
}
```

### Sections Explained

- **Latest**: Newest airdrops added to the platform (fetched via API, 16 pages)
- **Hottest**: Trending airdrops with high activity (fetched via API, 16 pages)
- **Updated**: Recently updated existing airdrops (scraped from homepage)

## Technical Details

### API Endpoints

The scraper uses the following API endpoints:

**Hot Airdrops:**
```
https://airdrops.io/wp-admin/admin-ajax.php?loadairdrops&action=loaddrops&pid=329&filter_type=platforms&paged={1-16}
```

**Latest Airdrops:**
```
https://airdrops.io/wp-admin/admin-ajax.php?loadairdrops&action=loaddrops&pid=529&filter_type=platforms&paged={1-16}
```

**Updated Airdrops:**
```
Scraped from https://airdrops.io/ homepage HTML
```

### API Response Format

The API returns JSON with HTML strings:
```json
{
  "max_num_pages": 76,
  "airdrops": [
    "<article id=\"post-130002\" ...>...</article>",
    "<article id=\"post-1481531\" ...>...</article>"
  ]
}
```

Each page returns ~18 airdrops, and the scraper fetches 16 pages per category.

## Dependencies

- **axios**: HTTP client for fetching web pages and API requests
- **cheerio**: HTML parser for data extraction
- **dotenv**: Environment variable management
- **node-telegram-bot-api**: Telegram bot integration for notifications

## License

MIT
