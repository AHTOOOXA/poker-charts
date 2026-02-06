#!/usr/bin/env python3
"""
Leaderboard Scraper - LLM-friendly, non-interactive

Collects publicly available leaderboard data from Natural8's promotion pages.
No authentication or login is required — all data is visible to any visitor at:
  https://www.natural8.com/en/promotions/rush-and-cash-daily-leaderboard
  https://www.natural8.com/en/promotions/holdem-daily-leaderboard

No hand histories, private player data, or game client data is accessed.

Scrapes Natural8 poker leaderboards via Playwright server.

PREREQUISITES:
    1. Playwright server running on localhost:9876
    2. Browser open (any page is fine - script navigates automatically)

USAGE:
    # Scrape everything (both game types, all stakes, full date range)
    python scripts/scrape.py --all

    # Scrape specific game type
    python scripts/scrape.py --type rush --all-stakes
    python scripts/scrape.py --type holdem --all-stakes

    # Scrape specific stake and date range
    python scripts/scrape.py --type rush --stake nl10 --from 2026-01-01 --to 2026-01-25

    # Scrape single date
    python scripts/scrape.py --type rush --stake nl10 --date 2026-01-25

    # Rescrape files with validation errors
    python scripts/scrape.py --fix-errors

    # Dry run (show what would be scraped)
    python scripts/scrape.py --all --dry-run

GAME TYPES:
    rush      - Rush & Cash (fast-fold poker)
    holdem    - Regular Hold'em 6-max (standard cash games)
    holdem9max - Regular Hold'em 9-max

STAKES:
    nl2, nl5, nl10, nl25, nl50, nl100, nl200

AFTER SCRAPING:
    python scripts/parse_raw.py              # Convert raw JSON to CSV
    python scripts/build_leaderboard_stats.py  # Build aggregated stats
    python scripts/validate_data.py          # Check for errors

GROUP IDs (update monthly):
    Rush & Cash:    1266 (Jan 2026)
    Regular Holdem: 1269 (Jan 2026)

    To find new group IDs: inspect iframe src URL on the leaderboard page
"""

import argparse
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
PLAYWRIGHT_URL = "http://localhost:9876/exec"
BASE_DIR = Path(__file__).parent.parent / "leaderboards"
WAIT_BETWEEN_REQUESTS = 2  # seconds


def update_wait_time(new_wait: int):
    global WAIT_BETWEEN_REQUESTS
    WAIT_BETWEEN_REQUESTS = new_wait

# Game type configuration
GAME_CONFIG = {
    "rush": {
        "url": "https://www.natural8.com/en/promotions/rush-and-cash-daily-leaderboard",
        "raw_dir": "raw",
        "csv_prefix": "rush-holdem",
    },
    "holdem": {
        "url": "https://www.natural8.com/en/promotions/holdem-daily-leaderboard",
        "raw_dir": "raw-regular",
        "csv_prefix": "holdem",
    },
    "holdem9max": {
        "url": "https://www.natural8.com/en/promotions/holdem-daily-leaderboard",
        "raw_dir": "raw-9max",
        "csv_prefix": "holdem9max",
    },
}

# Group IDs by month - UPDATE AS NEW MONTHS BECOME AVAILABLE
# Format: (year, month) -> {"rush": id, "holdem": id, "holdem9max": id}
# To find new IDs: navigate to page, click month button, inspect iframe src URLs
GROUP_IDS = {
    (2025, 12): {"rush": "1247", "holdem": "1250", "holdem9max": "1251"},
    (2026, 1): {"rush": "1266", "holdem": "1269", "holdem9max": "1270"},
    (2026, 2): {"rush": "1285", "holdem": "1288", "holdem9max": "1289"},
    # Add new months here as they become available
}

MONTH_NAMES = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December"
}


def get_group_id(game_type: str, year: int, month: int) -> str | None:
    """Get group ID for a specific game type and month."""
    key = (year, month)
    if key not in GROUP_IDS:
        return None
    return GROUP_IDS[key].get(game_type)

