require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const telegramBot = require('./telegram-bot');
const changeDetector = require('./change-detector');

const BASE_URL = 'https://airdrops.io';
const API_BASE_URL = 'https://airdrops.io/wp-admin/admin-ajax.php';
const HOT_PID = '329';
const LATEST_PID = '529';
const PAGES_TO_FETCH = 16;

/**
 * Fetch HTML content from airdrops.io homepage (for updated airdrops)
 */
async function fetchHomepageHTML() {
  try {
    console.log('Fetching homepage for updated airdrops...');
    const response = await axios.get(BASE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'dnt': '1'
      }
    });
    console.log('✓ Successfully fetched homepage');
    return response.data;
  } catch (error) {
    console.error('Error fetching homepage HTML:', error.message);
    throw error;
  }
}

/**
 * Fetch airdrops from API endpoint
 */
async function fetchAirdropsFromAPI(pid, page) {
  try {
    const url = `${API_BASE_URL}?loadairdrops&action=loaddrops&pid=${pid}&filter_type=platforms&paged=${page}`;
    const response = await axios.get(url, {
      headers: {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-GB,en;q=0.9',
        'dnt': '1',
        'referer': `${BASE_URL}/${pid === HOT_PID ? 'hot' : 'latest'}/`,
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching API page ${page} for PID ${pid}:`, error.message);
    return null;
  }
}

/**
 * Parse HTML string containing article elements from API response
 */
function parseArticleHTML(htmlString, index) {
  const $ = cheerio.load(htmlString);
  const $article = $('article').first();
  
  if ($article.length === 0) {
    return null;
  }
  
  return parseAirdropElement($, $article, index);
}

/**
 * Parse a single airdrop article element
 */
function parseAirdropElement($, element, index) {
  const $article = $(element);
  
  // Extract data attributes
  const temperature = $article.attr('data-temperature') || '0';
  const published = $article.attr('data-published') || '';
  
  // Extract requirements from data attributes
  const requirements = {
    telegram: $article.attr('data-telegram-required') === '1',
    twitter: $article.attr('data-twitter-required') === '1',
    bitcointalk: $article.attr('data-bitcointalk-required') === '1',
    facebook: $article.attr('data-facebook-required') === '1',
    email: $article.attr('data-email-address-required') === '1',
    linkedin: $article.attr('data-linkedin-required') === '1',
    medium: $article.attr('data-medium-required') === '1',
    reddit: $article.attr('data-reddit-required') === '1',
    kyc: $article.attr('data-kyc-required') === '1',
    phone: $article.attr('data-phone-required') === '1',
    instagram: $article.attr('data-instagram-required') === '1',
    youtube: $article.attr('data-youtube-required') === '1'
  };

  // Extract airdrop title and URL
  const titleElement = $article.find('.air-content-front a');
  const title = $article.find('.air-content-front a h3').text().trim();
  const url = titleElement.attr('href') || '';
  
  // Extract thumbnail image
  const thumbnail = $article.find('.air-thumbnail img').attr('data-src') || 
                   $article.find('.air-thumbnail img').attr('src') || '';

  // Extract estimated value/actions
  const actions = $article.find('.est-value span').text().trim();
  
  // Extract categories/tags
  const categories = [];
  $article.attr('class').split(' ').forEach(cls => {
    if (cls.startsWith('categories-')) {
      categories.push(cls.replace('categories-', ''));
    }
  });

  // Check if confirmed
  const isConfirmed = $article.hasClass('confirmed');
  
  // Extract claim button URL
  const claimButton = $article.find('.air-buttons a');
  const claimUrl = claimButton.attr('href') || '';

  // Build airdrop object
  return {
    id: $article.attr('id') || `airdrop-${index}`,
    title,
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    thumbnail,
    temperature: parseInt(temperature) || 0,
    published,
    actions,
    categories,
    isConfirmed,
    claimUrl: claimUrl.startsWith('http') ? claimUrl : `${BASE_URL}${claimUrl}`,
    requirements
  };
}

/**
 * Fetch all hot airdrops from API (16 pages)
 */
async function fetchHotAirdrops() {
  console.log(`\nFetching hot airdrops (${PAGES_TO_FETCH} pages)...`);
  const hotAirdrops = [];
  
  for (let page = 1; page <= PAGES_TO_FETCH; page++) {
    process.stdout.write(`  Page ${page}/${PAGES_TO_FETCH}...`);
    const data = await fetchAirdropsFromAPI(HOT_PID, page);
    
    if (data && data.airdrops && Array.isArray(data.airdrops)) {
      let pageCount = 0;
      data.airdrops.forEach((htmlString, index) => {
        const airdrop = parseArticleHTML(htmlString, hotAirdrops.length + index);
        if (airdrop && airdrop.title) {
          hotAirdrops.push(airdrop);
          pageCount++;
        }
      });
      console.log(` ✓ (${pageCount} airdrops)`);
    } else {
      console.log(' ✗ (no data)');
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`✓ Total hot airdrops fetched: ${hotAirdrops.length}`);
  return hotAirdrops;
}

/**
 * Fetch all latest airdrops from API (16 pages)
 */
async function fetchLatestAirdrops() {
  console.log(`\nFetching latest airdrops (${PAGES_TO_FETCH} pages)...`);
  const latestAirdrops = [];
  
  for (let page = 1; page <= PAGES_TO_FETCH; page++) {
    process.stdout.write(`  Page ${page}/${PAGES_TO_FETCH}...`);
    const data = await fetchAirdropsFromAPI(LATEST_PID, page);
    
    if (data && data.airdrops && Array.isArray(data.airdrops)) {
      let pageCount = 0;
      data.airdrops.forEach((htmlString, index) => {
        const airdrop = parseArticleHTML(htmlString, latestAirdrops.length + index);
        if (airdrop && airdrop.title) {
          latestAirdrops.push(airdrop);
          pageCount++;
        }
      });
      console.log(` ✓ (${pageCount} airdrops)`);
    } else {
      console.log(' ✗ (no data)');
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`✓ Total latest airdrops fetched: ${latestAirdrops.length}`);
  return latestAirdrops;
}

/**
 * Parse updated airdrops from homepage HTML
 */
function parseUpdatedAirdrops(html) {
  console.log('\nParsing updated airdrops from homepage...');
  const $ = cheerio.load(html);
  const updatedAirdrops = [];
  
  $('[class*="homepage-widget"][class*="updated"]').find('article.project').each((index, element) => {
    const airdrop = parseAirdropElement($, element, index);
    if (airdrop && airdrop.title) {
      updatedAirdrops.push(airdrop);
    }
  });
  
  console.log(`✓ Updated airdrops found: ${updatedAirdrops.length}`);
  return updatedAirdrops;
}

/**
 * Save airdrops to JSON file
 */
async function saveToJSON(sections, filename = 'airdrops.json') {
  try {
    const totalCount = sections.latest.length + sections.hottest.length + sections.updated.length;
    
    const data = {
      scrapedAt: new Date().toISOString(),
      totalCount,
      sections: {
        latest: {
          count: sections.latest.length,
          airdrops: sections.latest
        },
        hottest: {
          count: sections.hottest.length,
          airdrops: sections.hottest
        },
        updated: {
          count: sections.updated.length,
          airdrops: sections.updated
        }
      }
    };
    
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`Successfully saved ${totalCount} airdrops to ${filename}`);
  } catch (error) {
    console.error('Error saving to JSON:', error.message);
    throw error;
  }
}

/**
 * Send changes to Telegram
 */
async function sendToTelegram(changes) {
  console.log('\n📱 SENDING TO TELEGRAM');
  console.log('=' .repeat(50));
  
  try {
    // Validate configuration
    telegramBot.validateConfig();
    
    // Test connection
    const connected = await telegramBot.testConnection();
    if (!connected) {
      throw new Error('Failed to connect to Telegram bot');
    }
    
    // Send hot airdrops (only new ones)
    if (changes.hot.new.length > 0) {
      console.log(`\n🔥 Sending ${changes.hot.new.length} new hot airdrops...`);
      const result = await telegramBot.sendAirdropsBatch(
        changes.hot.new,
        telegramBot.TOPICS.hot,
        true,
        2000 // 2 second delay
      );
      console.log(`   ✓ Sent: ${result.sent}, Failed: ${result.failed}`);
    }
    
    // Send latest airdrops (only new ones)
    if (changes.latest.new.length > 0) {
      console.log(`\n⚡ Sending ${changes.latest.new.length} new latest airdrops...`);
      const result = await telegramBot.sendAirdropsBatch(
        changes.latest.new,
        telegramBot.TOPICS.latest,
        true,
        2000 // 2 second delay
      );
      console.log(`   ✓ Sent: ${result.sent}, Failed: ${result.failed}`);
    }
    
    // Send updated airdrops (all - both new and updated)
    const allUpdated = [...changes.updated.new, ...changes.updated.updated];
    if (allUpdated.length > 0) {
      console.log(`\n🔄 Sending ${allUpdated.length} updated airdrops...`);
      const result = await telegramBot.sendAirdropsBatch(
        allUpdated,
        telegramBot.TOPICS.updated,
        false,
        2000 // 2 second delay
      );
      console.log(`   ✓ Sent: ${result.sent}, Failed: ${result.failed}`);
    }
    
    // Send summaries
    await telegramBot.sendSummary('Hot', changes.hot.new.length, changes.hot.updated.length, telegramBot.TOPICS.hot);
    await telegramBot.sendSummary('Latest', changes.latest.new.length, changes.latest.updated.length, telegramBot.TOPICS.latest);
    await telegramBot.sendSummary('Updated', changes.updated.new.length, changes.updated.updated.length, telegramBot.TOPICS.updated);
    
    console.log('\n✅ Telegram notifications sent successfully!');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('\n❌ Failed to send Telegram notifications:', error.message);
    console.log('=' .repeat(50));
    throw error;
  }
}

/**
 * Main scraper function
 */
async function scrapeAirdrops() {
  try {
    console.log('🚀 Starting airdrop scraper...\n');
    console.log('=' .repeat(50));
    
    // Load previous data
    console.log('\n📂 Loading previous data...');
    const previousData = await changeDetector.loadPreviousData();
    
    // Fetch all three categories
    const [hotAirdrops, latestAirdrops] = await Promise.all([
      fetchHotAirdrops(),
      fetchLatestAirdrops()
    ]);
    
    // Fetch homepage for updated airdrops
    const homepageHTML = await fetchHomepageHTML();
    const updatedAirdrops = parseUpdatedAirdrops(homepageHTML);
    
    // Organize into sections
    const sections = {
      latest: latestAirdrops,
      hottest: hotAirdrops,
      updated: updatedAirdrops
    };
    
    // Create new data structure
    const newData = {
      scrapedAt: new Date().toISOString(),
      totalCount: sections.latest.length + sections.hottest.length + sections.updated.length,
      sections: {
        latest: {
          count: sections.latest.length,
          airdrops: sections.latest
        },
        hottest: {
          count: sections.hottest.length,
          airdrops: sections.hottest
        },
        updated: {
          count: sections.updated.length,
          airdrops: sections.updated
        }
      }
    };
    
    // Detect changes
    console.log('\n🔍 Detecting changes...');
    const changes = changeDetector.detectChanges(previousData, newData);
    const report = changeDetector.generateReport(changes);
    changeDetector.printReport(report);
    
    // Save to JSON
    console.log('=' .repeat(50));
    await saveToJSON(sections);
    
    // Display summary
    const allAirdrops = [...sections.latest, ...sections.hottest, ...sections.updated];
    const totalCount = allAirdrops.length;
    const confirmed = allAirdrops.filter(a => a.isConfirmed).length;
    const avgTemp = totalCount > 0 
      ? (allAirdrops.reduce((sum, a) => sum + a.temperature, 0) / totalCount).toFixed(1)
      : 0;
    
    console.log('\n📊 SUMMARY STATISTICS');
    console.log('=' .repeat(50));
    console.log(`📈 Total airdrops scraped: ${totalCount}`);
    console.log(`\n   Category Breakdown:`);
    console.log(`   ├─ 🔥 Hot airdrops:     ${sections.hottest.length}`);
    console.log(`   ├─ ⚡ Latest airdrops:  ${sections.latest.length}`);
    console.log(`   └─ 🔄 Updated airdrops: ${sections.updated.length}`);
    console.log(`\n   Other Stats:`);
    console.log(`   ├─ ✓ Confirmed:         ${confirmed}`);
    console.log(`   └─ 🌡️  Avg temperature:  ${avgTemp}°`);
    console.log('=' .repeat(50));
    console.log('\n✅ Scraping completed successfully!');
    
    // Send to Telegram if there are any changes
    if (report.grandTotal > 0) {
      if (changes.isFirstRun) {
        console.log('\n📢 First run - sending all airdrops to Telegram...');
      } else {
        console.log('\n📢 Changes detected! Sending to Telegram...');
      }
      await sendToTelegram(changes);
    } else {
      console.log('\n✅ No changes detected. Skipping Telegram notifications.');
    }
    
    console.log('\n✅ All done!\n');
    
  } catch (error) {
    console.error('\n❌ Scraping failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the scraper
if (require.main === module) {
  scrapeAirdrops();
}

module.exports = { scrapeAirdrops, fetchHomepageHTML, fetchHotAirdrops, fetchLatestAirdrops, parseUpdatedAirdrops, saveToJSON };
