#!/usr/bin/env python3
"""
Validate leaderboard data for parsing/scraping errors.

Detects:
1. Duplicate files - same content scraped twice (browser didn't update)
2. Similar adjacent dates - consecutive days with nearly identical data
3. Duplicate entries - same player twice in one file
4. Wrong stake - blinds in data don't match filename
5. Empty/corrupt files - missing or broken data
6. Raw vs CSV mismatch - parsing lost or added data
7. Stale data detection - same top players with same points across dates

Usage:
    python3 scripts/validate_data.py [--verbose]
"""

import csv
import json
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime, timedelta

# Paths
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
LEADERBOARDS_DIR = ROOT_DIR / "leaderboards"
RAW_RUSH_DIR = LEADERBOARDS_DIR / "raw"
RAW_REGULAR_DIR = LEADERBOARDS_DIR / "raw-regular"
RAW_9MAX_DIR = LEADERBOARDS_DIR / "raw-9max"
STATS_FILE = LEADERBOARDS_DIR / "stats.json"

# Stake to blinds mapping
STAKE_BLINDS = {
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

# 9-max blinds include a suffix like ($0.01)
STAKE_BLINDS_9MAX = {
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

# Minimum expected row counts per stake (below this = likely error)
# Based on analysis: set to ~50% of typical minimum observed
MIN_EXPECTED_ROWS = {
    "rush": {
        "nl2": 200, "nl5": 175, "nl10": 150, "nl25": 150,
        "nl50": 120, "nl100": 70, "nl200": 50,
    },
    "regular": {
        "nl2": 150, "nl5": 125, "nl10": 125, "nl25": 110,
        "nl50": 100, "nl100": 75, "nl200": 55,
        "nl500": 45, "nl1000": 30, "nl2000": 20,
    },
    "9max": {
        "nl2": 100, "nl5": 80, "nl10": 80, "nl25": 70,
        "nl50": 60, "nl100": 50, "nl200": 40,
        "nl500": 30, "nl1000": 20,
    },
}


def game_type_label(game_type: str) -> str:
    """Convert internal game type to display label."""
    if game_type == "rush":
        return "Rush"
    elif game_type == "9max":
        return "Holdem9max"
    else:
        return "Holdem"


class DataValidator:
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.errors = []
        self.warnings = []

    def log(self, msg: str, level: str = "info"):
        if level == "error":
            self.errors.append(msg)
            print(f"  ✗ {msg}")
        elif level == "warning":
            self.warnings.append(msg)
            print(f"  ⚠ {msg}")
        elif self.verbose or level == "success":
            print(f"  ✓ {msg}")

    # =========================================================================
    # LOAD RAW DATA
    # =========================================================================

    def load_raw_files(self) -> dict:
        """Load all raw JSON files. Returns {(game_type, stake, date): data}"""
        files = {}

        for raw_dir, game_type in [(RAW_RUSH_DIR, "rush"), (RAW_REGULAR_DIR, "regular"), (RAW_9MAX_DIR, "9max")]:
            if not raw_dir.exists():
                continue

            for raw_file in raw_dir.glob("*.json"):
                parts = raw_file.stem.split("-")
                if len(parts) < 4:
                    continue

                stake = parts[0]
                date_str = "-".join(parts[1:4])

                try:
                    with open(raw_file) as f:
                        response = json.load(f)

                    if not response.get("success"):
                        continue

                    result = json.loads(response.get("result", "{}"))
                    data = result.get("data", [])
                    blinds = result.get("blinds", "")

                    files[(game_type, stake, date_str)] = {
                        "file": raw_file.name,
                        "path": raw_file,
                        "data": data,
                        "blinds": blinds,
                        "nicknames": [r["nickname"] for r in data],
                        "points": {r["nickname"]: float(r["points"]) for r in data},
                        "top10": [(r["nickname"], float(r["points"])) for r in data[:10]],
                    }
                except Exception as e:
                    self.log(f"{raw_file.name}: failed to parse - {e}", "error")

        return files

    def load_csv_files(self) -> dict:
        """Load all CSV files. Returns {(game_type, stake, date): data}"""
        files = {}

        for pattern, game_type, stake_idx, date_start in [
            ("rush-holdem-*.csv", "rush", 2, 3),
            ("holdem-nl*.csv", "regular", 1, 2),
            ("holdem9max-*.csv", "9max", 1, 2),
        ]:
            for csv_file in LEADERBOARDS_DIR.glob(pattern):
                parts = csv_file.stem.split("-")

                if game_type == "rush" and len(parts) >= 6:
                    stake = parts[stake_idx]
                    date_str = f"{parts[date_start]}-{parts[date_start+1]}-{parts[date_start+2]}"
                elif game_type == "regular" and len(parts) >= 5:
                    stake = parts[stake_idx]
                    date_str = f"{parts[date_start]}-{parts[date_start+1]}-{parts[date_start+2]}"
                elif game_type == "9max" and len(parts) >= 5:
                    stake = parts[stake_idx]
                    date_str = f"{parts[date_start]}-{parts[date_start+1]}-{parts[date_start+2]}"
                else:
                    continue

                try:
                    entries = []
                    with open(csv_file, "r", encoding="utf-8") as f:
                        reader = csv.DictReader(f)
                        for row in reader:
                            nick = row.get("Nickname", "").strip()
                            pts = float(row.get("Points", 0) or 0)
                            if nick:
                                entries.append({"nickname": nick, "points": pts})

                    files[(game_type, stake, date_str)] = {
                        "file": csv_file.name,
                        "path": csv_file,
                        "data": entries,
                        "nicknames": [e["nickname"] for e in entries],
                        "points": {e["nickname"]: e["points"] for e in entries},
                        "top10": [(e["nickname"], e["points"]) for e in entries[:10]],
                    }
                except Exception as e:
                    self.log(f"{csv_file.name}: failed to parse - {e}", "error")

        return files

    # =========================================================================
    # CHECK 1: DUPLICATE FILES (identical content)
    # =========================================================================

    def check_duplicate_files(self, raw_files: dict) -> int:
        """Detect files with identical content (browser didn't refresh)."""
        print("\n[1] DUPLICATE FILES (identical content)")

        issues = 0

        # Group by game_type + stake
        by_stake = defaultdict(list)
        for (game_type, stake, date_str), data in raw_files.items():
            by_stake[(game_type, stake)].append((date_str, data))

        for (game_type, stake), date_data_list in by_stake.items():
            sorted_dates = sorted(date_data_list, key=lambda x: x[0])

            # Only check ADJACENT dates (consecutive days)
            for i in range(1, len(sorted_dates)):
                date1, data1 = sorted_dates[i - 1]
                date2, data2 = sorted_dates[i]

                # Check if dates are consecutive
                try:
                    dt1 = datetime.strptime(date1, "%Y-%m-%d")
                    dt2 = datetime.strptime(date2, "%Y-%m-%d")
                    if (dt2 - dt1).days != 1:
                        continue
                except ValueError:
                    continue

                # Check if ALL nicknames and points are exactly the same (not just top 10)
                if data1["points"] == data2["points"] and len(data1["points"]) > 50:
                    label = game_type_label(game_type)
                    self.log(f"[{label}] {stake} {date1} and {date2} have IDENTICAL data - browser didn't update", "error")
                    issues += 1

        if issues == 0:
            self.log("No duplicate files detected", "success")

        return issues

    # =========================================================================
    # CHECK 2: SIMILAR ADJACENT DATES (stale browser data)
    # =========================================================================

    def check_similar_adjacent_dates(self, raw_files: dict) -> int:
        """Detect consecutive dates with suspiciously similar data."""
        print("\n[2] SIMILAR ADJACENT DATES (stale data)")

        issues = 0

        # Group by game_type + stake
        by_stake = defaultdict(list)
        for (game_type, stake, date_str), data in raw_files.items():
            by_stake[(game_type, stake)].append((date_str, data))

        for (game_type, stake), date_data_list in by_stake.items():
            sorted_dates = sorted(date_data_list, key=lambda x: x[0])

            for i in range(1, len(sorted_dates)):
                date1, data1 = sorted_dates[i - 1]
                date2, data2 = sorted_dates[i]

                # Check if dates are consecutive
                try:
                    dt1 = datetime.strptime(date1, "%Y-%m-%d")
                    dt2 = datetime.strptime(date2, "%Y-%m-%d")
                    if (dt2 - dt1).days != 1:
                        continue
                except ValueError:
                    continue

                # Compare top 10 nicknames
                top10_1 = [n for n, p in data1["top10"]]
                top10_2 = [n for n, p in data2["top10"]]

                if top10_1 == top10_2 and len(top10_1) > 5:
                    # Same order of top 10 - check if points are also very similar
                    points_match = 0
                    for (n1, p1), (n2, p2) in zip(data1["top10"], data2["top10"]):
                        if n1 == n2 and abs(p1 - p2) < 100:  # Within 100 points
                            points_match += 1

                    if points_match >= 8:  # 8+ of top 10 have nearly same points
                        label = game_type_label(game_type)
                        self.log(f"[{label}] {stake} {date1} -> {date2}: top 10 nearly identical - browser may not have updated", "error")
                        issues += 1

        if issues == 0:
            self.log("No stale adjacent date data detected", "success")

        return issues

    # =========================================================================
    # CHECK 3: DUPLICATE ENTRIES WITHIN FILE
    # =========================================================================

    def check_duplicate_entries(self, raw_files: dict) -> int:
        """Detect same player appearing twice in one file."""
        print("\n[3] DUPLICATE ENTRIES IN FILES")

        issues = 0

        for (game_type, stake, date_str), data in raw_files.items():
            nicknames = data["nicknames"]
            unique = set(nicknames)

            if len(nicknames) != len(unique):
                dupes = len(nicknames) - len(unique)
                label = game_type_label(game_type)
                self.log(f"[{label}] {stake} {date_str}: {dupes} duplicate entries", "error")
                issues += 1

                # Show which players are duplicated
                if self.verbose:
                    from collections import Counter
                    counts = Counter(nicknames)
                    for nick, count in counts.items():
                        if count > 1:
                            self.log(f"    {nick} appears {count} times", "warning")

        if issues == 0:
            self.log("No duplicate entries in any file", "success")

        return issues

    # =========================================================================
    # CHECK 4: WRONG STAKE (blinds mismatch)
    # =========================================================================

    def check_wrong_stake(self, raw_files: dict) -> int:
        """Detect files where blinds don't match the expected stake."""
        print("\n[4] WRONG STAKE (blinds mismatch)")

        issues = 0

        for (game_type, stake, date_str), data in raw_files.items():
            blinds = data.get("blinds", "")
            # Use appropriate blinds format based on game type
            if game_type == "9max":
                expected = STAKE_BLINDS_9MAX.get(stake, "")
            else:
                expected = STAKE_BLINDS.get(stake, "")

            if blinds and expected and blinds != expected:
                label = game_type_label(game_type)
                self.log(f"[{label}] {stake} {date_str}: expected {expected}, got {blinds}", "error")
                issues += 1

        if issues == 0:
            self.log("All stakes match their blinds", "success")

        return issues

    # =========================================================================
    # CHECK 5: EMPTY OR CORRUPT FILES
    # =========================================================================

    def check_empty_files(self, raw_files: dict) -> int:
        """Detect empty or suspiciously small files."""
        print("\n[5] EMPTY/CORRUPT FILES")

        issues = 0

        for (game_type, stake, date_str), data in raw_files.items():
            entries = data["data"]
            label = game_type_label(game_type)
            min_expected = MIN_EXPECTED_ROWS.get(game_type, {}).get(stake, 20)

            if len(entries) == 0:
                self.log(f"[{label}] {stake} {date_str}: EMPTY file (0 entries)", "error")
                issues += 1
            elif len(entries) < min_expected:
                self.log(f"[{label}] {stake} {date_str}: only {len(entries)} entries (min expected: {min_expected})", "warning")

        if issues == 0:
            self.log("No empty files detected", "success")

        return issues

    # =========================================================================
    # CHECK 6: RAW vs CSV MISMATCH
    # =========================================================================

    def check_raw_csv_mismatch(self, raw_files: dict, csv_files: dict) -> int:
        """Detect differences between raw JSON and parsed CSV."""
        print("\n[6] RAW vs CSV PARSING ERRORS")

        issues = 0

        for key, raw_data in raw_files.items():
            if key not in csv_files:
                game_type, stake, date_str = key
                label = game_type_label(game_type)
                self.log(f"[{label}] {stake} {date_str}: raw exists but CSV missing", "error")
                issues += 1
                continue

            csv_data = csv_files[key]

            raw_nicks = set(raw_data["nicknames"])
            csv_nicks = set(csv_data["nicknames"])

            # Players in CSV but not in raw (impossible - parsing error)
            extra_in_csv = csv_nicks - raw_nicks
            if extra_in_csv:
                game_type, stake, date_str = key
                label = game_type_label(game_type)
                self.log(f"[{label}] {stake} {date_str}: {len(extra_in_csv)} players in CSV but not in raw", "error")
                issues += 1

            # Significant row count difference
            raw_count = len(raw_data["nicknames"])
            csv_count = len(csv_data["nicknames"])
            if abs(raw_count - csv_count) > 10:
                game_type, stake, date_str = key
                label = game_type_label(game_type)
                self.log(f"[{label}] {stake} {date_str}: row count mismatch (raw={raw_count}, csv={csv_count})", "warning")

        if issues == 0:
            self.log("Raw and CSV files match", "success")

        return issues

    # =========================================================================
    # CHECK 7: SINGLE ENTRY DUPLICATES ACROSS FILES
    # =========================================================================

    def check_cross_file_duplicates(self, raw_files: dict) -> int:
        """Detect if MANY entries have exact same points across consecutive dates - indicates stale data."""
        print("\n[7] CROSS-FILE STALE DATA CHECK")

        issues = 0

        # Group by game_type + stake
        by_stake = defaultdict(list)
        for (game_type, stake, date_str), data in raw_files.items():
            by_stake[(game_type, stake)].append((date_str, data))

        for (game_type, stake), date_data_list in by_stake.items():
            sorted_dates = sorted(date_data_list, key=lambda x: x[0])

            # Check consecutive date pairs
            for i in range(1, len(sorted_dates)):
                date1, data1 = sorted_dates[i - 1]
                date2, data2 = sorted_dates[i]

                # Check if dates are consecutive
                try:
                    dt1 = datetime.strptime(date1, "%Y-%m-%d")
                    dt2 = datetime.strptime(date2, "%Y-%m-%d")
                    if (dt2 - dt1).days != 1:
                        continue
                except ValueError:
                    continue

                # Count how many players have EXACT same points on both days
                same_points_count = 0
                common_players = set(data1["points"].keys()) & set(data2["points"].keys())

                for nick in common_players:
                    if data1["points"][nick] == data2["points"][nick]:
                        same_points_count += 1

                # If more than 50% of common players have exact same points, suspicious
                if len(common_players) > 50 and same_points_count > len(common_players) * 0.5:
                    label = game_type_label(game_type)
                    pct = round(same_points_count / len(common_players) * 100)
                    self.log(f"[{label}] {stake} {date1} -> {date2}: {pct}% of players have EXACT same points - stale data?", "error")
                    issues += 1

        if issues == 0:
            self.log("No stale data patterns detected", "success")

        return issues

    # =========================================================================
    # CHECK 8: ROW COUNT OUTLIERS (significantly below typical for stake)
    # =========================================================================

    def check_row_count_outliers(self, raw_files: dict) -> int:
        """Detect row counts significantly below typical for that stake (scraping error)."""
        print("\n[8] ROW COUNT OUTLIERS")

        issues = 0

        # Group by game_type + stake
        by_stake = defaultdict(list)
        for (game_type, stake, date_str), data in raw_files.items():
            row_count = len(data["data"])
            by_stake[(game_type, stake)].append((date_str, row_count))

        for (game_type, stake), date_counts in by_stake.items():
            if len(date_counts) < 5:
                continue

            counts = [c for _, c in date_counts]
            min_count, max_count = min(counts), max(counts)

            # Find most common count (mode) - this is the "typical" value
            from collections import Counter
            count_freq = Counter(counts)
            typical = count_freq.most_common(1)[0][0]

            label = game_type_label(game_type)

            # Flag files more than 40% below typical (likely scraping error)
            threshold = typical * 0.6
            outliers = [(d, c) for d, c in date_counts if c < threshold]

            if outliers:
                for date_str, count in sorted(outliers):
                    drop_pct = round((1 - count / typical) * 100)
                    self.log(f"[{label}] {stake} {date_str}: {count} rows ({drop_pct}% below typical {typical}, {len(date_counts)} files)", "error")
                    issues += 1

        if issues == 0:
            self.log("No row count outliers detected", "success")

        return issues

    # =========================================================================
    # CHECK 9: MINIMUM ROW COUNTS
    # =========================================================================

    def check_minimum_row_counts(self, raw_files: dict) -> int:
        """Check if row counts meet minimum thresholds (below = likely scraping error)."""
        print("\n[9] MINIMUM ROW COUNTS")

        issues = 0

        for (game_type, stake, date_str), data in raw_files.items():
            row_count = len(data["data"])
            min_expected = MIN_EXPECTED_ROWS.get(game_type, {}).get(stake)

            if min_expected is None:
                continue

            label = game_type_label(game_type)

            if row_count < min_expected:
                self.log(f"[{label}] {stake} {date_str}: {row_count} rows (minimum: {min_expected})", "error")
                issues += 1

        if issues == 0:
            self.log("All row counts meet minimum thresholds", "success")

        return issues

    # =========================================================================
    # CHECK 10: RANK SEQUENCE GAPS
    # =========================================================================

    def check_rank_gaps(self, raw_files: dict) -> int:
        """Check for gaps in rank sequence (should be 1,2,3... with no gaps)."""
        print("\n[10] RANK SEQUENCE GAPS")

        issues = 0
        files_with_gaps = 0

        for (game_type, stake, date_str), data in raw_files.items():
            entries = data["data"]
            if not entries:
                continue

            label = game_type_label(game_type)
            gaps = []

            prev_rank = 0
            for entry in entries:
                rank = entry.get("rank", 0)
                if rank != prev_rank + 1:
                    gap_size = rank - prev_rank
                    if gap_size > 1:
                        gaps.append((prev_rank, rank, gap_size - 1))
                prev_rank = rank

            if gaps:
                files_with_gaps += 1
                total_missing = sum(g[2] for g in gaps)
                # Show first few gaps
                gap_str = ", ".join([f"{g[0]}->{g[1]}" for g in gaps[:3]])
                if len(gaps) > 3:
                    gap_str += f" (+{len(gaps)-3} more)"
                self.log(f"[{label}] {stake} {date_str}: {len(gaps)} rank gaps, {total_missing} missing ranks ({gap_str})", "warning")
                issues += 1

        if issues == 0:
            self.log("No rank gaps detected", "success")
        else:
            self.log(f"Total: {files_with_gaps} files with rank gaps", "warning")

        return issues

    # =========================================================================
    # CHECK 11: STATS.JSON CONSISTENCY
    # =========================================================================

    def check_stats_consistency(self, csv_files: dict) -> int:
        """Verify stats.json matches CSV totals."""
        print("\n[11] STATS.JSON CONSISTENCY")

        if not STATS_FILE.exists():
            self.log("stats.json not found - run build_leaderboard_stats.py", "warning")
            return 0

        issues = 0

        with open(STATS_FILE) as f:
            stats = json.load(f)

        # Count CSV entries
        csv_total = sum(len(data["data"]) for data in csv_files.values())
        stats_total = stats["summary"]["total_entries"]

        if csv_total != stats_total:
            self.log(f"Entry count mismatch: CSV has {csv_total}, stats.json has {stats_total}", "error")
            issues += 1
        else:
            self.log(f"Entry counts match: {csv_total}", "success")

        return issues

    # =========================================================================
    # CHECK 12: DATE COVERAGE
    # =========================================================================

    def check_date_coverage(self, raw_files: dict) -> int:
        """Check for missing dates or stakes."""
        print("\n[12] DATE COVERAGE")

        issues = 0
        stakes_by_type = {
            "rush": ["nl2", "nl5", "nl10", "nl25", "nl50", "nl100", "nl200"],
            "regular": ["nl2", "nl5", "nl10", "nl25", "nl50", "nl100", "nl200", "nl500", "nl1000", "nl2000"],
            "9max": ["nl2", "nl5", "nl10", "nl25", "nl50", "nl100", "nl200", "nl500", "nl1000"],
        }

        for game_type in ["rush", "regular", "9max"]:
            stakes = stakes_by_type[game_type]
            dates_by_stake = defaultdict(set)

            for (gt, stake, date_str), data in raw_files.items():
                if gt == game_type:
                    dates_by_stake[stake].add(date_str)

            if not dates_by_stake:
                continue

            label = {"rush": "Rush & Cash", "regular": "Hold'em 6-max", "9max": "Hold'em 9-max"}[game_type]

            # Find date range
            all_dates = set()
            for dates in dates_by_stake.values():
                all_dates.update(dates)

            if not all_dates:
                continue

            sorted_dates = sorted(all_dates)
            self.log(f"{label}: {sorted_dates[0]} to {sorted_dates[-1]}", "success")

            # Check for gaps
            date_objs = [datetime.strptime(d, "%Y-%m-%d") for d in sorted_dates]
            for i in range(1, len(date_objs)):
                gap = (date_objs[i] - date_objs[i-1]).days
                if gap > 1:
                    self.log(f"[{label}] Gap: {sorted_dates[i-1]} to {sorted_dates[i]} ({gap} days)", "warning")
                    issues += 1

            # Check missing stakes per date
            for date_str in sorted_dates:
                missing = []
                for stake in stakes:
                    if date_str not in dates_by_stake.get(stake, set()):
                        missing.append(stake)
                if missing:
                    self.log(f"[{label}] {date_str}: missing {missing}", "warning")
                    issues += 1

        return issues

    # =========================================================================
    # RUN ALL CHECKS
    # =========================================================================

    def run(self) -> bool:
        """Run all validation checks."""
        print("=" * 70)
        print("LEADERBOARD DATA VALIDATION")
        print("=" * 70)

        # Load data
        print("\nLoading raw files...")
        raw_files = self.load_raw_files()
        print(f"  Loaded {len(raw_files)} raw files")

        print("Loading CSV files...")
        csv_files = self.load_csv_files()
        print(f"  Loaded {len(csv_files)} CSV files")

        # Critical checks (parsing/scraping errors)
        critical_issues = 0
        critical_issues += self.check_duplicate_files(raw_files)
        critical_issues += self.check_similar_adjacent_dates(raw_files)
        critical_issues += self.check_duplicate_entries(raw_files)
        critical_issues += self.check_wrong_stake(raw_files)
        critical_issues += self.check_empty_files(raw_files)
        critical_issues += self.check_raw_csv_mismatch(raw_files, csv_files)
        critical_issues += self.check_cross_file_duplicates(raw_files)
        self.check_row_count_outliers(raw_files)
        self.check_minimum_row_counts(raw_files)
        self.check_rank_gaps(raw_files)
        critical_issues += self.check_stats_consistency(csv_files)
        self.check_date_coverage(raw_files)

        # Summary
        print("\n" + "=" * 70)
        print("VALIDATION SUMMARY")
        print("=" * 70)

        print(f"\nCritical errors: {len(self.errors)}")
        print(f"Warnings: {len(self.warnings)}")

        if self.errors:
            print("\n❌ ERRORS (re-scrape needed):")
            for e in self.errors[:20]:
                print(f"   {e}")

        if not self.errors:
            print("\n✅ NO CRITICAL ERRORS - Data looks good!")
            return True
        else:
            print(f"\n❌ VALIDATION FAILED - {len(self.errors)} errors need re-scraping")
            return False


def main():
    verbose = "--verbose" in sys.argv or "-v" in sys.argv

    validator = DataValidator(verbose=verbose)
    success = validator.run()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
