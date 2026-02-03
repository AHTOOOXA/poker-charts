#!/usr/bin/env python3
"""
Parse raw JSON leaderboard files into CSV.
Validates stake matches filename and data quality.

Usage: python3 parse_raw.py [--check-only]
"""

import json
import sys
from pathlib import Path

RAW_RUSH_DIR = Path(__file__).parent.parent / "leaderboards" / "raw"
RAW_REGULAR_DIR = Path(__file__).parent.parent / "leaderboards" / "raw-regular"
RAW_9MAX_DIR = Path(__file__).parent.parent / "leaderboards" / "raw-9max"
OUT_DIR = Path(__file__).parent.parent / "leaderboards"

# Expected blinds for each stake (rush and 6-max)
STAKE_BLINDS = {
    # Micro stakes (cash holdem)
    "nl2": "$0.01/$0.02",
    "nl5": "$0.02/$0.05",
    # Low stakes (rush + cash)
    "nl10": "$0.05/$0.10",
    "nl25": "$0.10/$0.25",
    "nl50": "$0.25/$0.50",
    "nl100": "$0.50/$1",
    "nl200": "$1/$2",
    # Mid/high stakes (cash holdem)
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

def parse_raw_file(filepath: Path) -> dict:
    """Parse a raw JSON file and return structured data."""
    try:
        with open(filepath) as f:
            response = json.load(f)

        if not response.get("success"):
            return {"error": "API call failed", "file": filepath.name}

        result = json.loads(response.get("result", "{}"))
        return {
            "file": filepath.name,
            "stake": result.get("stake", ""),
            "blinds": result.get("blinds", ""),
            "date": result.get("date", ""),
            "date_text": result.get("dateText", ""),
            "rows": result.get("rows", 0),
            "data": result.get("data", []),
        }
    except Exception as e:
        return {"error": str(e), "file": filepath.name}


def validate_file(parsed: dict, game_type: str = "regular") -> list[str]:
    """Validate parsed data, return list of issues."""
    issues = []

    if "error" in parsed:
        issues.append(f"Parse error: {parsed['error']}")
        return issues

    # Check stake matches filename
    filename_stake = parsed["file"].split("-")[0]  # nl10-2026-01-15.json -> nl10

    # Use appropriate blinds format based on game type
    if game_type == "9max":
        expected_blinds = STAKE_BLINDS_9MAX.get(filename_stake, "")
    else:
        expected_blinds = STAKE_BLINDS.get(filename_stake, "")

    if parsed["blinds"] != expected_blinds:
        issues.append(f"Stake mismatch: file={filename_stake}, displayed={parsed['blinds']}, expected={expected_blinds}")

    # Check data quality
    if parsed["rows"] < 10:
        issues.append(f"Too few rows: {parsed['rows']}")

    if parsed["rows"] == 0:
        issues.append("No data extracted")

    return issues


def convert_to_csv(parsed: dict, outpath: Path) -> bool:
    """Convert parsed data to CSV file."""
    data = parsed.get("data", [])
    if not data:
        return False

    with open(outpath, "w") as f:
        f.write("Rank,Nickname,Points,Prize\n")
        for row in sorted(data, key=lambda x: x["rank"]):
            nick = row["nickname"].replace(",", " ")
            f.write(f"{row['rank']},{nick},{row['points']},{row['prize']}\n")

    return True


def process_directory(raw_dir: Path, game_type: str, check_only: bool) -> tuple[int, int, int]:
    """Process a raw directory and return (valid, invalid, converted) counts."""
    if not raw_dir.exists():
        return 0, 0, 0

    raw_files = sorted(raw_dir.glob("*.json"))
    if not raw_files:
        return 0, 0, 0

    print(f"\n[{game_type.upper()}] Found {len(raw_files)} raw files in {raw_dir}")

    valid = 0
    invalid = 0
    converted = 0

    for filepath in raw_files:
        parsed = parse_raw_file(filepath)
        issues = validate_file(parsed, game_type)

        status = "✓" if not issues else "✗"
        print(f"{status} {parsed['file']}: {parsed.get('rows', 0)} rows, blinds={parsed.get('blinds', '?')}")

        if issues:
            for issue in issues:
                print(f"    ! {issue}")
            invalid += 1
        else:
            valid += 1

            if not check_only:
                # Convert to CSV
                # nl10-2026-01-15.json -> rush-holdem-nl10-2026-01-15.csv (rush & cash)
                # nl10-2026-01-15.json -> holdem-nl10-2026-01-15.csv (regular holdem)
                parts = filepath.stem.split("-")
                stake = parts[0]
                date_parts = "-".join(parts[1:])

                if game_type == "rush":
                    csv_name = f"rush-holdem-{stake}-{date_parts}.csv"
                elif game_type == "9max":
                    csv_name = f"holdem9max-{stake}-{date_parts}.csv"
                else:
                    csv_name = f"holdem-{stake}-{date_parts}.csv"

                csv_path = OUT_DIR / csv_name

                if convert_to_csv(parsed, csv_path):
                    print(f"    → {csv_name}")
                    converted += 1

    return valid, invalid, converted


def main():
    check_only = "--check-only" in sys.argv

    # Process rush & cash files
    rush_valid, rush_invalid, rush_converted = process_directory(RAW_RUSH_DIR, "rush", check_only)

    # Process regular holdem files
    regular_valid, regular_invalid, regular_converted = process_directory(RAW_REGULAR_DIR, "regular", check_only)

    # Process 9-max holdem files
    ninemax_valid, ninemax_invalid, ninemax_converted = process_directory(RAW_9MAX_DIR, "9max", check_only)

    total_valid = rush_valid + regular_valid + ninemax_valid
    total_invalid = rush_invalid + regular_invalid + ninemax_invalid
    total_converted = rush_converted + regular_converted + ninemax_converted
    total_files = total_valid + total_invalid

    if total_files == 0:
        print(f"No JSON files found in {RAW_RUSH_DIR}, {RAW_REGULAR_DIR}, or {RAW_9MAX_DIR}")
        sys.exit(1)

    print(f"\n{'='*50}")
    print(f"Rush & Cash:    Valid: {rush_valid} | Invalid: {rush_invalid}")
    print(f"Regular Holdem: Valid: {regular_valid} | Invalid: {regular_invalid}")
    print(f"Holdem 9-max:   Valid: {ninemax_valid} | Invalid: {ninemax_invalid}")
    print(f"Total:          Valid: {total_valid} | Invalid: {total_invalid}")

    if not check_only:
        print(f"Converted: {total_converted} CSV files to {OUT_DIR}")
    else:
        print("(check-only mode, no files written)")


if __name__ == "__main__":
    main()
