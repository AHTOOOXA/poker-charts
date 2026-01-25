# Handoff: Leaderboard Scraping & Validation

## What Was Done

### 1. Added Regular Holdem Support
- Extended scraping to support both **Rush & Cash** and **Regular Hold'em** leaderboards
- URLs:
  - Rush: https://www.natural8.com/en/promotions/rush-and-cash-daily-leaderboard
  - Holdem: https://www.natural8.com/en/promotions/holdem-daily-leaderboard

### 2. Updated Scripts

**`scripts/scrape_raw.sh`**
- Added `-t rush` / `-t regular` flag to specify game type
- Rush saves to `leaderboards/raw/`, Regular saves to `leaderboards/raw-regular/`
- Group IDs: Rush=1266, Regular=1269 (Jan 2026)

**`scripts/parse_raw.py`**
- Parses both `raw/` and `raw-regular/` directories
- Outputs `rush-holdem-*.csv` and `holdem-*.csv`

**`scripts/build_leaderboard_stats.py`**
- Tracks `rush` and `regular` game types separately
- Player stats include breakdown: `player.rush` and `player.regular`

**`scripts/validate_data.py`**
- Focused validation for parsing/scraping errors:
  1. Duplicate files (identical content on different dates)
  2. Similar adjacent dates (browser didn't update)
  3. Duplicate entries within files
  4. Wrong stake (blinds mismatch)
  5. Empty/corrupt files
  6. Raw vs CSV mismatch
  7. Cross-file stale data
  8. Stats.json consistency
  9. Date coverage gaps

### 3. Added Stakes
- nl2, nl5, nl10, nl25, nl50, nl100, nl200 for both game types
- TypeScript types and UI colors updated

### 4. UI Changes
- PlayerCard shows "Rush & Cash" and "Hold'em" sections
- Each section displays hands, stakes breakdown, placements

## Current Data State

```
Rush & Cash:    366 raw files, Dec 1 - Jan 23
Regular Holdem: 338 raw files, Dec 1 - Jan 24
Total entries:  191,506
Unique players: 22,876
```

## Known Issues (Need Re-scraping)

Run `python scripts/validate_data.py` to see full list.

**Critical:**
- 12 files with stale data (browser didn't update between days)
- 16 files with duplicate entries
- Dec 26-31 mostly empty for both game types

**To fix everything:**
```bash
./scripts/rescrape_all.sh
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
├── scrape_raw.sh           # Scrape leaderboards
├── parse_raw.py            # Convert JSON to CSV
├── build_leaderboard_stats.py  # Aggregate stats
├── validate_data.py        # Check for errors
└── rescrape_all.sh         # Full rescrape task
```

## Commands

```bash
# Scrape
./scripts/scrape_raw.sh -t rush -s nl25 -g 1266 -m jan -d 23-1
./scripts/scrape_raw.sh -t regular -s nl25 -g 1269 -m jan -d 23-1

# Parse & Build
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py

# Validate
python scripts/validate_data.py

# Dev server
bun dev
```

## Next Steps

1. Run `./scripts/rescrape_all.sh` to get clean data
2. After rescrape, run validation to confirm no errors
3. Consider adding higher stakes (nl500, nl1000, nl2000) for Regular Holdem
