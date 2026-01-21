#!/bin/bash

# Natural8 Leaderboard Scraping Orchestrator
# Usage: ./orchestrator.sh [OPTIONS]
#   -s, --stakes    Comma-separated stakes (nl10,nl25,nl50) - default: nl25
#   -d, --days      Comma-separated days or range (1-20 or 5,10,15) - default: 20-1
#   -w, --wait      Wait time between scrapes in seconds - default: 60
#   -f, --force     Force re-scrape even if file exists
#   -h, --help      Show this help

DIR="/Users/anton/poker-charts/leaderboards"

# Get blinds text for a stake
get_blinds() {
    case "$1" in
        nl2)   echo '\$0.01/\$0.02' ;;
        nl5)   echo '\$0.02/\$0.05' ;;
        nl10)  echo '\$0.05/\$0.10' ;;
        nl25)  echo '\$0.10/\$0.25' ;;
        nl50)  echo '\$0.25/\$0.50' ;;
        nl100) echo '\$0.50/\$1' ;;
        nl200) echo '\$1/\$2' ;;
        *) echo "" ;;
    esac
}

# Defaults
STAKE_LIST=("nl25")
DAY_LIST=(20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1)
WAIT_TIME=60
FORCE=false

usage() {
    echo "Natural8 Leaderboard Scraper"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -s, --stakes STAKES   Comma-separated stakes: nl10,nl25,nl50"
    echo "                        Default: nl25"
    echo "  -d, --days DAYS       Days to scrape. Formats:"
    echo "                        - Range: 1-20 (descending) or 5-10 (ascending)"
    echo "                        - List: 5,10,15,20"
    echo "                        Default: 20-1 (all days descending)"
    echo "  -w, --wait SECONDS    Wait time between scrapes (default: 60)"
    echo "  -f, --force           Force re-scrape even if file exists"
    echo "  -h, --help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 -s nl25 -d 20,19,18           # NL25 for days 20,19,18"
    echo "  $0 -s nl10,nl25 -d 15-20         # NL10 and NL25, days 15 to 20"
    echo "  $0 -s nl50 -d 1-5 -w 30          # NL50, days 1-5, 30s wait"
    echo "  $0 --force -s nl25 -d 20         # Force re-scrape NL25 day 20"
}

parse_days() {
    local input="$1"
    local result=()

    if [[ "$input" == *-* ]]; then
        # Range format: 1-20 or 20-1
        local start=$(echo "$input" | cut -d'-' -f1)
        local end=$(echo "$input" | cut -d'-' -f2)
        if [ "$start" -gt "$end" ]; then
            for ((i=start; i>=end; i--)); do
                result+=($i)
            done
        else
            for ((i=start; i<=end; i++)); do
                result+=($i)
            done
        fi
    else
        # Comma-separated list
        IFS=',' read -ra result <<< "$input"
    fi

    echo "${result[@]}"
}

parse_stakes() {
    local input="$1"
    IFS=',' read -ra result <<< "$input"
    echo "${result[@]}"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--stakes)
            STAKE_LIST=($(parse_stakes "$2"))
            shift 2
            ;;
        -d|--days)
            DAY_LIST=($(parse_days "$2"))
            shift 2
            ;;
        -w|--wait)
            WAIT_TIME="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

change_stake() {
    local blinds="$1"
    log "Changing stake to $blinds"
    curl -s -X POST http://localhost:9876/exec -d "
const frame = page.frameLocator('iframe[src*=\"groupId=1266\"]');
await frame.locator('.blind-text').first().click();
await page.waitForTimeout(1000);
await frame.locator('li:has-text(\"$blinds\")').first().click({force: true});
await page.waitForTimeout(2000);
return 'stake changed';
" | grep -q '"success": true' && echo "  OK" || echo "  WARN: stake change may have failed"
}

change_date() {
    local day="$1"
    log "Changing date to day $day"
    curl -s -X POST http://localhost:9876/exec -d "
const frame = page.frameLocator('iframe[src*=\"groupId=1266\"]');
await frame.locator('.calender-container').first().click();
await page.waitForTimeout(1500);
await frame.locator('text=$day').first().click();
await page.waitForTimeout(2000);
return 'date changed';
" | grep -q '"success": true' && echo "  OK" || echo "  FAIL"
}

