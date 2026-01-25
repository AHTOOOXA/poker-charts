# Leaderboard Scraping Skill

Scrape, validate, and maintain Natural8 poker leaderboard data.

## Prerequisites

Before running any scraping commands, ensure:
1. Playwright server is running on `localhost:9876`
2. Ask user to confirm if unsure

## Quick Commands

```bash
# Check validation status
python scripts/validate_data.py

# Fix all validation errors (stale data, duplicates, empty files)
python scripts/scrape.py --fix-errors

# Scrape today's data
python scripts/scrape.py --type rush --all-stakes --date $(date +%Y-%m-%d)
python scripts/scrape.py --type holdem --all-stakes --date $(date +%Y-%m-%d)

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

# Regular Holdem only
python scripts/scrape.py --type holdem --all-stakes --from YYYY-MM-DD --to YYYY-MM-DD

# Both game types
python scripts/scrape.py --all --from YYYY-MM-DD --to YYYY-MM-DD
```

### By Stake
```bash
# Single stake
python scripts/scrape.py --type rush --stake nl10 --date YYYY-MM-DD

# Stakes: nl2, nl5, nl10, nl25, nl50, nl100, nl200
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

**What it checks:**
1. Duplicate files (identical content different dates)
2. Stale data (adjacent dates with same top 10)
3. Duplicate entries within files
4. Wrong stake (blinds mismatch)
5. Empty files (0 entries)
6. Raw vs CSV parsing errors
7. Cross-file stale data
8. Stats.json consistency
9. Date coverage gaps

**Expected result:** `Critical errors: 0, Warnings: 0`

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
    (2025, 12): {"rush": "1247", "holdem": "1250"},
    (2026, 1): {"rush": "1266", "holdem": "1269"},
    # Add new months here
}
```

### Finding New Group IDs

When a new month starts:

1. Open the leaderboard page in browser:
   - Rush: https://www.natural8.com/en/promotions/rush-and-cash-daily-leaderboard
   - Holdem: https://www.natural8.com/en/promotions/holdem-daily-leaderboard

2. Click the new month button (e.g., "February")

3. Inspect any iframe element, look at src URL for `groupId=XXXX`

4. Update `GROUP_IDS` in `scripts/scrape.py`:
```python
GROUP_IDS = {
    ...
    (2026, 2): {"rush": "XXXX", "holdem": "YYYY"},  # February 2026
}
```

5. Test with dry run:
```bash
python scripts/scrape.py --type rush --stake nl10 --date 2026-02-01 --dry-run
```

## File Structure

```
leaderboards/
├── raw/                    # Rush & Cash raw JSON
├── raw-regular/            # Regular Holdem raw JSON
├── rush-holdem-*.csv       # Parsed Rush CSVs
├── holdem-*.csv            # Parsed Regular CSVs
└── stats.json              # Aggregated player stats
```

## Troubleshooting

### "No group ID configured for YYYY-MM"
Add the missing month to `GROUP_IDS` in `scripts/scrape.py`.

### Navigation timeout
The Playwright server may need restart, or the page structure changed.

### Empty scrape results (0 rows)
- Check if the correct month button was clicked
- Verify group ID is correct for that month
- The date might not have data yet (future date)

### Validation still failing after --fix-errors
Run the full pipeline again:
```bash
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py
python scripts/validate_data.py
```

## Full Workflow Example

```bash
# 1. Check current state
python scripts/validate_data.py

# 2. If errors, fix them
python scripts/scrape.py --fix-errors

# 3. Scrape any missing recent dates
python scripts/scrape.py --all --from 2026-01-25 --to 2026-01-26

# 4. Process data
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py

# 5. Verify
python scripts/validate_data.py
# Should show: Critical errors: 0, Warnings: 0
```
