# Subagent Orchestrator for Natural8 Scraping

## Your Role

You are an orchestrator that scrapes Natural8 leaderboard data one file at a time, waiting 60 seconds between scrapes.

## Current Progress

First, check existing files:
```bash
ls -la /Users/anton/poker-charts/holdem-*.csv
```

## Target Files (60 total)

**NL25** (priority): Jan 1-20, 2026
**NL10**: Jan 1-20, 2026
**NL50**: Jan 1-20, 2026

## Scrape Process

For each missing file, execute this sequence:

### Step 1: Change Stake (if needed)

```bash
curl -s -X POST http://localhost:9876/exec -d '
const frame = page.frameLocator("iframe[src*=\"groupId=1266\"]");
await frame.locator(".blind-text").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=BLINDS_HERE").click();
await page.waitForTimeout(2000);
return "done";
'
```

Replace BLINDS_HERE:
- NL10: `$0.05/$0.10`
- NL25: `$0.10/$0.25`
- NL50: `$0.25/$0.50`

### Step 2: Change Date

```bash
curl -s -X POST http://localhost:9876/exec -d '
const frame = page.frameLocator("iframe[src*=\"groupId=1266\"]");
await frame.locator(".calender-container").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=DAY_NUMBER").first().click();
await page.waitForTimeout(2000);
return "done";
'
```

### Step 3: Extract Data

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

### Step 4: Save CSV

Parse the extracted data and write to:
`/Users/anton/poker-charts/holdem-{stake}-2026-01-{DD}.csv`

Format:
```csv
Rank,Nickname,Points,Prize
1,PlayerName,12345.00,150.00
```

### Step 5: Wait 60 seconds

```bash
sleep 60
```

### Step 6: Repeat

Go back to Step 1 for the next missing file.

## Quick Single-File Scrape Command

Combine steps 2+3 (when stake is already correct):

```bash
curl -s -X POST http://localhost:9876/exec -d '
const frame = page.frameLocator("iframe[src*=\"groupId=1266\"]");
await frame.locator(".calender-container").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=DAY").first().click();
await page.waitForTimeout(2000);
const rows = await frame.locator("table tr, [class*=row]").all();
let data = [];
for (const row of rows) {
  const text = await row.innerText().catch(() => "");
  if (text.trim()) data.push(text.trim());
}
return data.join("\n");
'
```

## Execution Order

1. Check what files exist
2. Determine next file to scrape (NL25 first, then NL10, then NL50)
3. Scrape and save
4. Wait 60 seconds
5. Report progress
6. Continue until all 60 files complete

## Example Session

```
Checking existing files...
Found: holdem-nl25-2026-01-18.csv, holdem-nl25-2026-01-19.csv

Next file: holdem-nl25-2026-01-17.csv
- Stake: NL25 (already set)
- Date: 17

Scraping...
Extracted 300 rows
Saved to holdem-nl25-2026-01-17.csv

Waiting 60 seconds...

Next file: holdem-nl25-2026-01-16.csv
...
```
