# Leaderboard Scraping Skill

Scrape, validate, and maintain Natural8 poker leaderboard data.

## Current Data Range

Check http://localhost:7272/leaderboard — the date range is shown next to the view toggle (e.g., "2025-12-01 — 2026-01-30").

## Default Behavior

When invoked without specific instructions, scrape new data from **last available date + 1** to **yesterday**:

```bash
# 1. Check current last date at http://localhost:7272/leaderboard
# 2. Scrape from (last_date + 1) to yesterday
python scripts/scrape.py --all --from YYYY-MM-DD --to YYYY-MM-DD

# 3. Process and validate
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py
python scripts/validate_data.py
```

## Prerequisites

Before running any scraping commands, ensure:
1. Playwright server is running on `localhost:9876` (Docker container `shared-playwright`)
2. Check with: `curl -s http://localhost:9876/health`
3. If not running, start the Docker container

**Important:** The scrape script automatically initializes a browser context with a proper user agent to avoid Cloudflare blocking. Do NOT use Claude in Chrome for scraping - use the Playwright-based script.

## Quick Commands

```bash
# Check validation status
python scripts/validate_data.py

# Fix all validation errors (stale data, duplicates, empty files)
python scripts/scrape.py --fix-errors

# After scraping, always run:
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py
python scripts/validate_data.py
```

## Scraping Commands

### By Game Type
```bash
# Rush & Cash only
python scripts/scrape.py --type rush --all-stakes --from YYYY-MM-DD --to YYYY-MM-DD

# Regular Holdem 6-max only
python scripts/scrape.py --type holdem --all-stakes --from YYYY-MM-DD --to YYYY-MM-DD

# Holdem 9-max only
python scripts/scrape.py --type holdem9max --all-stakes --from YYYY-MM-DD --to YYYY-MM-DD

# All game types (rush + holdem + holdem9max)
python scripts/scrape.py --all --from YYYY-MM-DD --to YYYY-MM-DD
```

### By Stake
```bash
# Single stake
python scripts/scrape.py --type rush --stake nl10 --date YYYY-MM-DD

# Rush stakes: nl2, nl5, nl10, nl25, nl50, nl100, nl200
# Holdem 6-max stakes: nl2, nl5, nl10, nl25, nl50, nl100, nl200, nl500, nl1000, nl2000
# Holdem 9-max stakes: nl2, nl5, nl10, nl25, nl50, nl100, nl200, nl500, nl1000
```

### Dry Run
```bash
# Preview what would be scraped without actually scraping
python scripts/scrape.py --fix-errors --dry-run
python scripts/scrape.py --all --dry-run
```

## Validation

Run validation to check data quality:
```bash
python scripts/validate_data.py
```

**What it checks (11 checks):**
1. Duplicate files (identical content different dates)
2. Stale data (adjacent dates with same top 10)
3. Duplicate entries within files
4. Wrong stake (blinds mismatch)
5. Empty files (below minimum thresholds)
6. Raw vs CSV parsing errors
7. Cross-file stale data (50%+ same points)
8. Row count outliers (>40% below typical for stake)
9. Minimum row counts (hard floor per stake)
10. Stats.json consistency
11. Date coverage gaps

**Expected result:** `Critical errors: 0`

If validation finds outliers, rescrape those specific dates:
```bash
python scripts/scrape.py --type holdem --stake nl2 --date 2025-12-25
```

## Fix Errors

The `--fix-errors` flag automatically:
1. Runs validation
2. Identifies files with stale data, duplicates, or empty content
3. Rescrapes those specific files
4. Handles month navigation (December vs January)

```bash
python scripts/scrape.py --fix-errors
```

After fixing, always re-run the pipeline:
```bash
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py
python scripts/validate_data.py
```

## Monthly Maintenance

### Group IDs Change Monthly

The website uses different iframe group IDs for each month. Current config in `scripts/scrape.py`:

```python
GROUP_IDS = {
    (2025, 12): {"rush": "1247", "holdem": "1250", "holdem9max": "1251"},
    (2026, 1): {"rush": "1266", "holdem": "1269", "holdem9max": "1270"},
    # Add new months here
}
```