extract_data() {
    curl -s -X POST http://localhost:9876/exec -d '
const frame = page.frameLocator("iframe[src*=\"groupId=1266\"]");
const rows = await frame.locator("table tr").all();
let data = [];
for (const row of rows) {
  const cells = await row.locator("td").all();
  if (cells.length >= 5) {
    const rank = (await cells[0].innerText().catch(() => "")).trim();
    const nickname = (await cells[1].innerText().catch(() => "")).trim().split("\n")[0];
    const points = (await cells[3].innerText().catch(() => "")).trim().replace(/,/g, "");
    const prize = (await cells[4].innerText().catch(() => "")).trim().replace("C$", "").replace(/,/g, "");
    // Include all players with valid rank and points (prize can be empty)
    if (/^\d+$/.test(rank) && nickname && /^\d+\.\d{2}$/.test(points)) {
      data.push({rank: parseInt(rank), nickname, points, prize: prize || ""});
    }
  }
}
return JSON.stringify(data);
'
}

scrape_one() {
    local stake="$1"
    local day="$2"
    local filename="holdem-${stake}-2026-01-$(printf '%02d' $day).csv"
    local filepath="$DIR/$filename"

    # Skip if file exists with data (unless --force)
    if [ "$FORCE" = false ] && [ -f "$filepath" ] && [ $(wc -l < "$filepath") -gt 1 ]; then
        log "SKIP: $filename already exists with data"
        return 1
    fi

    log "SCRAPING: $filename"

    # Change date
    change_date "$day"
    sleep 2

    # Extract
    log "Extracting data..."
    local result=$(extract_data)

    # Check if we got valid data
    if echo "$result" | grep -q '"success": true'; then
        # Extract returns JSON array, convert to CSV with Python
        echo "$result" | python3 -c "
import sys, json
resp = json.load(sys.stdin)
data = json.loads(resp.get('result', '[]'))
if len(data) >= 10:
    print('Rank,Nickname,Points,Prize')
    for row in sorted(data, key=lambda x: x['rank']):
        nick = row['nickname'].replace(',', ' ')
        print(f\"{row['rank']},{nick},{row['points']},{row['prize']}\")
    print(f'ROWS:{len(data)}', file=sys.stderr)
else:
    print(f'INSUFFICIENT:{len(data)}', file=sys.stderr)
    sys.exit(1)
" > "$filepath" 2>"$filepath.status"

        local status=$(cat "$filepath.status")
        rm -f "$filepath.status"

        if echo "$status" | grep -q "^ROWS:"; then
            local row_count=$(echo "$status" | sed 's/ROWS://')
            log "SAVED: $filename ($row_count rows)"
            return 0
        else
            local row_count=$(echo "$status" | sed 's/INSUFFICIENT://')
            rm -f "$filepath"
            log "ERROR: Only $row_count rows extracted for $filename (need at least 10)"
            return 2
        fi
    else
        log "ERROR: Failed to extract data for $filename"
        return 2
    fi
}

# Validate stakes
for stake in "${STAKE_LIST[@]}"; do
    if [ -z "$(get_blinds "$stake")" ]; then
        echo "ERROR: Invalid stake '$stake'. Valid options: nl10, nl25, nl50"
        exit 1
    fi
done

# Main loop
log "=== Starting Orchestrator ==="
log "Stakes: ${STAKE_LIST[*]}"
log "Days: ${DAY_LIST[*]}"
log "Wait: ${WAIT_TIME}s between scrapes"
log "Force: $FORCE"
log "Target: ${#STAKE_LIST[@]} stakes × ${#DAY_LIST[@]} days = $((${#STAKE_LIST[@]} * ${#DAY_LIST[@]})) files"
echo ""

current_stake=""
scraped=0
skipped=0
failed=0

for stake in "${STAKE_LIST[@]}"; do
    # Change stake if different from current
    if [ "$stake" != "$current_stake" ]; then
        change_stake "$(get_blinds "$stake")"
        current_stake="$stake"
        sleep 2
    fi

    for day in "${DAY_LIST[@]}"; do
        result=$(scrape_one "$stake" "$day")
        exit_code=$?

        if [ $exit_code -eq 0 ]; then
            ((scraped++))
        elif [ $exit_code -eq 1 ]; then
            ((skipped++))
            continue  # Don't wait for skipped files
        else
            ((failed++))
        fi

        # Wait before next scrape
        log "Waiting ${WAIT_TIME}s..."
        sleep "$WAIT_TIME"
    done
done

echo ""
log "=== Orchestrator Complete ==="
log "Scraped: $scraped | Skipped: $skipped | Failed: $failed"

# Summary by stake
for stake in "${STAKE_LIST[@]}"; do
    count=$(ls -1 "$DIR"/holdem-${stake}-2026-01-*.csv 2>/dev/null | wc -l | tr -d ' ')
    log "$stake: $count files total"
done
