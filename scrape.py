#!/usr/bin/env python3
"""Natural8 Leaderboard Scraper - Orchestrator"""

import subprocess
import json
import re
import time
import os
from datetime import datetime

DIR = "/Users/anton/poker-charts"

STAKES = {
    "nl10": "$0.05/$0.10",
    "nl25": "$0.10/$0.25",
    "nl50": "$0.25/$0.50",
}

def run_playwright(script):
    """Execute a playwright script and return the result."""
    result = subprocess.run(
        ["curl", "-s", "-X", "POST", "http://localhost:9876/exec", "-d", script],
        capture_output=True,
        text=True
    )
    try:
        data = json.loads(result.stdout)
        if data.get("success"):
            return data.get("result", "")
        else:
            print(f"Error: {data.get('error', 'Unknown error')}")
            return None
    except json.JSONDecodeError:
        print(f"Failed to parse JSON: {result.stdout[:200]}")
        return None

def change_stake(blinds):
    """Change the stake level."""
    script = f'''
const frame = page.frameLocator('iframe[src*="groupId=1266"]');
await frame.locator('.blind-text').first().click();
await page.waitForTimeout(1500);
await frame.locator('text={blinds}').click();
await page.waitForTimeout(2000);
return 'done';
'''
    return run_playwright(script)

def change_date(day):
    """Change the date."""
    script = f'''
const frame = page.frameLocator('iframe[src*="groupId=1266"]');
await frame.locator('.calender-container').first().click();
await page.waitForTimeout(1500);
await frame.locator('text={day}').first().click();
await page.waitForTimeout(2000);
return 'done';
'''
    return run_playwright(script)

def extract_data():
    """Extract leaderboard data."""
    script = '''
const frame = page.frameLocator('iframe[src*="groupId=1266"]');
const rows = await frame.locator('table tr, [class*=row]').all();
let data = [];
for (const row of rows) {
  const text = await row.innerText().catch(() => '');
  if (text.trim()) data.push(text.trim());
}
return data.join('\\n');
'''
    return run_playwright(script)

def parse_leaderboard(raw_data):
    """Parse raw leaderboard data into CSV rows."""
    rows = []

    # Split by lines and find data rows
    lines = raw_data.split('\n')

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Check if this line starts with a rank number
        if re.match(r'^\d+\s*$', line):
            rank = line.strip()

            # Next line(s) should be nickname
            i += 1
            if i >= len(lines):
                break
            nickname = lines[i].strip()

            # Skip flag line (often empty or contains flag)
            i += 1

            # Look for points (format: XX,XXX.XX)
            while i < len(lines):
                line = lines[i].strip()
                points_match = re.search(r'([\d,]+\.\d{2})', line)
                if points_match:
                    points = points_match.group(1).replace(',', '')

                    # Look for prize (format: C$XX.XX)
                    prize_match = re.search(r'C\$([\d,]+\.\d{2})', line)
                    if prize_match:
                        prize = prize_match.group(1).replace(',', '')
                    else:
                        # Check next line for prize
                        i += 1
                        if i < len(lines):
                            prize_match = re.search(r'C\$([\d,]+\.\d{2})', lines[i])
                            prize = prize_match.group(1).replace(',', '') if prize_match else ''
                        else:
                            prize = ''

                    rows.append({
                        'rank': int(rank),
                        'nickname': nickname,
                        'points': float(points),
                        'prize': float(prize) if prize else 0
                    })
                    break
                i += 1
        i += 1

    return rows

def save_csv(rows, filepath):
    """Save parsed rows to CSV."""
    with open(filepath, 'w') as f:
        f.write("Rank,Nickname,Points,Prize\n")
        for row in rows:
            # Escape commas in nicknames
            nickname = row['nickname'].replace(',', ' ')
            f.write(f"{row['rank']},{nickname},{row['points']:.2f},{row['prize']:.2f}\n")
    return len(rows)

def get_existing_files():
    """Get list of existing CSV files."""
    files = []
    for f in os.listdir(DIR):
        if f.startswith('holdem-') and f.endswith('.csv'):
            files.append(f)
    return files

def scrape_one(stake, day, current_stake):
    """Scrape one leaderboard."""
    filename = f"holdem-{stake}-2026-01-{day:02d}.csv"
    filepath = os.path.join(DIR, filename)

    if os.path.exists(filepath) and os.path.getsize(filepath) > 100:
        print(f"SKIP: {filename} already exists")
        return current_stake, False

    print(f"SCRAPING: {filename}")

    # Change stake if needed
    if stake != current_stake:
        print(f"  Changing stake to {STAKES[stake]}")
        change_stake(STAKES[stake])
        time.sleep(1)
        current_stake = stake

    # Change date
    print(f"  Changing date to day {day}")
    change_date(day)
    time.sleep(1)

    # Extract data
    print("  Extracting data...")
    raw = extract_data()

    if not raw:
        print(f"  ERROR: No data extracted")
        return current_stake, False

    # Parse data
    rows = parse_leaderboard(raw)

    if len(rows) < 10:
        print(f"  ERROR: Only {len(rows)} rows parsed")
        return current_stake, False

    # Save
    count = save_csv(rows, filepath)
    print(f"  SAVED: {filename} ({count} rows)")

    return current_stake, True

def main():
    print("=" * 50)
    print("Natural8 Leaderboard Scraper")
    print("=" * 50)

    existing = get_existing_files()
    print(f"Existing files: {len(existing)}")

    # Order: NL25 first, then NL10, then NL50
    stake_order = ["nl25", "nl10", "nl50"]
    days = list(range(20, 0, -1))  # 20 down to 1

    current_stake = None
    scraped = 0

    for stake in stake_order:
        for day in days:
            filename = f"holdem-{stake}-2026-01-{day:02d}.csv"
            filepath = os.path.join(DIR, filename)

            # Skip if exists and not empty
            if os.path.exists(filepath) and os.path.getsize(filepath) > 100:
                continue

            current_stake, success = scrape_one(stake, day, current_stake)

            if success:
                scraped += 1

            print(f"  Waiting 60 seconds...")
            time.sleep(60)

    print("=" * 50)
    print(f"Complete! Scraped {scraped} new files")

    # Summary
    for stake in stake_order:
        count = len([f for f in os.listdir(DIR) if f.startswith(f'holdem-{stake}-')])
        print(f"  {stake}: {count} files")

if __name__ == "__main__":
    main()
