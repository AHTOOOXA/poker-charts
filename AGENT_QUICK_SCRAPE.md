# Quick Scrape Instructions (Playwright Already Set Up)

**Prerequisite**: Playwright already on Natural8 leaderboard page with stealth mode.

## Change Date Only (same stake)

```javascript
const frame = page.frameLocator('iframe[src*="groupId=1266"]');
await frame.locator(".calender-container").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=DD").first().click();  // Replace DD with day number
await page.waitForTimeout(2000);
```

## Change Stake Only (same date)

```javascript
const frame = page.frameLocator('iframe[src*="groupId=1266"]');
await frame.locator(".blind-text").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=$X.XX/$Y.YY").click();  // e.g. $0.05/$0.10 for NL10
await page.waitForTimeout(2000);
```

## Extract Data

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

## Stake Reference

| Stake | Blinds Text |
|-------|-------------|
| NL10 | `$0.05/$0.10` |
| NL25 | `$0.10/$0.25` |
| NL50 | `$0.25/$0.50` |

## File Naming

`holdem-{stake}-{yyyy}-{mm}-{dd}.csv`

Examples:
- `holdem-nl10-2026-01-18.csv`
- `holdem-nl25-2026-01-18.csv`
- `holdem-nl50-2026-01-18.csv`

## One-Liner: Change Date + Extract

```bash
curl -s -X POST http://localhost:9876/exec -d '
const frame = page.frameLocator("iframe[src*=\"groupId=1266\"]");
await frame.locator(".calender-container").first().click();
await page.waitForTimeout(1500);
await frame.locator("text=DD").first().click();
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

## Navigate to Previous Month

Click left arrow in calendar:
```javascript
await frame.locator("[class*=prev], [class*=left]").first().click();
await page.waitForTimeout(1000);
```

## Important Notes

1. Always wait 1.5-2s after clicks for data to load
2. Re-extract data after any change (previous extraction may be stale)
3. Verify date shown in screenshot if data looks wrong
4. groupId=1266 = January Hold'em, groupId=1247 = December Hold'em
