# Natural8 Rush & Cash Leaderboard Scraping Instructions

## Overview

This document describes how to scrape the Natural8 Rush & Cash Daily Leaderboard data using Playwright browser automation.

**Target URL**: `https://www.natural8.com/en/promotions/rush-and-cash-daily-leaderboard`

**Data Location**: Leaderboard data is loaded in iframes from `pml.good-game-service.com`

## Prerequisites

- Playwright server running at `http://localhost:9876`
- Stealth mode required (Cloudflare protection)

## Step-by-Step Process

### 1. Initialize Stealth Mode

```javascript
// Add stealth scripts to avoid bot detection
await page.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => false });
  Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
  Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
  Object.defineProperty(navigator, "platform", { get: () => "MacIntel" });
  window.chrome = { runtime: {} };
});
```

### 2. Navigate to Page

```javascript
await page.goto("https://www.natural8.com/en/promotions/rush-and-cash-daily-leaderboard", {
  waitUntil: "domcontentloaded",
  timeout: 60000
});
await page.waitForTimeout(8000);
```

### 3. Remove Popup Modal

```javascript
await page.keyboard.press("Escape");
await page.evaluate(() => {
  document.querySelectorAll("dialog, [id*=popup], [id*=modal]").forEach(el => el.remove());
});
```

### 4. Scroll to Leaderboard Section

```javascript
// Scroll down slowly like a real user
for (let i = 0; i < 8; i++) {
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(800);
}
```

### 5. Select Stake Level (in iframe)

The leaderboard iframe IDs:
- **1266** = January Hold'em
- **1267** = January Omaha
- **1247** = December Hold'em
- **1248** = December Omaha

```javascript
const frame = page.frameLocator('iframe[src*="groupId=1266"]'); // January Hold'em

// Click stake dropdown
await frame.locator(".blind-text, [class*=dropdown]").first().click();
await page.waitForTimeout(1500);

// Select stake level
await frame.locator("text=$0.10/$0.25").click(); // NL25
await page.waitForTimeout(2000);
```

**Available Stakes (Hold'em)**:
| Stake | Blinds |
|-------|--------|
| NL200 | $1/$2 |
| NL100 | $0.50/$1 |
| NL50 | $0.25/$0.50 |
| NL25 | $0.10/$0.25 |
| NL10 | $0.05/$0.10 |
| NL5 | $0.02/$0.05 |
| NL2 | $0.01/$0.02 |

### 6. Select Date

```javascript
// Click calendar
await frame.locator(".calender-container, [class*=calender]").first().click();
await page.waitForTimeout(1500);

// Click specific day (e.g., 19)
await frame.locator("text=19").first().click();
await page.waitForTimeout(2000);
```

**Note**: Calendar shows current month. To access previous months (November, December), you may need to click navigation arrows in the calendar.

### 7. Extract Data

```javascript
const frame = page.frameLocator('iframe[src*="groupId=1266"]');
const rows = await frame.locator("table tr, [class*=row]").all();
let data = [];

for (const row of rows) {
  const text = await row.innerText().catch(() => "");
  if (text.trim()) data.push(text.trim());
}

return data.join("\n");
```

### 8. Parse and Save to CSV

Data format from extraction:
```
Rank\tNickname\tFlag\tPoints\tPrize
1\tPlayerName\t\t40142.00\tC$150.00
```

**CSV Naming Convention**: `holdem-{stake}-{yyyy-mm-dd}.csv`

Examples:
- `holdem-nl10-2026-01-19.csv`
- `holdem-nl25-2026-01-19.csv`
- `holdem-nl50-2026-01-19.csv`

## Batch Scraping Plan

### Phase 1: January 2026
Dates: January 1-20, 2026 (or current date)

| Stake | File Pattern |
|-------|--------------|
| NL10 | `holdem-nl10-2026-01-{DD}.csv` |
| NL25 | `holdem-nl25-2026-01-{DD}.csv` |
| NL50 | `holdem-nl50-2026-01-{DD}.csv` |

### Phase 2: November 2025 - January 2026

**November 2025**: Days 1-30
**December 2025**: Days 1-31
**January 2026**: Days 1-20+

To access previous months, click the left arrow in the calendar picker to navigate back.

## Prize Structure Reference

**NL50 ($0.25/$0.50)**: C$5,500 for Top 240
**NL25 ($0.10/$0.25)**: C$3,500 for Top 300
**NL10 ($0.05/$0.10)**: C$2,000 for Top 300

## Troubleshooting

### Cloudflare Blocking
- Always use stealth mode initialization
- Add realistic delays between actions (800-2000ms)
- Scroll like a human user (incremental, not instant)

### Empty Iframe Content
- Wait longer after page load (8-10 seconds)
- Ensure popup is dismissed before scrolling
- Check that iframe has fully loaded before interacting

### Calendar Navigation for Past Months
```javascript
// Click left arrow to go to previous month
await frame.locator("[class*=prev], [class*=arrow-left]").click();
await page.waitForTimeout(1000);
```

## Example: Full Extraction Script

```bash
curl -s -X POST http://localhost:9876/exec -d '
// Stealth init, navigate, remove popup, scroll...
const frame = page.frameLocator("iframe[src*=\"groupId=1266\"]");

// Select NL25
await frame.locator(".blind-text").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=$0.10/$0.25").click();
await page.waitForTimeout(2000);

// Select date (e.g., 15th)
await frame.locator(".calender-container").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=15").first().click();
await page.waitForTimeout(2000);

// Extract all data
const rows = await frame.locator("table tr, [class*=row]").all();
let data = [];
for (const row of rows) {
  const text = await row.innerText().catch(() => "");
  if (text.trim()) data.push(text.trim());
}
return data.join("\n");
'
```

## Output Directory

All CSV files should be saved to: `/Users/anton/poker-charts/`
