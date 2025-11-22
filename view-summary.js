const fs = require('fs').promises;

async function viewSummary() {
  try {
    const data = JSON.parse(await fs.readFile('airdrops.json', 'utf-8'));
    
    console.log('\n📊 Airdrop Scraping Summary\n');
    console.log('='.repeat(50));
    console.log(`Scraped at: ${new Date(data.scrapedAt).toLocaleString()}`);
    console.log(`Total airdrops: ${data.totalCount}`);
    console.log('='.repeat(50));
    
    console.log(`\n📑 Sections:`);
    console.log(`   Latest: ${data.sections.latest.count}`);
    console.log(`   Hottest: ${data.sections.hottest.count}`);
    console.log(`   Updated: ${data.sections.updated.count}`);
    
    // Combine all airdrops for overall statistics
    const allAirdrops = [
      ...data.sections.latest.airdrops,
      ...data.sections.hottest.airdrops,
      ...data.sections.updated.airdrops
    ];
    
    // Count by confirmation status
    const confirmed = allAirdrops.filter(a => a.isConfirmed).length;
    console.log(`\n✅ Confirmed: ${confirmed}`);
    console.log(`⏳ Unconfirmed: ${data.totalCount - confirmed}`);
    
    // Temperature stats
    const temps = allAirdrops.map(a => a.temperature);
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    
    console.log(`\n🌡️  Temperature Stats:`);
    console.log(`   Average: ${avgTemp}°`);
    console.log(`   Highest: ${maxTemp}°`);
    console.log(`   Lowest: ${minTemp}°`);
    
    // Categories count
    const categoriesCount = {};
    allAirdrops.forEach(a => {
      a.categories.forEach(cat => {
        categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
      });
    });
    
    console.log(`\n📑 Top Categories:`);
    Object.entries(categoriesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([cat, count]) => {
        console.log(`   ${cat}: ${count}`);
      });
    
    // Requirements stats
    const reqStats = {
      telegram: 0,
      twitter: 0,
      kyc: 0,
      email: 0
    };
    
    allAirdrops.forEach(a => {
      if (a.requirements.telegram) reqStats.telegram++;
      if (a.requirements.twitter) reqStats.twitter++;
      if (a.requirements.kyc) reqStats.kyc++;
      if (a.requirements.email) reqStats.email++;
    });
    
    console.log(`\n📋 Common Requirements:`);
    console.log(`   Telegram: ${reqStats.telegram}`);
    console.log(`   Twitter: ${reqStats.twitter}`);
    console.log(`   KYC: ${reqStats.kyc}`);
    console.log(`   Email: ${reqStats.email}`);
    
    // Show top 5 from each section
    console.log(`\n🔥 Top 5 from Latest Airdrops:\n`);
    data.sections.latest.airdrops
      .sort((a, b) => b.temperature - a.temperature)
      .slice(0, 5)
      .forEach((a, i) => {
        console.log(`${i + 1}. ${a.title} (${a.temperature}°)`);
        console.log(`   ${a.url}`);
      });
    
    console.log(`\n🔥 Top 5 from Hottest Airdrops:\n`);
    data.sections.hottest.airdrops
      .sort((a, b) => b.temperature - a.temperature)
      .slice(0, 5)
      .forEach((a, i) => {
        console.log(`${i + 1}. ${a.title} (${a.temperature}°)`);
        console.log(`   ${a.url}`);
      });
    
    console.log(`\n🔥 Top 5 from Updated Airdrops:\n`);
    data.sections.updated.airdrops
      .sort((a, b) => b.temperature - a.temperature)
      .slice(0, 5)
      .forEach((a, i) => {
        console.log(`${i + 1}. ${a.title} (${a.temperature}°)`);
        console.log(`   ${a.url}`);
      });
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ airdrops.json not found. Please run the scraper first.');
    } else {
      console.error('Error:', error.message);
    }
  }
}

viewSummary();
