# Handoff: Leaderboard Scraping & Validation

## Quick Start

```bash
# Prerequisites: Playwright server running on localhost:9876

# Fix validation errors (stale data, duplicates, empty files)
python scripts/scrape.py --fix-errors

# Scrape recent dates
python scripts/scrape.py --all --from 2026-01-25 --to 2026-01-25

# Parse and validate
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py
python scripts/validate_data.py
```

## Scraping (LLM-friendly)

The main scraping script is `scripts/scrape.py`. It's non-interactive and handles page navigation automatically, including month switching.

### Common Commands

```bash
# Scrape everything (both game types, all stakes, full date range)
python scripts/scrape.py --all

# Scrape specific game type
python scripts/scrape.py --type rush --all-stakes
python scripts/scrape.py --type holdem --all-stakes

# Scrape specific stake and date range
python scripts/scrape.py --type rush --stake nl10 --from 2026-01-01 --to 2026-01-25

# Scrape single date
python scripts/scrape.py --type rush --stake nl10 --date 2026-01-25

# Rescrape files with validation errors (stale, duplicates, empty)
python scripts/scrape.py --fix-errors

# Dry run (show what would be scraped)
python scripts/scrape.py --all --dry-run
```

### Game Types

| Type | URL |
|------|-----|
| rush | https://www.natural8.com/en/promotions/rush-and-cash-daily-leaderboard |
| holdem | https://www.natural8.com/en/promotions/holdem-daily-leaderboard |

### Stakes

nl2, nl5, nl10, nl25, nl50, nl100, nl200

### Group IDs (UPDATE MONTHLY)

The website uses different group IDs for each month. These are configured in `scripts/scrape.py`:

```python
GROUP_IDS = {
    (2025, 12): {"rush": "1247", "holdem": "1250"},
    (2026, 1): {"rush": "1266", "holdem": "1269"},
    # Add new months here
}
```

**To find new group IDs:**
1. Open the leaderboard page
2. Click the month button (e.g., "February")
3. Inspect any iframe's src URL
4. Look for `groupId=XXXX`
5. Update `GROUP_IDS` in `scripts/scrape.py`

## Validation

Run `python scripts/validate_data.py` to check for:

1. **Duplicate files** - Identical content on different dates
2. **Stale data** - Adjacent dates with nearly identical top 10 (browser didn't refresh)
3. **Duplicate entries** - Same player appearing multiple times in one file
4. **Wrong stake** - Blinds don't match the stake in filename
5. **Empty files** - Files with 0 entries
6. **Raw vs CSV mismatch** - Raw files that couldn't be parsed
7. **Cross-file stale data** - Same data appearing across multiple files
8. **Stats consistency** - stats.json matches CSV totals
9. **Date coverage** - Missing stakes on specific dates

### --fix-errors

The `--fix-errors` flag automatically:
1. Runs validation
2. Parses errors for stale data, duplicates, and empty files
3. Rescrapes those specific files
4. Handles month navigation automatically

## Current Data State

```
Rush & Cash:    392 valid files (Dec 1 - Jan 25)
Regular Holdem: 392 valid files (Dec 1 - Jan 25)
Total entries:  207,000+
Unique players: 24,000+
Validation:     PASSED (0 errors, 0 warnings)
```

## File Structure

```
leaderboards/
├── raw/                    # Rush & Cash raw JSON
├── raw-regular/            # Regular Holdem raw JSON
├── rush-holdem-*.csv       # Parsed Rush CSVs
├── holdem-*.csv            # Parsed Regular CSVs
└── stats.json              # Aggregated player stats

scripts/
├── scrape.py               # Main scraping script (LLM-friendly)
├── parse_raw.py            # Convert JSON to CSV
├── build_leaderboard_stats.py  # Aggregate stats
└── validate_data.py        # Check for errors
```

## Workflow

### Daily Update

```bash
# Scrape today's data
python scripts/scrape.py --type rush --all-stakes --date $(date +%Y-%m-%d)
python scripts/scrape.py --type holdem --all-stakes --date $(date +%Y-%m-%d)

# Parse and build
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py

# Validate
python scripts/validate_data.py
```

### Fix Validation Errors

```bash
# Automatically rescrapes files with issues
python scripts/scrape.py --fix-errors

# Then parse and rebuild
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py
python scripts/validate_data.py
```

### New Month Setup

1. Wait for the new month to start on the website
2. Navigate to leaderboard page, click new month button
3. Inspect iframe src to find new group IDs
4. Update `GROUP_IDS` in `scripts/scrape.py`
5. Scrape the new month

## Prerequisites

- Playwright server running on `localhost:9876`
- Browser open (any page - script navigates automatically)
- Python 3.10+
