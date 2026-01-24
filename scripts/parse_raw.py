#!/usr/bin/env python3
"""
Parse raw JSON leaderboard files into CSV.
Validates stake matches filename and data quality.

Usage: python3 parse_raw.py [--check-only]
"""

import json
import sys
from pathlib import Path

RAW_DIR = Path(__file__).parent.parent / "leaderboards" / "raw"
OUT_DIR = Path(__file__).parent.parent / "leaderboards"

# Expected blinds for each stake
STAKE_BLINDS = {
    "nl10": "$0.05/$0.10",
    "nl25": "$0.10/$0.25",
    "nl50": "$0.25/$0.50",
    "nl100": "$0.50/$1",
    "nl200": "$1/$2",
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


def validate_file(parsed: dict) -> list[str]:
    """Validate parsed data, return list of issues."""
    issues = []

    if "error" in parsed:
        issues.append(f"Parse error: {parsed['error']}")
        return issues

    # Check stake matches filename
    filename_stake = parsed["file"].split("-")[0]  # nl10-2026-01-15.json -> nl10
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


def main():
    check_only = "--check-only" in sys.argv

    if not RAW_DIR.exists():
        print(f"Raw directory not found: {RAW_DIR}")
        sys.exit(1)

    raw_files = sorted(RAW_DIR.glob("*.json"))
    if not raw_files:
        print(f"No JSON files found in {RAW_DIR}")
        sys.exit(1)

    print(f"Found {len(raw_files)} raw files in {RAW_DIR}\n")

    valid = 0
    invalid = 0
    converted = 0

    for filepath in raw_files:
        parsed = parse_raw_file(filepath)
        issues = validate_file(parsed)

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
                # nl10-2026-01-15.json -> rush-holdem-nl10-2026-01-15.csv
                parts = filepath.stem.split("-")
                stake = parts[0]
                date_parts = "-".join(parts[1:])
                csv_name = f"rush-holdem-{stake}-{date_parts}.csv"
                csv_path = OUT_DIR / csv_name

                if convert_to_csv(parsed, csv_path):
                    print(f"    → {csv_name}")
                    converted += 1

    print(f"\n{'='*50}")
    print(f"Valid: {valid} | Invalid: {invalid} | Total: {len(raw_files)}")

    if not check_only:
        print(f"Converted: {converted} CSV files to {OUT_DIR}")
    else:
        print("(check-only mode, no files written)")


if __name__ == "__main__":
    main()
