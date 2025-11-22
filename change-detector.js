const fs = require('fs').promises;

/**
 * Load previous airdrops from JSON file
 */
async function loadPreviousData(filename = 'airdrops.json') {
  try {
    const data = await fs.readFile(filename, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No previous data found. This is the first run.');
      return null;
    }
    throw error;
  }
}

/**
 * Create a map of airdrops by ID for quick lookup
 */
function createAirdropMap(airdrops) {
  const map = new Map();
  airdrops.forEach(airdrop => {
    map.set(airdrop.id, airdrop);
  });
  return map;
}

/**
 * Compare two airdrops to detect changes
 */
function hasChanged(oldAirdrop, newAirdrop) {
  // Check key fields that indicate an update
  const fieldsToCheck = [
    'temperature',
    'actions',
    'isConfirmed',
    'claimUrl'
  ];
  
  for (const field of fieldsToCheck) {
    if (oldAirdrop[field] !== newAirdrop[field]) {
      return true;
    }
  }
  
  // Check if requirements changed
  const oldReqs = JSON.stringify(oldAirdrop.requirements);
  const newReqs = JSON.stringify(newAirdrop.requirements);
  if (oldReqs !== newReqs) {
    return true;
  }
  
  // Check if categories changed
  const oldCats = JSON.stringify(oldAirdrop.categories.sort());
  const newCats = JSON.stringify(newAirdrop.categories.sort());
  if (oldCats !== newCats) {
    return true;
  }
  
  return false;
}

/**
 * Detect changes between old and new data
 */
function detectChanges(oldData, newData) {
  const changes = {
    hot: { new: [], updated: [] },
    latest: { new: [], updated: [] },
    updated: { new: [], updated: [] }
  };
  
  // If no old data, everything is new
  if (!oldData) {
    changes.hot.new = newData.sections.hottest.airdrops;
    changes.latest.new = newData.sections.latest.airdrops;
    changes.updated.new = newData.sections.updated.airdrops;
    return changes;
  }
  
  // Create maps for quick lookup
  const oldHotMap = createAirdropMap(oldData.sections.hottest.airdrops);
  const oldLatestMap = createAirdropMap(oldData.sections.latest.airdrops);
  const oldUpdatedMap = createAirdropMap(oldData.sections.updated.airdrops);
  
  // Check hot airdrops
  for (const airdrop of newData.sections.hottest.airdrops) {
    const oldAirdrop = oldHotMap.get(airdrop.id);
    
    if (!oldAirdrop) {
      // New airdrop
      changes.hot.new.push(airdrop);
    } else if (hasChanged(oldAirdrop, airdrop)) {
      // Updated airdrop
      changes.hot.updated.push(airdrop);
    }
  }
  
  // Check latest airdrops
  for (const airdrop of newData.sections.latest.airdrops) {
    const oldAirdrop = oldLatestMap.get(airdrop.id);
    
    if (!oldAirdrop) {
      // New airdrop
      changes.latest.new.push(airdrop);
    } else if (hasChanged(oldAirdrop, airdrop)) {
      // Updated airdrop
      changes.latest.updated.push(airdrop);
    }
  }
  
  // For updated section, always send all (they are recent updates by nature)
  // But still track which are truly new vs which existed before
  for (const airdrop of newData.sections.updated.airdrops) {
    const oldAirdrop = oldUpdatedMap.get(airdrop.id);
    
    if (!oldAirdrop) {
      changes.updated.new.push(airdrop);
    } else {
      // Even if not changed, we want to send updates
      changes.updated.updated.push(airdrop);
    }
  }
  
  return changes;
}

/**
 * Generate change summary report
 */
function generateReport(changes) {
  const report = {
    hot: {
      new: changes.hot.new.length,
      updated: changes.hot.updated.length,
      total: changes.hot.new.length + changes.hot.updated.length
    },
    latest: {
      new: changes.latest.new.length,
      updated: changes.latest.updated.length,
      total: changes.latest.new.length + changes.latest.updated.length
    },
    updated: {
      new: changes.updated.new.length,
      updated: changes.updated.updated.length,
      total: changes.updated.new.length + changes.updated.updated.length
    }
  };
  
  report.totalNew = report.hot.new + report.latest.new + report.updated.new;
  report.totalUpdated = report.hot.updated + report.latest.updated + report.updated.updated;
  report.grandTotal = report.totalNew + report.totalUpdated;
  
  return report;
}

/**
 * Print change report to console
 */
function printReport(report) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 CHANGE DETECTION REPORT');
  console.log('='.repeat(50));
  
  console.log('\n🔥 HOT AIRDROPS:');
  console.log(`   🆕 New: ${report.hot.new}`);
  console.log(`   🔄 Updated: ${report.hot.updated}`);
  console.log(`   📊 Total changes: ${report.hot.total}`);
  
  console.log('\n⚡ LATEST AIRDROPS:');
  console.log(`   🆕 New: ${report.latest.new}`);
  console.log(`   🔄 Updated: ${report.latest.updated}`);
  console.log(`   📊 Total changes: ${report.latest.total}`);
  
  console.log('\n🔄 UPDATED AIRDROPS:');
  console.log(`   🆕 New: ${report.updated.new}`);
  console.log(`   🔄 Updated: ${report.updated.updated}`);
  console.log(`   📊 Total changes: ${report.updated.total}`);
  
  console.log('\n📈 OVERALL:');
  console.log(`   🆕 Total new: ${report.totalNew}`);
  console.log(`   🔄 Total updated: ${report.totalUpdated}`);
  console.log(`   📊 Grand total: ${report.grandTotal}`);
  console.log('='.repeat(50) + '\n');
}

module.exports = {
  loadPreviousData,
  detectChanges,
  generateReport,
  printReport,
  hasChanged
};