STAKES_RUSH = ["nl2", "nl5", "nl10", "nl25", "nl50", "nl100", "nl200"]
STAKES_HOLDEM = ["nl2", "nl5", "nl10", "nl25", "nl50", "nl100", "nl200", "nl500", "nl1000", "nl2000"]
STAKES_HOLDEM9MAX = ["nl2", "nl5", "nl10", "nl25", "nl50", "nl100", "nl200", "nl500", "nl1000"]

BLINDS = {
    "nl2": "$0.01/$0.02",
    "nl5": "$0.02/$0.05",
    "nl10": "$0.05/$0.10",
    "nl25": "$0.10/$0.25",
    "nl50": "$0.25/$0.50",
    "nl100": "$0.50/$1",
    "nl200": "$1/$2",
    "nl500": "$2/$5",
    "nl1000": "$5/$10",
    "nl2000": "$10/$20",
}

# 9-max blinds include a suffix like ($0.01) for the minimum stake
BLINDS_9MAX = {
    "nl2": "$0.01/$0.02 ($0.01)",
    "nl5": "$0.02/$0.05 ($0.02)",
    "nl10": "$0.05/$0.10 ($0.05)",
    "nl25": "$0.10/$0.25 ($0.10)",
    "nl50": "$0.25/$0.50 ($0.25)",
    "nl100": "$0.50/$1.00 ($0.50)",
    "nl200": "$1/$2 ($1)",
    "nl500": "$2/$5 ($2)",
    "nl1000": "$5/$10 ($5)",
}


