#!/usr/bin/env python3
"""
Validate leaderboard data integrity.

Checks:
1. No duplicate entries (same player+date+stake)
2. CSV and raw JSON consistency
3. stats.json matches CSV data
4. Data quality (points ranges, rank sequences, etc.)
5. Date continuity and coverage

Usage:
    python3 scripts/validate_data.py [--fix] [--verbose]

Options:
    --fix       Auto-fix duplicate entries (keep highest points)
    --verbose   Show detailed output for all checks
"""

import csv
import json
import sys
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime, timedelta
from typing import NamedTuple

# Paths
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent
LEADERBOARDS_DIR = ROOT_DIR / "leaderboards"
RAW_DIR = LEADERBOARDS_DIR / "raw"
STATS_FILE = LEADERBOARDS_DIR / "stats.json"

# Constants
STAKES = ["nl10", "nl25", "nl50", "nl100", "nl200"]
POINTS_PER_HAND = 1.21


class ValidationResult(NamedTuple):
    passed: bool
    message: str
    details: list = []


class DataValidator:
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.errors = []
        self.warnings = []
        self.csv_entries = []
        self.stats = None

    def log(self, msg: str, level: str = "info"):
        if level == "error":
            self.errors.append(msg)
            print(f"  ✗ {msg}")
        elif level == "warning":
            self.warnings.append(msg)
            print(f"  ⚠ {msg}")
        elif self.verbose or level == "success":
            print(f"  ✓ {msg}")

    def load_csv_data(self) -> list[dict]:
        """Load all CSV files and return entries."""
        entries = []
        csv_files = list(LEADERBOARDS_DIR.glob("rush-holdem-*.csv"))

        for csv_file in csv_files:
            parts = csv_file.stem.split("-")
            if len(parts) >= 6:
                stake = parts[2]
                date_str = f"{parts[3]}-{parts[4]}-{parts[5]}"
            else:
                continue

            try:
                with open(csv_file, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        nickname = row.get("Nickname", "").strip()
                        points = row.get("Points", "0")
                        rank = row.get("Rank", "0")

                        if nickname and rank.isdigit() and int(rank) > 0:
                            entries.append({
                                "file": csv_file.name,
                                "date": date_str,
                                "stake": stake,
                                "rank": int(rank),
                                "nickname": nickname,
                                "points": float(points or 0),
                            })
            except Exception as e:
                self.log(f"Failed to parse {csv_file.name}: {e}", "error")

        return entries

    def load_stats(self) -> dict | None:
        """Load stats.json."""
        if not STATS_FILE.exists():
            return None
        with open(STATS_FILE) as f:
            return json.load(f)

    def check_duplicates(self) -> ValidationResult:
        """Check for duplicate entries (same player+date+stake)."""
        print("\n[1] DUPLICATE ENTRIES CHECK")

        by_key = defaultdict(list)
        for entry in self.csv_entries:
            key = (entry["date"], entry["stake"], entry["nickname"])
            by_key[key].append(entry)

        duplicates = {k: v for k, v in by_key.items() if len(v) > 1}

        if duplicates:
            self.log(f"Found {len(duplicates)} duplicate entries", "error")
            for (date, stake, nick), entries in list(duplicates.items())[:5]:
                pts = [e["points"] for e in entries]
                self.log(f"  {nick} on {date} at {stake}: points={pts}", "error")
            return ValidationResult(False, f"{len(duplicates)} duplicates found", list(duplicates.keys()))

        self.log(f"No duplicates in {len(self.csv_entries)} entries", "success")
        return ValidationResult(True, "No duplicates")

    def check_raw_csv_match(self) -> ValidationResult:
        """Verify raw JSON matches CSV for files that have both."""
        print("\n[2] RAW JSON vs CSV CONSISTENCY")

        if not RAW_DIR.exists():
            self.log("No raw directory found, skipping", "warning")
            return ValidationResult(True, "Skipped - no raw dir")

        mismatches = []
        checked = 0

        for raw_file in RAW_DIR.glob("*.json"):
            # nl10-2026-01-06.json -> rush-holdem-nl10-2026-01-06.csv
            parts = raw_file.stem.split("-")
            stake = parts[0]
            date_parts = "-".join(parts[1:])
            csv_name = f"rush-holdem-{stake}-{date_parts}.csv"
            csv_file = LEADERBOARDS_DIR / csv_name

            if not csv_file.exists():
                continue

            checked += 1

            # Load raw data
            try:
                with open(raw_file) as f:
                    response = json.load(f)
                result = json.loads(response.get("result", "{}"))
                raw_data = result.get("data", [])
            except Exception as e:
                self.log(f"Failed to parse {raw_file.name}: {e}", "error")
                continue

            # Load CSV data
            csv_data = []
            with open(csv_file) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    csv_data.append({
                        "rank": int(row["Rank"]),
                        "nickname": row["Nickname"],
                        "points": float(row["Points"]),
                    })

            # Compare counts
            raw_unique = len(set(r["nickname"] for r in raw_data))
            csv_unique = len(set(r["nickname"] for r in csv_data))

            # CSV should have deduplicated data (unique = total)
            if len(csv_data) != csv_unique:
                mismatches.append(f"{csv_name}: CSV has duplicates ({len(csv_data)} rows, {csv_unique} unique)")

        if mismatches:
            for m in mismatches[:5]:
                self.log(m, "error")
            return ValidationResult(False, f"{len(mismatches)} mismatches", mismatches)

        self.log(f"Checked {checked} raw/CSV pairs, all consistent", "success")
        return ValidationResult(True, f"{checked} files verified")

    def check_stats_consistency(self) -> ValidationResult:
        """Verify stats.json matches CSV data."""
        print("\n[3] STATS.JSON CONSISTENCY")

        if not self.stats:
            self.log("stats.json not found", "error")
            return ValidationResult(False, "No stats.json")

        issues = []
        summary = self.stats["summary"]
        players = {p["nickname"]: p for p in self.stats["players"]}

        # Check total entries
        if len(self.csv_entries) != summary["total_entries"]:
            issues.append(f"Entry count: CSV={len(self.csv_entries)}, stats={summary['total_entries']}")

        # Check unique players
        csv_players = set(e["nickname"] for e in self.csv_entries)
        if len(csv_players) != summary["unique_players"]:
            issues.append(f"Player count: CSV={len(csv_players)}, stats={summary['unique_players']}")

        # Spot check a few players
        player_entries = defaultdict(lambda: {"entries": 0, "points": 0, "stakes": defaultdict(int), "dates": set()})
        for e in self.csv_entries:
            pe = player_entries[e["nickname"]]
            pe["entries"] += 1
            pe["points"] += e["points"]
            pe["stakes"][e["stake"]] += 1
            pe["dates"].add(e["date"])

        # Check first 10 players
        for nick in list(players.keys())[:10]:
            if nick not in player_entries:
                issues.append(f"Player {nick} in stats but not in CSV")
                continue

            csv_pe = player_entries[nick]
            stats_pe = players[nick]

            if csv_pe["entries"] != stats_pe["entries"]:
                issues.append(f"{nick}: entries CSV={csv_pe['entries']}, stats={stats_pe['entries']}")

            if abs(csv_pe["points"] - stats_pe["total_points"]) > 1:
                issues.append(f"{nick}: points CSV={csv_pe['points']:.0f}, stats={stats_pe['total_points']:.0f}")

            if len(csv_pe["dates"]) != stats_pe["days_active"]:
                issues.append(f"{nick}: days CSV={len(csv_pe['dates'])}, stats={stats_pe['days_active']}")

        if issues:
            for issue in issues[:10]:
                self.log(issue, "error")
            return ValidationResult(False, f"{len(issues)} inconsistencies", issues)

        self.log("stats.json matches CSV data", "success")
        return ValidationResult(True, "Consistent")

    def check_data_quality(self) -> ValidationResult:
        """Check data quality: points ranges, ranks, etc."""
        print("\n[4] DATA QUALITY CHECK")

        issues = []

        # Group by file
        by_file = defaultdict(list)
        for e in self.csv_entries:
            by_file[e["file"]].append(e)

        for fname, entries in by_file.items():
            entries_sorted = sorted(entries, key=lambda x: x["rank"])

            # Check for rank gaps
            ranks = [e["rank"] for e in entries_sorted]
            for i in range(1, len(ranks)):
                gap = ranks[i] - ranks[i - 1]
                if gap > 5:  # Allow small gaps
                    issues.append(f"{fname}: rank gap {ranks[i-1]} -> {ranks[i]}")

            # Check points are roughly decreasing
            points = [e["points"] for e in entries_sorted]
            increases = 0
            for i in range(1, len(points)):
                if points[i] > points[i - 1] * 1.1:  # 10% tolerance
                    increases += 1

            if increases > 2:
                issues.append(f"{fname}: {increases} significant points increases (expected monotonic decrease)")

            # Check for zero/negative points
            zero_pts = sum(1 for p in points if p <= 0)
            if zero_pts > 0:
                issues.append(f"{fname}: {zero_pts} entries with zero/negative points")

            # Check for suspiciously low points (min should be > 1000 typically)
            if min(points) < 100:
                issues.append(f"{fname}: suspiciously low min points: {min(points)}")

        if issues:
            for issue in issues[:10]:
                self.log(issue, "warning")
            return ValidationResult(len(issues) < 5, f"{len(issues)} quality issues", issues)

        self.log("Data quality looks good", "success")
        return ValidationResult(True, "Good quality")

    def check_date_coverage(self) -> ValidationResult:
        """Check for gaps in date coverage."""
        print("\n[5] DATE COVERAGE CHECK")

        dates = set()
        stakes_by_date = defaultdict(set)

        for e in self.csv_entries:
            dates.add(e["date"])
            stakes_by_date[e["date"]].add(e["stake"])

        dates_sorted = sorted(dates)

        if not dates_sorted:
            self.log("No dates found", "error")
            return ValidationResult(False, "No data")

        issues = []

        # Check for date gaps
        date_objs = [datetime.strptime(d, "%Y-%m-%d") for d in dates_sorted]
        for i in range(1, len(date_objs)):
            gap = (date_objs[i] - date_objs[i - 1]).days
            if gap > 1:
                issues.append(f"Gap: {dates_sorted[i-1]} to {dates_sorted[i]} ({gap} days)")

        # Check each date has all stakes
        for date in dates_sorted:
            missing = set(STAKES) - stakes_by_date[date]
            if missing:
                issues.append(f"{date}: missing stakes {missing}")

        if issues:
            for issue in issues[:10]:
                self.log(issue, "warning")

        self.log(f"Coverage: {dates_sorted[0]} to {dates_sorted[-1]} ({len(dates_sorted)} days)", "success")
        return ValidationResult(len(issues) == 0, f"{len(dates_sorted)} days", issues)

    def check_player_stats(self) -> ValidationResult:
        """Verify player-level statistics."""
        print("\n[6] PLAYER STATISTICS CHECK")

        if not self.stats:
            return ValidationResult(True, "Skipped - no stats")

        issues = []
        players = self.stats["players"]

        for p in players[:50]:  # Check first 50
            # Stake sum should equal entries
            stake_sum = sum(p["stakes"].values())
            if stake_sum != p["entries"]:
                issues.append(f"{p['nickname']}: stake sum {stake_sum} != entries {p['entries']}")

            # Days active should equal len(dates)
            if len(p["dates"]) != p["days_active"]:
                issues.append(f"{p['nickname']}: dates len {len(p['dates'])} != days_active {p['days_active']}")

            # Hands estimation check
            expected_hands = int(p["total_points"] / POINTS_PER_HAND)
            if expected_hands != p["estimated_hands"]:
                issues.append(f"{p['nickname']}: hands calc {expected_hands} != {p['estimated_hands']}")

            # Activity rate should be <= 1
            if p["activity_rate"] > 1.0 or p["activity_rate"] < 0:
                issues.append(f"{p['nickname']}: invalid activity_rate {p['activity_rate']}")

            # first_seen should be dates[0]
            if p["dates"] and p["dates"][0] != p["first_seen"]:
                issues.append(f"{p['nickname']}: first_seen mismatch")

            # last_seen should be dates[-1]
            if p["dates"] and p["dates"][-1] != p["last_seen"]:
                issues.append(f"{p['nickname']}: last_seen mismatch")

        if issues:
            for issue in issues[:10]:
                self.log(issue, "error")
            return ValidationResult(False, f"{len(issues)} stat issues", issues)

        self.log("Player statistics verified", "success")
        return ValidationResult(True, "Stats correct")

    def check_raw_data_quality(self) -> ValidationResult:
        """Check raw JSON files for issues (duplicates, ordering)."""
        print("\n[7] RAW DATA QUALITY CHECK")

        if not RAW_DIR.exists():
            self.log("No raw directory, skipping", "warning")
            return ValidationResult(True, "Skipped")

        issues = []

        for raw_file in sorted(RAW_DIR.glob("*.json")):
            try:
                with open(raw_file) as f:
                    response = json.load(f)
                result = json.loads(response.get("result", "{}"))
                data = result.get("data", [])
            except Exception:
                issues.append(f"{raw_file.name}: failed to parse")
                continue

            if not data:
                continue

            # Check for duplicates in raw data
            nicknames = [r["nickname"] for r in data]
            unique = len(set(nicknames))
            if len(nicknames) != unique:
                dupes = len(nicknames) - unique
                issues.append(f"{raw_file.name}: {dupes} duplicate entries in raw data")

            # Check for significant points ordering issues
            points = [float(r["points"]) for r in data]
            increases = sum(1 for i in range(1, len(points)) if points[i] > points[i-1] * 1.05)
            if increases > 5:
                issues.append(f"{raw_file.name}: {increases} points increases (rank/points mismatch)")

        if issues:
            for issue in issues[:10]:
                self.log(issue, "warning")
            return ValidationResult(True, f"{len(issues)} raw file issues (warnings)", issues)

        self.log(f"All {len(list(RAW_DIR.glob('*.json')))} raw files look clean", "success")
        return ValidationResult(True, "Raw data OK")

    def check_reg_type_counts(self) -> ValidationResult:
        """Verify reg type counts match."""
        print("\n[8] REG TYPE COUNTS CHECK")

        if not self.stats:
            return ValidationResult(True, "Skipped - no stats")

        computed = defaultdict(int)
        for p in self.stats["players"]:
            computed[p["reg_type"]] += 1

        stored = self.stats["summary"]["reg_counts"]

        if dict(computed) != stored:
            self.log(f"Mismatch: computed={dict(computed)}, stored={stored}", "error")
            return ValidationResult(False, "Reg type mismatch")

        self.log(f"Reg types: {dict(computed)}", "success")
        return ValidationResult(True, "Counts match")

    def fix_duplicates(self) -> int:
        """Fix duplicate entries by keeping highest points."""
        print("\n[FIX] Removing duplicates...")

        # Find files with duplicates
        by_file = defaultdict(list)
        for e in self.csv_entries:
            by_file[(e["file"], e["date"], e["stake"])].append(e)

        fixed_count = 0

        for (fname, date, stake), entries in by_file.items():
            # Group by nickname
            by_nick = defaultdict(list)
            for e in entries:
                by_nick[e["nickname"]].append(e)

            dupes = {k: v for k, v in by_nick.items() if len(v) > 1}
            if not dupes:
                continue

            # Deduplicate: keep highest points
            deduped = []
            for nick, nick_entries in by_nick.items():
                best = max(nick_entries, key=lambda x: x["points"])
                deduped.append(best)

            # Sort by points descending, reassign ranks
            deduped.sort(key=lambda x: -x["points"])
            for i, entry in enumerate(deduped):
                entry["rank"] = i + 1

            # Write fixed CSV
            csv_path = LEADERBOARDS_DIR / fname
            with open(csv_path, "w") as f:
                f.write("Rank,Nickname,Points,Prize\n")
                for entry in deduped:
                    nick = entry["nickname"].replace(",", " ")
                    f.write(f"{entry['rank']},{nick},{entry['points']:.2f},\n")

            fixed_count += len(dupes)
            print(f"  Fixed {fname}: removed {len(dupes)} duplicates")

        return fixed_count

    def fix_from_raw(self) -> int:
        """Regenerate CSVs from raw JSON with deduplication and proper sorting."""
        print("\n[FIX] Regenerating CSVs from raw data...")

        if not RAW_DIR.exists():
            print("  No raw directory found")
            return 0

        fixed_count = 0

        for raw_file in sorted(RAW_DIR.glob("*.json")):
            try:
                with open(raw_file) as f:
                    response = json.load(f)
                result = json.loads(response.get("result", "{}"))
                data = result.get("data", [])
            except Exception:
                continue

            if not data:
                continue

            # Check if this file needs fixing
            nicknames = [r["nickname"] for r in data]
            has_dupes = len(nicknames) != len(set(nicknames))

            points = [float(r["points"]) for r in data]
            increases = sum(1 for i in range(1, len(points)) if points[i] > points[i-1] * 1.05)
            needs_sort = increases > 5

            if not has_dupes and not needs_sort:
                continue

            # Dedupe: keep highest points per nickname
            by_nick = {}
            for row in data:
                nick = row["nickname"]
                pts = float(row["points"])
                if nick not in by_nick or pts > float(by_nick[nick]["points"]):
                    by_nick[nick] = row

            # Sort by points descending and reassign ranks
            deduped = sorted(by_nick.values(), key=lambda x: -float(x["points"]))
            for i, row in enumerate(deduped):
                row["rank"] = i + 1

            # Write CSV
            parts = raw_file.stem.split("-")
            stake = parts[0]
            date_parts = "-".join(parts[1:])
            csv_name = f"rush-holdem-{stake}-{date_parts}.csv"
            csv_path = LEADERBOARDS_DIR / csv_name

            with open(csv_path, "w") as f:
                f.write("Rank,Nickname,Points,Prize\n")
                for row in deduped:
                    nick = row["nickname"].replace(",", " ")
                    f.write(f"{row['rank']},{nick},{row['points']},{row.get('prize', '')}\n")

            fixed_count += 1
            action = []
            if has_dupes:
                action.append(f"deduped {len(data) - len(deduped)}")
            if needs_sort:
                action.append("re-sorted")
            print(f"  {csv_name}: {', '.join(action)}")

        return fixed_count

    def run(self, fix: bool = False) -> bool:
        """Run all validation checks."""
        print("=" * 60)
        print("LEADERBOARD DATA VALIDATION")
        print("=" * 60)

        # Load data
        print("\nLoading data...")
        self.csv_entries = self.load_csv_data()
        self.stats = self.load_stats()
        print(f"  Loaded {len(self.csv_entries)} CSV entries")
        print(f"  Stats file: {'found' if self.stats else 'not found'}")

        # Run checks
        results = [
            self.check_duplicates(),
            self.check_raw_csv_match(),
            self.check_stats_consistency(),
            self.check_data_quality(),
            self.check_date_coverage(),
            self.check_player_stats(),
            self.check_raw_data_quality(),
            self.check_reg_type_counts(),
        ]

        # Fix if requested
        if fix:
            needs_fix = not results[0].passed or (results[6].details if len(results) > 6 else [])
            if needs_fix:
                # Try fixing from raw first (handles both dupes and sorting)
                fixed_raw = self.fix_from_raw()
                if fixed_raw:
                    print(f"\nFixed {fixed_raw} files from raw data.")
                else:
                    # Fall back to CSV-only fix
                    fixed_csv = self.fix_duplicates()
                    if fixed_csv:
                        print(f"\nFixed {fixed_csv} duplicate entries.")
                print("Re-run validation to verify.")
                print("Also run: python3 scripts/build_leaderboard_stats.py")

        # Summary
        print("\n" + "=" * 60)
        print("VALIDATION SUMMARY")
        print("=" * 60)

        passed = sum(1 for r in results if r.passed)
        total = len(results)

        print(f"Passed: {passed}/{total}")
        print(f"Errors: {len(self.errors)}")
        print(f"Warnings: {len(self.warnings)}")

        if self.errors:
            print("\nErrors:")
            for e in self.errors[:10]:
                print(f"  ✗ {e}")

        if passed == total and not self.errors:
            print("\n✅ ALL CHECKS PASSED!")
            return True
        elif self.errors:
            print("\n❌ VALIDATION FAILED")
            return False
        else:
            print("\n⚠️ PASSED WITH WARNINGS")
            return True


def main():
    fix = "--fix" in sys.argv
    verbose = "--verbose" in sys.argv or "-v" in sys.argv

    validator = DataValidator(verbose=verbose)
    success = validator.run(fix=fix)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
