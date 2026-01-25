#!/bin/bash
# Rescrape all leaderboard data (Rush & Cash + Hold'em)
# Run this to fix data quality issues (duplicates, points ordering)
#
# Before running:
# 1. Start Playwright server on localhost:9876
# 2. Open the correct page in the browser before each section

set -e

WAIT=2

echo "=== RESCRAPE ALL LEADERBOARD DATA ==="
echo ""

# ============================================
# RUSH & CASH
# ============================================
echo ">>> RUSH & CASH <<<"
echo "Open: https://www.natural8.com/en/promotions/rush-and-cash-daily-leaderboard"
echo "Press Enter when ready..."
read

GROUP=1266  # Jan 2026

for stake in nl2 nl5 nl10 nl25 nl50 nl100 nl200; do
  echo "--- Rush $stake December ---"
  ./scripts/scrape_raw.sh -t rush -s $stake -g $GROUP -m dec -y 2025 -d 31-1 -w $WAIT

  echo "--- Rush $stake January ---"
  ./scripts/scrape_raw.sh -t rush -s $stake -g $GROUP -m jan -y 2026 -d 23-1 -w $WAIT
done

# ============================================
# REGULAR HOLD'EM
# ============================================
echo ""
echo ">>> REGULAR HOLD'EM <<<"
echo "Open: https://www.natural8.com/en/promotions/holdem-daily-leaderboard"
echo "Press Enter when ready..."
read

GROUP=1269  # Jan 2026

for stake in nl2 nl5 nl10 nl25 nl50 nl100 nl200; do
  echo "--- Holdem $stake December ---"
  ./scripts/scrape_raw.sh -t regular -s $stake -g $GROUP -m dec -y 2025 -d 31-1 -w $WAIT

  echo "--- Holdem $stake January ---"
  ./scripts/scrape_raw.sh -t regular -s $stake -g $GROUP -m jan -y 2026 -d 23-1 -w $WAIT
done

# ============================================
# PARSE & BUILD
# ============================================
echo ""
echo "=== PARSING & BUILDING ==="
python scripts/parse_raw.py
python scripts/build_leaderboard_stats.py
python scripts/validate_data.py

echo ""
echo "=== DONE ==="
