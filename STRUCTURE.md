# Airdrops.json Structure

## Complete JSON Structure

```json
{
  "scrapedAt": "2025-11-22T12:16:40.627Z",
  "totalCount": 589,
  "sections": {
    "latest": {
      "count": 288,
      "airdrops": [/* Array of airdrop objects */]
    },
    "hottest": {
      "count": 288,
      "airdrops": [/* Array of airdrop objects */]
    },
    "updated": {
      "count": 13,
      "airdrops": [/* Array of airdrop objects */]
    }
  }
}
```

## Section Descriptions

### Latest (`sections.latest`)
Contains the newest airdrops that were recently added to airdrops.io. Fetched via API (16 pages, ~288 airdrops). These are fresh opportunities that just started.

**Source:** API endpoint with PID 529

### Hottest (`sections.hottest`)
Contains trending airdrops with high community interest and activity. Fetched via API (16 pages, ~288 airdrops). These typically have higher temperature ratings.

**Source:** API endpoint with PID 329

### Updated (`sections.updated`)
Contains airdrops that were recently updated with new information, requirements, or rewards. Scraped from homepage HTML (~13 airdrops).

**Source:** Homepage HTML scraping

## Airdrop Object Properties

Each airdrop in any section has the following structure:

```json
{
  "id": "post-1562314",              // Unique identifier
  "title": "Wendev",                 // Airdrop name
  "url": "https://airdrops.io/wendev/",  // Full URL to airdrop page
  "thumbnail": "https://...",        // Image URL
  "temperature": 28,                 // Popularity score (0-1000+)
  "published": "20251121164847",     // Publication timestamp
  "actions": "Trade to earn",        // Required actions description
  "categories": ["launchpad"],       // Tags/categories
  "isConfirmed": false,              // Whether officially confirmed
  "claimUrl": "https://...",         // Direct claim link
  "requirements": {
    "telegram": false,
    "twitter": false,
    "bitcointalk": false,
    "facebook": false,
    "email": false,
    "linkedin": false,
    "medium": false,
    "reddit": false,
    "kyc": false,
    "phone": false,
    "instagram": false,
    "youtube": false
  }
}
```

## Accessing Data

### Get all latest airdrops:
```javascript
const data = require('./airdrops.json');
const latestAirdrops = data.sections.latest.airdrops;
```

### Get all hottest airdrops:
```javascript
const hottestAirdrops = data.sections.hottest.airdrops;
```

### Get all updated airdrops:
```javascript
const updatedAirdrops = data.sections.updated.airdrops;
```

### Get all airdrops combined:
```javascript
const allAirdrops = [
  ...data.sections.latest.airdrops,
  ...data.sections.hottest.airdrops,
  ...data.sections.updated.airdrops
];
```

### Filter by criteria:
```javascript
// Get only confirmed airdrops
const confirmed = allAirdrops.filter(a => a.isConfirmed);

// Get airdrops with no KYC requirement
const noKYC = allAirdrops.filter(a => !a.requirements.kyc);

// Get high temperature airdrops (>100)
const hot = allAirdrops.filter(a => a.temperature > 100);
```
