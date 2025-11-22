#!/usr/bin/env node

/**
 * Test script to verify first run behavior
 * This demonstrates that all airdrops are sent when no previous data exists
 */

const changeDetector = require('./change-detector');

// Simulate scraped data with all required fields
const mockNewData = {
  scrapedAt: new Date().toISOString(),
  totalCount: 6,
  sections: {
    hottest: {
      count: 2,
      airdrops: [
        { 
          id: 'hot1', 
          title: 'Hot Airdrop 1', 
          temperature: 95, 
          actions: 3,
          categories: ['DeFi', 'NFT'],
          isConfirmed: true,
          claimUrl: 'https://example.com/hot1',
          requirements: { twitter: true, discord: false }
        },
        { 
          id: 'hot2', 
          title: 'Hot Airdrop 2', 
          temperature: 90,
          actions: 2,
          categories: ['Gaming'],
          isConfirmed: false,
          claimUrl: null,
          requirements: { twitter: false, discord: true }
        }
      ]
    },
    latest: {
      count: 2,
      airdrops: [
        { 
          id: 'latest1', 
          title: 'Latest Airdrop 1', 
          temperature: 85,
          actions: 4,
          categories: ['Layer2'],
          isConfirmed: true,
          claimUrl: 'https://example.com/latest1',
          requirements: { twitter: true, discord: true }
        },
        { 
          id: 'latest2', 
          title: 'Latest Airdrop 2', 
          temperature: 80,
          actions: 1,
          categories: ['DeFi'],
          isConfirmed: false,
          claimUrl: null,
          requirements: { twitter: false, discord: false }
        }
      ]
    },
    updated: {
      count: 2,
      airdrops: [
        { 
          id: 'updated1', 
          title: 'Updated Airdrop 1', 
          temperature: 75,
          actions: 5,
          categories: ['Metaverse'],
          isConfirmed: true,
          claimUrl: 'https://example.com/updated1',
          requirements: { twitter: true, discord: true }
        },
        { 
          id: 'updated2', 
          title: 'Updated Airdrop 2', 
          temperature: 70,
          actions: 2,
          categories: ['NFT', 'Gaming'],
          isConfirmed: false,
          claimUrl: null,
          requirements: { twitter: false, discord: true }
        }
      ]
    }
  }
};

console.log('🧪 TESTING FIRST RUN BEHAVIOR');
console.log('=' .repeat(60));

// Test 1: First run (no previous data)
console.log('\n📝 Test 1: First Run (previousData = null)');
console.log('-'.repeat(60));
const changesFirstRun = changeDetector.detectChanges(null, mockNewData);
const reportFirstRun = changeDetector.generateReport(changesFirstRun);

console.log('\n✅ Results:');
console.log(`   isFirstRun: ${changesFirstRun.isFirstRun}`);
console.log(`   Hot new: ${changesFirstRun.hot.new.length}`);
console.log(`   Latest new: ${changesFirstRun.latest.new.length}`);
console.log(`   Updated new: ${changesFirstRun.updated.new.length}`);
console.log(`   Total changes: ${reportFirstRun.grandTotal}`);

if (changesFirstRun.isFirstRun && 
    changesFirstRun.hot.new.length === 2 && 
    changesFirstRun.latest.new.length === 2 && 
    changesFirstRun.updated.new.length === 2 &&
    reportFirstRun.grandTotal === 6) {
  console.log('\n✅ PASS: All airdrops marked as new on first run');
} else {
  console.log('\n❌ FAIL: First run behavior incorrect');
}

// Test 2: Subsequent run (with previous data, no changes)
console.log('\n\n📝 Test 2: Subsequent Run (no changes)');
console.log('-'.repeat(60));
const changesNoChange = changeDetector.detectChanges(mockNewData, mockNewData);
const reportNoChange = changeDetector.generateReport(changesNoChange);

console.log('\n✅ Results:');
console.log(`   isFirstRun: ${changesNoChange.isFirstRun || false}`);
console.log(`   Hot new: ${changesNoChange.hot.new.length}`);
console.log(`   Latest new: ${changesNoChange.latest.new.length}`);
console.log(`   Updated updated: ${changesNoChange.updated.updated.length}`);
console.log(`   Total changes: ${reportNoChange.grandTotal}`);

// Note: Updated section always sends existing items (they are "updates" by nature)
if (!changesNoChange.isFirstRun && 
    changesNoChange.hot.new.length === 0 && 
    changesNoChange.latest.new.length === 0 &&
    changesNoChange.updated.updated.length === 2) {
  console.log('\n✅ PASS: No new airdrops, but updated section sends existing items (as designed)');
} else {
  console.log('\n❌ FAIL: Expected no new hot/latest, but updated section should send 2');
}

// Test 3: Subsequent run (with new airdrop)
console.log('\n\n📝 Test 3: Subsequent Run (with new airdrop)');
console.log('-'.repeat(60));
const mockNewDataWithAddition = JSON.parse(JSON.stringify(mockNewData));
mockNewDataWithAddition.sections.hottest.airdrops.push({
  id: 'hot3',
  title: 'Hot Airdrop 3',
  temperature: 88,
  actions: 3,
  categories: ['DeFi'],
  isConfirmed: true,
  claimUrl: 'https://example.com/hot3',
  requirements: { twitter: true, discord: false }
});

const changesWithNew = changeDetector.detectChanges(mockNewData, mockNewDataWithAddition);
const reportWithNew = changeDetector.generateReport(changesWithNew);

console.log('\n✅ Results:');
console.log(`   isFirstRun: ${changesWithNew.isFirstRun || false}`);
console.log(`   Hot new: ${changesWithNew.hot.new.length}`);
console.log(`   Latest new: ${changesWithNew.latest.new.length}`);
console.log(`   Updated updated: ${changesWithNew.updated.updated.length}`);
console.log(`   Total changes: ${reportWithNew.grandTotal}`);

// Note: Total is 3 (1 new hot + 2 updated items that existed before)
if (!changesWithNew.isFirstRun && 
    changesWithNew.hot.new.length === 1 &&
    changesWithNew.updated.updated.length === 2 &&
    reportWithNew.grandTotal === 3) {
  console.log('\n✅ PASS: 1 new hot airdrop + 2 updated items = 3 total changes');
} else {
  console.log('\n❌ FAIL: Expected 1 new hot + 2 updated = 3 total');
}

console.log('\n' + '='.repeat(60));
console.log('🎉 ALL TESTS COMPLETED\n');