def get_stakes(game_type: str) -> list[str]:
    """Get available stakes for a game type."""
    if game_type == "holdem":
        return STAKES_HOLDEM
    elif game_type == "holdem9max":
        return STAKES_HOLDEM9MAX
    else:
        return STAKES_RUSH


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def exec_playwright(js_code: str, timeout: int = 60) -> dict:
    """Execute JavaScript in Playwright browser via HTTP server."""
    try:
        result = subprocess.run(
            ["curl", "-s", "-X", "POST", PLAYWRIGHT_URL, "-d", js_code],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        if result.returncode != 0:
            return {"error": f"curl failed: {result.stderr}"}
        return json.loads(result.stdout)
    except json.JSONDecodeError as e:
        return {"error": f"Invalid JSON response: {e}"}
    except subprocess.TimeoutExpired:
        return {"error": "Playwright request timed out"}
    except Exception as e:
        return {"error": str(e)}


def check_playwright_server() -> bool:
    """Check if Playwright server is running."""
    result = exec_playwright("return 'ok';")
    if "error" in result:
        log(f"ERROR: Playwright server not responding: {result['error']}")
        log("Start with: npx playwright run-server (or similar)")
        return False
    return True


def init_browser_context() -> bool:
    """Initialize browser context with proper user agent to avoid Cloudflare blocking."""
    js = '''
    // Create new context with realistic user agent
    await context.close();
    context = await browser.newContext({
        ignoreHTTPSErrors: true,
        viewport: { width: 1920, height: 1080 },
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    });
    page = await context.newPage();
    return 'ok';
    '''
    result = exec_playwright(js, timeout=30)
    if "error" in result:
        log(f"ERROR: Failed to init browser context: {result['error']}")
        return False
    return True


def navigate_to_page(game_type: str, year: int = None, month: int = None) -> bool:
    """Navigate browser directly to the leaderboard iframe URL."""
    # Use current month if not specified
    if year is None or month is None:
        now = datetime.now()
        year = now.year
        month = now.month

    group_id = get_group_id(game_type, year, month)
    if not group_id:
        log(f"ERROR: No group ID configured for {game_type} {year}-{month:02d}")
        log(f"Available months: {list(GROUP_IDS.keys())}")
        return False

    month_name = MONTH_NAMES[month]
    log(f"Navigating to {game_type} leaderboard for {month_name} {year}...")

    # Navigate directly to iframe URL - more reliable than main page
    iframe_url = f"https://pml.good-game-service.com/pm-leaderboard/group?groupId={group_id}&lang=en&timezone=UTC-8"

    js = f"""
    await page.goto('{iframe_url}', {{ waitUntil: 'domcontentloaded', timeout: 60000 }});
    await page.waitForTimeout(3000);

    // Wait for leaderboard to load
    for (let i = 0; i < 5; i++) {{
        const tables = await page.locator('table').count();
        if (tables >= 2) {{
            return 'ok';
        }}
        await page.waitForTimeout(2000);
    }}

    // Check if we got content
    const tables = await page.locator('table').count();
    if (tables >= 2) {{
        return 'ok';
    }}
    throw new Error('Leaderboard tables not found after waiting');
    """

    result = exec_playwright(js, timeout=120)
    if "error" in result or result.get("result") != "ok":
        log(f"ERROR: Failed to navigate: {result}")
        return False

    log(f"Successfully loaded {game_type} leaderboard for {month_name} {year}")
    return True


# Track current navigation state to avoid redundant navigation
_current_nav = {"game_type": None, "year": None, "month": None}


def set_stake(game_type: str, stake: str, year: int, month: int) -> bool:
    """Set the stake dropdown to the specified value."""
    # Use different blinds format for 9-max
    if game_type == "holdem9max":
        blinds = BLINDS_9MAX[stake]
    else:
        blinds = BLINDS[stake]

    js = f"""
    // Click stake dropdown
    await page.locator('.blind-text').first().click();
    await page.waitForTimeout(1000);

    // Select the stake
    await page.locator('li').filter({{hasText: '{blinds}'}}).first().click();
    await page.waitForTimeout(2000);

    // Verify
    const current = await page.locator('.blind-text').first().innerText();
    return current;
    """

    result = exec_playwright(js)
    if "error" in result:
        log(f"ERROR: Failed to set stake: {result['error']}")
        return False

    current = result.get("result", "")
    if blinds not in current:
        log(f"WARNING: Stake may not have changed. Expected {blinds}, got {current}")

    return True


def scrape_day(game_type: str, stake: str, date: str) -> dict:
    """Scrape a single day's leaderboard data."""
    year_str, month_str, day_str = date.split("-")
    year = int(year_str)
    month = int(month_str)
    day = str(int(day_str))  # Remove leading zero for calendar click

    js = f"""
    // Open calendar (PrimeNG datepicker)
    await page.locator('.calender-container').first().click();
    await page.waitForTimeout(1500);

    // Click the day in PrimeNG datepicker - only select from current month cells (not other-month)
    const panel = page.locator('.p-datepicker-panel');
    // Find the day cell that is NOT in other-month class
    const dayCell = panel.locator('td:not(.p-datepicker-other-month) span:text-is("{day}")').first();
    await dayCell.click();
    await page.waitForTimeout(1500);

    // Close calendar by clicking outside (on body, away from controls)
    await page.locator('body').click({{position: {{x: 100, y: 600}}}});
    await page.waitForTimeout(1500);

    // Get displayed stake for verification
    const blinds = await page.locator('.blind-text').first().innerText().catch(() => '');

    // Wait for data to load (network idle + DOM stable)
    await page.waitForLoadState('networkidle').catch(() => {{}});
    await page.waitForTimeout(500);

    // Find leaderboard table (the one with "Rank" header, not "My Rank")
    const tables = await page.locator('table').all();
    let leaderboardTable = null;
    for (const t of tables) {{
        const text = await t.innerText();
        if (text.includes('Rank\\tNickname')) {{
            leaderboardTable = t;
            break;
        }}
    }}

    if (!leaderboardTable) {{
        return JSON.stringify({{error: 'Leaderboard table not found'}});
    }}

    // Scroll to load all rows (handles lazy/virtual loading)
    let prevRowCount = 0;
    let currRowCount = await leaderboardTable.locator('tr').count();
    let scrollAttempts = 0;
    const maxScrollAttempts = 20;
    const initialRowCount = currRowCount;

    while (scrollAttempts < maxScrollAttempts) {{
        // Check for "Load More" / "Show More" button and click it
        const loadMoreBtn = page.locator('button, a').filter({{
            hasText: /load more|show more|view more|see more/i
        }}).first();
        if (await loadMoreBtn.count() > 0) {{
            try {{
                await loadMoreBtn.click();
                await page.waitForTimeout(1000);
            }} catch (e) {{
                // Button might have disappeared
            }}
        }}

        // Scroll table container to bottom
        await leaderboardTable.evaluate(el => {{
            const container = el.closest('.p-datatable-wrapper') || el.parentElement;
            if (container) {{
                container.scrollTop = container.scrollHeight;
            }}
            // Also try scrolling the table itself
            el.scrollIntoView({{behavior: 'instant', block: 'end'}});
        }});
        await page.waitForTimeout(600);

        currRowCount = await leaderboardTable.locator('tr').count();

        // If no new rows loaded after scroll, we're done
        if (currRowCount === prevRowCount) {{
            break;
        }}
        prevRowCount = currRowCount;
        scrollAttempts++;
    }}

    // Log if scrolling loaded additional rows
    const scrollInfo = scrollAttempts > 0 && currRowCount > initialRowCount
        ? ' (scrolled ' + scrollAttempts + 'x: ' + initialRowCount + ' -> ' + currRowCount + ')'
        : '';

    const rows = await leaderboardTable.locator('tr').all();
    const data = [];

    for (let i = 1; i < rows.length; i++) {{  // Skip header row
        const text = await rows[i].innerText();
        const parts = text.split('\\t');
        if (parts.length >= 4) {{
            const rank = parts[0].trim();
            // Nickname may have newlines (e.g., from flag icons), take first non-empty line
            let nickname = parts[1].trim().split('\\n').filter(s => s.trim())[0] || '';
            nickname = nickname.trim();
            // Points and prize positions may vary, find them by pattern
            let points = '';
            let prize = '';
            for (let j = 2; j < parts.length; j++) {{
                const val = parts[j].trim();
                if (val.includes('.') && !val.includes('$') && !points) {{
                    points = val.replace(/,/g, '');
                }} else if (val.includes('C$') || (prize === '' && j === parts.length - 1)) {{
                    prize = val.replace('C$', '').replace(/,/g, '');
                }}
            }}
            if (rank && nickname && !isNaN(parseInt(rank)) && points && parseFloat(points) > 50) {{
                data.push({{rank: parseInt(rank), nickname, points, prize}});
            }}
        }}
    }}

    return JSON.stringify({{
        stake: '{stake}',
        blinds: blinds,
        date: '{date}',
        rows: data.length,
        scrollInfo: scrollInfo,
        data: data
    }});
    """

    result = exec_playwright(js, timeout=60)
    if "error" in result:
        return {"error": result["error"]}

    try:
        return json.loads(result.get("result", "{}"))
    except json.JSONDecodeError:
        return {"error": "Invalid JSON in scraped data"}


def compare_scrape_results(result1: dict, result2: dict) -> bool:
    """Compare two scrape results for consistency.

    Returns True if they are essentially the same (same players, similar row count).
    """
    if "error" in result1 or "error" in result2:
        return False

    # Must have same row count (within 5% tolerance)
    rows1 = result1.get("rows", 0)
    rows2 = result2.get("rows", 0)
    if rows1 == 0 or rows2 == 0:
        return False
    if abs(rows1 - rows2) / max(rows1, rows2) > 0.05:
        return False

    # Compare top 10 nicknames - must match exactly
    data1 = result1.get("data", [])
    data2 = result2.get("data", [])
    top10_1 = [r["nickname"] for r in data1[:10]]
    top10_2 = [r["nickname"] for r in data2[:10]]

    return top10_1 == top10_2


def scrape_day_with_retry(game_type: str, stake: str, date: str, max_attempts: int = 3) -> dict:
    """Scrape a day with retry and consistency verification.

    Scrapes up to max_attempts times and returns the result that appears most consistent.
    If 2+ scrapes match, uses that result. Otherwise takes the one with most rows.
    """
    results = []

    for attempt in range(max_attempts):
        if attempt > 0:
            log(f"      Retry {attempt + 1}/{max_attempts}...")
            time.sleep(1)  # Brief pause before retry

        result = scrape_day(game_type, stake, date)
        results.append(result)

        # If we have 2 successful results that match, we're done
        if len(results) >= 2:
            successful = [r for r in results if "error" not in r and r.get("rows", 0) > 0]
            if len(successful) >= 2:
                # Check if last two match
                if compare_scrape_results(successful[-1], successful[-2]):
                    log(f"      Verified (2 consistent reads)")
                    return successful[-1]

    # No two results matched - pick the best one
    successful = [r for r in results if "error" not in r and r.get("rows", 0) > 0]

    if not successful:
        # All attempts failed - return the last error
        return results[-1] if results else {"error": "No scrape attempts made"}

    # Return the result with the most rows (likely most complete)
    best = max(successful, key=lambda r: r.get("rows", 0))
    if len(successful) > 1:
        log(f"      Warning: inconsistent reads, using best ({best.get('rows', 0)} rows)")

    return best


def save_raw(game_type: str, stake: str, date: str, data: dict) -> Path:
    """Save raw scraped data to JSON file."""
    config = GAME_CONFIG[game_type]
    raw_dir = BASE_DIR / config["raw_dir"]
    raw_dir.mkdir(parents=True, exist_ok=True)

    filepath = raw_dir / f"{stake}-{date}.json"
    with open(filepath, "w") as f:
        json.dump({"success": True, "result": json.dumps(data)}, f, indent=2)

    return filepath


def get_date_range(from_date: str, to_date: str) -> list[str]:
    """Generate list of dates between from_date and to_date (inclusive)."""
    start = datetime.strptime(from_date, "%Y-%m-%d")
    end = datetime.strptime(to_date, "%Y-%m-%d")

    dates = []
    current = start
    while current <= end:
        dates.append(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)

    return dates


def get_default_date_range() -> tuple[str, str]:
    """Get default date range: Dec 1 to yesterday."""
    yesterday = datetime.now() - timedelta(days=1)
    return "2025-12-01", yesterday.strftime("%Y-%m-%d")


def scrape_stake(game_type: str, stake: str, dates: list[str], dry_run: bool = False, _nav_done: dict = None) -> dict:
    """Scrape all dates for a specific game type and stake.

    _nav_done is used internally to track which months we've navigated to.
    """
    results = {"success": 0, "failed": 0, "skipped": 0, "errors": []}
    if _nav_done is None:
        _nav_done = {}

    log(f"\n{'='*50}")
    log(f"Scraping {game_type.upper()} {stake} ({len(dates)} days)")
    log(f"{'='*50}")

    if dry_run:
        for date in dates:
            log(f"  [DRY RUN] Would scrape {date}")
        results["skipped"] = len(dates)
        return results

    # Group dates by month
    dates_by_month = {}
    for date in dates:
        year, month, _ = date.split("-")
        key = (int(year), int(month))
        if key not in dates_by_month:
            dates_by_month[key] = []
        dates_by_month[key].append(date)

    # Process each month
    for (year, month), month_dates in sorted(dates_by_month.items()):
        nav_key = (game_type, year, month)

        # Navigate to page if not already there
        if nav_key not in _nav_done:
            if not navigate_to_page(game_type, year, month):
                results["errors"].append(f"Failed to navigate to {game_type} {year}-{month:02d}")
                results["failed"] += len(month_dates)
                continue
            _nav_done[nav_key] = True
            time.sleep(2)

        # Set stake for this month
        if not set_stake(game_type, stake, year, month):
            results["errors"].append(f"Failed to set stake {stake} for {year}-{month:02d}")
            results["failed"] += len(month_dates)
            continue

        time.sleep(1)

        # Scrape each date in this month
        for date in month_dates:
            log(f"  Scraping {date}...")

            data = scrape_day_with_retry(game_type, stake, date)

            if "error" in data:
                log(f"    ERROR: {data['error']}")
                results["errors"].append(f"{stake} {date}: {data['error']}")
                results["failed"] += 1
            else:
                filepath = save_raw(game_type, stake, date, data)
                rows = data.get("rows", 0)
                log(f"    OK: {rows} rows -> {filepath.name}")

                if rows == 0:
                    results["errors"].append(f"{stake} {date}: empty (0 rows)")

                results["success"] += 1

            time.sleep(WAIT_BETWEEN_REQUESTS)

    return results


def scrape_game_type(game_type: str, stakes: list[str], dates: list[str], dry_run: bool = False) -> dict:
    """Scrape all stakes for a game type."""
    total_results = {"success": 0, "failed": 0, "skipped": 0, "errors": []}

    log(f"\n{'#'*60}")
    log(f"# {game_type.upper()}")
    log(f"# Stakes: {', '.join(stakes)}")
    log(f"# Dates: {dates[0]} to {dates[-1]} ({len(dates)} days)")
    log(f"{'#'*60}")

    # Track navigation state across stakes (so we don't re-navigate for each stake)
    nav_done = {}

    for stake in stakes:
        results = scrape_stake(game_type, stake, dates, dry_run, nav_done)
        total_results["success"] += results["success"]
        total_results["failed"] += results["failed"]
        total_results["skipped"] += results["skipped"]
        total_results["errors"].extend(results["errors"])

    return total_results


def get_files_to_fix() -> list[tuple[str, str, str]]:
    """Parse validation errors and return list of (game_type, stake, date) to rescrape."""
    # Run validation and capture output
    try:
        result = subprocess.run(
            ["python", "scripts/validate_data.py"],
            capture_output=True,
            text=True,
            cwd=BASE_DIR.parent,
        )
        output = result.stdout + result.stderr
    except Exception as e:
        log(f"ERROR: Could not run validation: {e}")
        return []

    files_to_fix = []
    import re

    def parse_game_type(label: str) -> str:
        if label == "Rush":
            return "rush"
        elif label == "Holdem9max":
            return "holdem9max"
        else:
            return "holdem"

    # Parse stale data errors (need to rescrape the second date)
    # Format: [Rush] nl10 2025-12-03 -> 2025-12-04: top 10 nearly identical
    for match in re.finditer(r'\[(Rush|Holdem|Holdem9max)\] (nl\d+) (\d{4}-\d{2}-\d{2}) -> (\d{4}-\d{2}-\d{2}): top 10 nearly identical', output):
        game_type = parse_game_type(match.group(1))
        stake = match.group(2)
        date = match.group(4)  # Rescrape the second date
        files_to_fix.append((game_type, stake, date))

    # Parse duplicate entry errors
    # Format: [Rush] nl2 2026-01-17: 7 duplicate entries
    for match in re.finditer(r'\[(Rush|Holdem|Holdem9max)\] (nl\d+) (\d{4}-\d{2}-\d{2}): \d+ duplicate entries', output):
        game_type = parse_game_type(match.group(1))
        stake = match.group(2)
        date = match.group(3)
        files_to_fix.append((game_type, stake, date))

    # Parse empty file errors
    # Format: [Rush] nl2 2025-12-28: EMPTY file (0 entries)
    for match in re.finditer(r'\[(Rush|Holdem|Holdem9max)\] (nl\d+) (\d{4}-\d{2}-\d{2}): EMPTY file', output):
        game_type = parse_game_type(match.group(1))
        stake = match.group(2)
        date = match.group(3)
        # Only include if we have a group ID for this month
        year, month, _ = date.split("-")
        if get_group_id(game_type, int(year), int(month)):
            files_to_fix.append((game_type, stake, date))

    # Deduplicate
    return list(set(files_to_fix))


def main():
    parser = argparse.ArgumentParser(
        description="Scrape Natural8 leaderboards",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    # What to scrape
    parser.add_argument("--all", action="store_true", help="Scrape everything (both types, all stakes, full range)")
    parser.add_argument("--type", "-t", choices=["rush", "holdem", "holdem9max"], help="Game type to scrape")
    parser.add_argument("--all-stakes", action="store_true", help="Scrape all stakes for the specified type")
    parser.add_argument("--stake", "-s", choices=STAKES_HOLDEM, help="Specific stake to scrape")
    parser.add_argument("--fix-errors", action="store_true", help="Rescrape files with validation errors")

    # Date range
    parser.add_argument("--date", "-d", help="Single date (YYYY-MM-DD)")
    parser.add_argument("--from", dest="from_date", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--to", dest="to_date", help="End date (YYYY-MM-DD)")

    # Options
    parser.add_argument("--dry-run", action="store_true", help="Show what would be scraped without scraping")
    parser.add_argument("--wait", type=int, default=WAIT_BETWEEN_REQUESTS, help="Seconds between requests")

    args = parser.parse_args()

    # Update wait time if specified
    if args.wait != WAIT_BETWEEN_REQUESTS:
        update_wait_time(args.wait)

    # Check Playwright server and init browser context
    if not args.dry_run:
        log("Checking Playwright server...")
        if not check_playwright_server():
            sys.exit(1)
        log("Playwright server OK")

        log("Initializing browser context...")
        if not init_browser_context():
            sys.exit(1)
        log("Browser context ready")

    # Handle --fix-errors
    if args.fix_errors:
        files_to_fix = get_files_to_fix()
        if not files_to_fix:
            log("No files need fixing!")
            sys.exit(0)

        log(f"Found {len(files_to_fix)} files to fix:")
        for game_type, stake, date in files_to_fix:
            log(f"  {game_type} {stake} {date}")

        if args.dry_run:
            sys.exit(0)

        # Group by game type for efficient processing
        by_type = {}
        for game_type, stake, date in files_to_fix:
            if game_type not in by_type:
                by_type[game_type] = {}
            if stake not in by_type[game_type]:
                by_type[game_type][stake] = []
            by_type[game_type][stake].append(date)

        total_results = {"success": 0, "failed": 0, "errors": []}
        for game_type, stakes_dates in by_type.items():
            nav_done = {}
            for stake, dates in stakes_dates.items():
                results = scrape_stake(game_type, stake, sorted(dates), _nav_done=nav_done)
                total_results["success"] += results["success"]
                total_results["failed"] += results["failed"]
                total_results["errors"].extend(results["errors"])

        log(f"\nFix complete: {total_results['success']} success, {total_results['failed']} failed")
        sys.exit(0 if total_results["failed"] == 0 else 1)

    # Determine date range
    if args.date:
        dates = [args.date]
    elif args.from_date and args.to_date:
        dates = get_date_range(args.from_date, args.to_date)
    else:
        from_date, to_date = get_default_date_range()
        dates = get_date_range(from_date, to_date)
        log(f"Using default date range: {from_date} to {to_date}")

    # Determine what to scrape
    total_results = {"success": 0, "failed": 0, "skipped": 0, "errors": []}

    if args.all:
        # Scrape everything
        for game_type in ["rush", "holdem", "holdem9max"]:
            stakes = get_stakes(game_type)
            results = scrape_game_type(game_type, stakes, dates, args.dry_run)
            total_results["success"] += results["success"]
            total_results["failed"] += results["failed"]
            total_results["skipped"] += results["skipped"]
            total_results["errors"].extend(results["errors"])

    elif args.type:
        all_stakes = get_stakes(args.type)
        stakes = all_stakes if args.all_stakes else ([args.stake] if args.stake else all_stakes)
        results = scrape_game_type(args.type, stakes, dates, args.dry_run)
        total_results = results

    else:
        parser.print_help()
        sys.exit(1)

    # Summary
    log(f"\n{'='*60}")
    log("SCRAPE COMPLETE")
    log(f"{'='*60}")
    log(f"Success: {total_results['success']}")
    log(f"Failed:  {total_results['failed']}")
    if total_results["skipped"]:
        log(f"Skipped: {total_results['skipped']} (dry run)")

    if total_results["errors"]:
        log(f"\nErrors ({len(total_results['errors'])}):")
        for err in total_results["errors"][:20]:  # Show first 20
            log(f"  - {err}")
        if len(total_results["errors"]) > 20:
            log(f"  ... and {len(total_results['errors']) - 20} more")

    log("\nNext steps:")
    log("  python scripts/parse_raw.py")
    log("  python scripts/build_leaderboard_stats.py")
    log("  python scripts/validate_data.py")

    sys.exit(0 if total_results["failed"] == 0 else 1)


if __name__ == "__main__":
    main()
