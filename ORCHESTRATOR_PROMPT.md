# Natural8 Leaderboard Scraping Orchestrator

You are an orchestrator agent responsible for scraping Natural8 Rush & Cash leaderboard data.

## Current State

Check `/Users/anton/poker-charts/scrape_progress.json` for progress. If it doesn't exist, create it.

## Target Data

**Stakes**: NL10, NL25, NL50
**Dates**: January 1-20, 2026
**Total files needed**: 60 (3 stakes × 20 days)

## Scraping Order

Process one file at a time, waiting ~1 minute between scrapes:
1. NL25 all dates (Jan 1-20)
2. NL10 all dates (Jan 1-20)
3. NL50 all dates (Jan 1-20)

## For Each Scrape

### 1. Determine Next File

Check which files exist in `/Users/anton/poker-charts/`:
- `holdem-nl10-2026-01-{DD}.csv`
- `holdem-nl25-2026-01-{DD}.csv`
- `holdem-nl50-2026-01-{DD}.csv`

Find the next missing file.

### 2. Execute Scrape via Playwright

**Change stake (if needed):**
```bash
curl -s -X POST http://localhost:9876/exec -d '
const frame = page.frameLocator("iframe[src*=\"groupId=1266\"]");
await frame.locator(".blind-text").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=$BLINDS").click();
await page.waitForTimeout(2000);
return "stake changed";
'
```

Stakes mapping:
- NL10: `$0.05/$0.10`
- NL25: `$0.10/$0.25`
- NL50: `$0.25/$0.50`

**Change date:**
```bash
curl -s -X POST http://localhost:9876/exec -d '
const frame = page.frameLocator("iframe[src*=\"groupId=1266\"]");
await frame.locator(".calender-container").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=DAY").first().click();
await page.waitForTimeout(2000);
return "date changed";
'
```

**Extract data:**
```bash
curl -s -X POST http://localhost:9876/exec -d '
const frame = page.frameLocator("iframe[src*=\"groupId=1266\"]");
const rows = await frame.locator("table tr, [class*=row]").all();
let data = [];
for (const row of rows) {
  const text = await row.innerText().catch(() => "");
  if (text.trim()) data.push(text.trim());
}
return data.join("\n");
'
```

### 3. Parse and Save

Parse the tab-separated data into CSV format:
```
Rank,Nickname,Points,Prize
1,PlayerName,12345.00,150.00
...
```

Save to: `/Users/anton/poker-charts/holdem-{stake}-2026-01-{DD}.csv`

### 4. Update Progress

Update `scrape_progress.json`:
```json
{
  "last_scrape": "2026-01-20T12:00:00",
  "completed": ["holdem-nl25-2026-01-18.csv", "holdem-nl25-2026-01-19.csv"],
  "next": "holdem-nl25-2026-01-17.csv",
  "errors": []
}
```

### 5. Wait and Repeat

Wait 60 seconds, then process next file.

## Error Handling

If extraction returns empty or invalid data:
1. Take screenshot for debugging
2. Log error in progress.json
3. Skip to next file
4. Retry failed files at end

## Completion

When all 60 files are saved, report summary:
- Total files: 60
- Successful: X
- Failed: Y
- List any missing files

## Quick Commands Reference

```javascript
// Frame reference (always use this)
const frame = page.frameLocator('iframe[src*="groupId=1266"]');

// Change to NL10
await frame.locator(".blind-text").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=$0.05/$0.10").click();

// Change to NL25
await frame.locator("text=$0.10/$0.25").click();

// Change to NL50
await frame.locator("text=$0.25/$0.50").click();

// Open calendar
await frame.locator(".calender-container").first().click();

// Select day (replace N with number 1-31)
await frame.locator("text=N").first().click();
```