### Finding New Group IDs

When a new month starts:

1. Open the leaderboard page in browser:
   - Rush: https://www.natural8.com/en/promotions/rush-and-cash-daily-leaderboard
   - Holdem (6-max & 9-max): https://www.natural8.com/en/promotions/holdem-daily-leaderboard

2. Click the new month button (e.g., "February")

3. For 9-max: switch to the 9-max tab/view on the holdem page

4. Inspect any iframe element, look at src URL for `groupId=XXXX`

5. Update `GROUP_IDS` in `scripts/scrape.py`:
```python
GROUP_IDS = {
    ...
    (2026, 2): {"rush": "XXXX", "holdem": "YYYY", "holdem9max": "ZZZZ"},  # February 2026
}
```

6. Test with dry run:
```bash
python scripts/scrape.py --type rush --stake nl10 --date 2026-02-01 --dry-run
```

## File Structure

```
leaderboards/
├── raw/                    # Rush & Cash raw JSON
├── raw-regular/            # Regular Holdem 6-max raw JSON
├── raw-9max/               # Holdem 9-max raw JSON
├── rush-holdem-*.csv       # Parsed Rush CSVs
├── holdem-*.csv            # Parsed Regular 6-max CSVs
├── holdem9max-*.csv        # Parsed 9-max CSVs
└── stats.json              # Aggregated player stats
```

## Troubleshooting

### "No group ID configured for YYYY-MM"
Add the missing month to `GROUP_IDS` in `scripts/scrape.py`.

### Cloudflare blocking (403 errors, empty page content)
The script automatically sets a proper user agent. If still failing:
1. Restart the Playwright Docker container
2. Check `docker logs shared-playwright`

### Script hangs with no output
Python stdout is buffered. The script is likely working - check for new files:
```bash
ls -lt leaderboards/raw/*.json | head -5
```

### Navigation timeout / element not found
- The page uses PrimeNG components (Angular)
- Calendar selector: `.p-datepicker-panel td:not(.p-datepicker-other-month) span:text-is("DD")`
- Stake dropdown: `.blind-text` then `li` with blinds text

### Empty scrape results (0 rows)
- Calendar might still be open (blocks table) - script clicks outside to close
- Verify the correct month is loaded
- Check if leaderboard table exists: should find table with "Rank\tNickname" header

### Validation shows row count outliers
This usually indicates a real scraping error. Rescrape the specific date:
```bash
python scripts/scrape.py --type holdem --stake nl2 --date YYYY-MM-DD
```

### Typical row counts by stake (for reference)
**Rush:** nl2=400-450, nl5=350-400, nl10=300-330, nl25=300-350, nl50=240-270, nl100=140-160, nl200=100-120
**Holdem 6-max:** nl2=300-350, nl5=250-300, nl10=250-300, nl25=220-260, nl50=200-240, nl100=150-180, nl200=110-130, nl500=90-100, nl1000=60-80, nl2000=40-50
**Holdem 9-max:** Typical counts vary by stake (calibration in progress)

## Holdem 9-max Stakes Reference

Stakes available for 9-max tables:
| Stake | Blinds |
|-------|--------|
| nl2 | $0.01/$0.02 |
| nl5 | $0.02/$0.05 |
| nl10 | $0.05/$0.10 |
| nl25 | $0.10/$0.25 |
| nl50 | $0.25/$0.50 |
| nl100 | $0.50/$1.00 |
| nl200 | $1/$2 |
| nl500 | $2/$5 |
| nl1000 | $5/$10 |

## Full Workflow Example

```bash
# 1. Check current state
python scripts/validate_data.py

# 2. If errors, fix them
python scripts/scrape.py --fix-errors

# 3. Scrape any missing recent dates
python scripts/scrape.py --all --from 2026-01-25 --to 2026-01-30

# 4. Process data
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py

# 5. Verify
python scripts/validate_data.py
# Should show: Critical errors: 0
```
