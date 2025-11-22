require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Initialize bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Topic IDs from environment
const TOPICS = {
  hot: process.env.TELEGRAM_TOPIC_HOT,
  latest: process.env.TELEGRAM_TOPIC_LATEST,
  updated: process.env.TELEGRAM_TOPIC_UPDATED
};

const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Format an airdrop for Telegram message
 */
function formatAirdrop(airdrop, isNew = true) {
  const emoji = airdrop.isConfirmed ? '✅' : '🔔';
  const status = isNew ? '🆕 NEW' : '🔄 UPDATED';
  const tempEmoji = airdrop.temperature > 100 ? '🔥' : airdrop.temperature > 50 ? '🌡️' : '❄️';
  
  let message = `${emoji} ${status} AIRDROP\n\n`;
  message += `📌 **${airdrop.title}**\n`;
  message += `${tempEmoji} Temperature: ${airdrop.temperature}°\n`;
  
  if (airdrop.actions) {
    message += `⚡ Actions: ${airdrop.actions}\n`;
  }
  
  if (airdrop.categories && airdrop.categories.length > 0) {
    message += `🏷️ Categories: ${airdrop.categories.map(c => `#${c}`).join(' ')}\n`;
  }
  
  // Requirements
  const requirements = [];
  if (airdrop.requirements.twitter) requirements.push('Twitter');
  if (airdrop.requirements.telegram) requirements.push('Telegram');
  if (airdrop.requirements.email) requirements.push('Email');
  if (airdrop.requirements.kyc) requirements.push('⚠️ KYC');
  
  if (requirements.length > 0) {
    message += `📋 Requirements: ${requirements.join(', ')}\n`;
  }
  
  message += `\n🔗 [View Details](${airdrop.url})`;
  
  if (airdrop.claimUrl && airdrop.claimUrl !== airdrop.url) {
    message += `\n🎁 [Claim Airdrop](${airdrop.claimUrl})`;
  }
  
  return message;
}

/**
 * Send a single airdrop to Telegram topic
 */
async function sendAirdrop(airdrop, topic, isNew = true) {
  try {
    const message = formatAirdrop(airdrop, isNew);
    
    const options = {
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
      message_thread_id: parseInt(topic)
    };
    
    await bot.sendMessage(CHAT_ID, message, options);
    return true;
  } catch (error) {
    console.error(`Error sending airdrop ${airdrop.title}:`, error.message);
    return false;
  }
}

/**
 * Send multiple airdrops with delay to avoid rate limiting
 */
async function sendAirdropsBatch(airdrops, topic, isNew = true, delay = 1000) {
  let sent = 0;
  let failed = 0;
  
  for (const airdrop of airdrops) {
    const success = await sendAirdrop(airdrop, topic, isNew);
    
    if (success) {
      sent++;
    } else {
      failed++;
    }
    
    // Delay between messages to avoid rate limiting
    if (airdrops.indexOf(airdrop) < airdrops.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { sent, failed };
}

/**
 * Send summary message to a topic
 */
async function sendSummary(category, newCount, updatedCount, topicId) {
  try {
    let message = `📊 **${category.toUpperCase()} AIRDROPS UPDATE**\n\n`;
    
    if (newCount > 0) {
      message += `🆕 New airdrops: ${newCount}\n`;
    }
    
    if (updatedCount > 0) {
      message += `🔄 Updated airdrops: ${updatedCount}\n`;
    }
    
    if (newCount === 0 && updatedCount === 0) {
      message += `✅ No new updates\n`;
    }
    
    message += `\n⏰ Checked at: ${new Date().toLocaleString()}`;
    
    const options = {
      parse_mode: 'Markdown',
      message_thread_id: parseInt(topicId)
    };
    
    await bot.sendMessage(CHAT_ID, message, options);
    return true;
  } catch (error) {
    console.error(`Error sending summary for ${category}:`, error.message);
    return false;
  }
}

/**
 * Validate environment variables
 */
function validateConfig() {
  const required = [
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID',
    'TELEGRAM_TOPIC_HOT',
    'TELEGRAM_TOPIC_LATEST',
    'TELEGRAM_TOPIC_UPDATED'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return true;
}

/**
 * Test bot connection
 */
async function testConnection() {
  try {
    const me = await bot.getMe();
    console.log(`✓ Bot connected: @${me.username}`);
    return true;
  } catch (error) {
    console.error('✗ Bot connection failed:', error.message);
    return false;
  }
}

module.exports = {
  sendAirdrop,
  sendAirdropsBatch,
  sendSummary,
  validateConfig,
  testConnection,
  TOPICS,
  CHAT_ID
};
