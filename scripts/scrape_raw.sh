#!/bin/bash
# Save raw leaderboard data to JSON files, then parse separately
# Usage: ./scrape_raw.sh -s nl10 -m jan -d 1-21

DIR="/Users/anton/poker-charts/leaderboards/raw"
mkdir -p "$DIR"

STAKE="nl10"
MONTH=$(date '+%m')
YEAR=$(date '+%Y')
DAY_LIST=(20 19 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1)
WAIT_TIME=5
GROUP_ID="1266"  # Jan 2026=1266, Dec 2025=1247

log() { echo "[$(date '+%H:%M:%S')] $1"; }

# Parse args
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--stake) STAKE="$2"; shift 2 ;;
        -m|--month)
            case $(echo "$2" | tr '[:upper:]' '[:lower:]') in
                1|01|jan) MONTH="01" ;; 2|02|feb) MONTH="02" ;; 3|03|mar) MONTH="03" ;;
                4|04|apr) MONTH="04" ;; 5|05|may) MONTH="05" ;; 6|06|jun) MONTH="06" ;;
                7|07|jul) MONTH="07" ;; 8|08|aug) MONTH="08" ;; 9|09|sep) MONTH="09" ;;
                10|oct) MONTH="10" ;; 11|nov) MONTH="11" ;; 12|dec) MONTH="12" ;;
            esac
            shift 2 ;;
        -y|--year) YEAR="$2"; shift 2 ;;
        -d|--days)
            if [[ "$2" == *-* ]]; then
                start=$(echo "$2" | cut -d'-' -f1)
                end=$(echo "$2" | cut -d'-' -f2)
                DAY_LIST=()
                if [ "$start" -gt "$end" ]; then
                    for ((i=start; i>=end; i--)); do DAY_LIST+=($i); done
                else
                    for ((i=start; i<=end; i++)); do DAY_LIST+=($i); done
                fi
            else
                IFS=',' read -ra DAY_LIST <<< "$2"
            fi
            shift 2 ;;
        -w|--wait) WAIT_TIME="$2"; shift 2 ;;
        -g|--group) GROUP_ID="$2"; shift 2 ;;
        *) shift ;;
    esac
done

get_blinds() {
    case "$1" in
        nl10)  echo '$0.05/$0.10' ;;
        nl25)  echo '$0.10/$0.25' ;;
        nl50)  echo '$0.25/$0.50' ;;
        nl100) echo '$0.50/$1' ;;
        nl200) echo '$1/$2' ;;
    esac
}

BLINDS=$(get_blinds "$STAKE")

log "=== Raw Scraper ==="
log "Stake: $STAKE ($BLINDS)"
log "Days: ${DAY_LIST[*]}"
log "Output: $DIR"
echo ""

# Step 1: Set stake once
log "Setting stake to $BLINDS..."
curl -s -X POST http://localhost:9876/exec -d "
const frame = page.frameLocator('iframe[src*=\"groupId=$GROUP_ID\"]');
await frame.locator('.blind-text').first().click();
await page.waitForTimeout(1000);
await frame.locator('li').filter({hasText: '$BLINDS'}).first().click();
await page.waitForTimeout(2000);
const current = await frame.locator('.blind-text').first().innerText();
return current;
" | python3 -c "import sys,json; print('Current stake:', json.load(sys.stdin).get('result','?'))"

sleep 2

# Step 2: Scrape each day
for day in "${DAY_LIST[@]}"; do
    daypad=$(printf '%02d' $day)
    filename="$STAKE-$YEAR-$MONTH-$daypad.json"
    filepath="$DIR/$filename"

    log "Day $day: changing date..."

    # Change date and extract everything in one call
    curl -s -X POST http://localhost:9876/exec -d "
const frame = page.frameLocator('iframe[src*=\"groupId=$GROUP_ID\"]');

// Change date
await frame.locator('.calender-container').first().click();
await page.waitForTimeout(1000);
// Click the day link in the datepicker calendar (not disabled ones)
const dayLinks = await frame.locator('.ui-datepicker-calendar a.ui-state-default').all();
for (const d of dayLinks) {
    const text = await d.innerText();
    if (text.trim() === '$day') {
        await d.click();
        break;
    }
}
await page.waitForTimeout(2000);

// Get displayed stake and date for verification
const blinds = await frame.locator('.blind-text').first().innerText().catch(() => '');
const dateText = await frame.locator('.calender-container').first().innerText().catch(() => '');

// Extract table data
const rows = await frame.locator('table tr').all();
const data = [];
for (const row of rows) {
    const cells = await row.locator('td').all();
    if (cells.length >= 5) {
        const rank = (await cells[0].innerText().catch(() => '')).trim();
        const nickname = (await cells[1].innerText().catch(() => '')).trim().split('\n')[0];
        const points = (await cells[3].innerText().catch(() => '')).trim().replace(/,/g, '');
        const prize = (await cells[4].innerText().catch(() => '')).trim().replace('C\$', '').replace(/,/g, '');
        if (/^\d+$/.test(rank) && nickname && !/^\d+$/.test(nickname) && /^\d+(\.\d+)?$/.test(points) && parseFloat(points) > 50) {
            data.push({rank: parseInt(rank), nickname, points, prize: prize || ''});
        }
    }
}

return JSON.stringify({
    stake: '$STAKE',
    blinds: blinds,
    date: '$YEAR-$MONTH-$daypad',
    dateText: dateText,
    rows: data.length,
    data: data
});
" > "$filepath"

    # Check result
    rows=$(python3 -c "import json; d=json.load(open('$filepath')); print(json.loads(d.get('result','{}')).get('rows', 0))" 2>/dev/null || echo "0")
    blinds_got=$(python3 -c "import json; d=json.load(open('$filepath')); print(json.loads(d.get('result','{}')).get('blinds', '?'))" 2>/dev/null || echo "?")

    log "Day $day: $rows rows, stake=$blinds_got -> $filename"

    sleep "$WAIT_TIME"
done

log "=== Done ==="
log "Raw files saved to $DIR"
log "Run: python3 scripts/parse_raw.py to convert to CSV"
