#!/usr/bin/env python3
"""
Build aggregated leaderboard stats from CSV files.

Outputs a JSON file with:
- All-time top winners by total prize money
- All-time top winners by total points
- Player entry counts and averages
- Daily leaderboard summaries
"""

import csv
import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime


def parse_csv_files(leaderboards_dir: Path) -> list[dict]:
    """Parse all CSV files and return list of entries."""
    entries = []

    for csv_file in leaderboards_dir.glob("holdem-*.csv"):
        # Parse filename: holdem-nl25-2026-01-18.csv
        parts = csv_file.stem.split("-")
        if len(parts) >= 5:
            stake = parts[1]  # nl25
            year = parts[2]   # 2026
            month = parts[3]  # 01
            day = parts[4]    # 18
            date_str = f"{year}-{month}-{day}"
        else:
            continue

        with open(csv_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    rank = int(row.get("Rank", 0))
                    nickname = row.get("Nickname", "").strip()
                    points = float(row.get("Points", 0) or 0)
                    prize = float(row.get("Prize", 0) or 0)

                    if nickname and rank > 0:
                        entries.append({
                            "date": date_str,
                            "stake": stake,
                            "rank": rank,
                            "nickname": nickname,
                            "points": points,
                            "prize": prize,
                            "file": csv_file.name
                        })
                except (ValueError, KeyError):
                    continue

    return entries


def classify_reg_type(days_active: int, entries: int, days_since_last: int, days_since_first: int) -> str:
    """
    Classify player based on volume (entries) + consistency (days_active).

    See docs/PLAYER_CLASSIFICATION.md for detailed rationale.
    """
    # Inactive: haven't played in 10+ days
    if days_since_last >= 10:
        return "inactive"

    # Grinder: high volume + high consistency
    if entries >= 20 and days_active >= 7:
        return "grinder"
    if entries >= 10 and days_active >= 10:
        return "grinder"

    # Regular: solid presence
    if days_active >= 10:
        return "regular"
    if entries >= 10 and days_active >= 5:
        return "regular"
    if entries >= 5 and days_active >= 7:
        return "regular"

    # New: just joined, limited data
    if days_since_first <= 7 and days_active <= 2:
        return "new"

    # Casual: everyone else still active
    return "casual"


def calc_streak(dates: list[str]) -> tuple[int, int]:
    """Calculate current streak and longest streak from sorted date list."""
    if not dates:
        return 0, 0

    from datetime import datetime, timedelta

    date_objs = [datetime.strptime(d, "%Y-%m-%d") for d in dates]
    date_set = set(date_objs)

    # Longest streak
    longest = 1
    current = 1
    for i in range(1, len(date_objs)):
        if date_objs[i] - date_objs[i-1] == timedelta(days=1):
            current += 1
            longest = max(longest, current)
        elif date_objs[i] != date_objs[i-1]:  # skip duplicates
            current = 1

    # Current streak (ending at last date)
    current_streak = 1
    last = date_objs[-1]
    while last - timedelta(days=current_streak) in date_set:
        current_streak += 1

    return current_streak, longest


def build_player_stats(entries: list[dict], latest_date: str) -> list[dict]:
    """Build per-player statistics."""
    from datetime import datetime

    latest_dt = datetime.strptime(latest_date, "%Y-%m-%d")

    players = defaultdict(lambda: {
        "entries": 0,
        "total_points": 0.0,
        "stakes": defaultdict(int),
        "dates": [],
        "points_by_date": defaultdict(float),
    })

    for entry in entries:
        nick = entry["nickname"]
        p = players[nick]
        p["entries"] += 1
        p["total_points"] += entry["points"]
        p["stakes"][entry["stake"]] += 1
        p["dates"].append(entry["date"])
        p["points_by_date"][entry["date"]] += entry["points"]

    # Build final list
    # Hand estimation: 1000 regular hands + 1000 happy hour hands (x2) = 5000 points
    # Base rate = 5/3 points/hand, happy = 10/3 points/hand
    # Happy hours is 2/24 hours during downtime, ~5% of hands played then
    # Weighted avg: 0.95 * 1.667 + 0.05 * 3.333 = 1.75 points/hand
    POINTS_PER_HAND = 1.75

    result = []
    for nick, p in players.items():
        entries_count = p["entries"]
        total_points = p["total_points"]
        dates_set = sorted(set(p["dates"]))
        days_active = len(dates_set)
        stakes_dict = dict(p["stakes"])
        stakes_list = sorted(stakes_dict.keys())
        points_by_date = dict(p["points_by_date"])

        first_seen = dates_set[0] if dates_set else None
        last_seen = dates_set[-1] if dates_set else None

        # Calculate date spans
        first_dt = datetime.strptime(first_seen, "%Y-%m-%d") if first_seen else latest_dt
        last_dt = datetime.strptime(last_seen, "%Y-%m-%d") if last_seen else latest_dt

        days_since_first = (latest_dt - first_dt).days
        days_since_last = (latest_dt - last_dt).days
        date_span = days_since_first + 1  # inclusive

        # Activity metrics
        activity_rate = round(days_active / date_span, 2) if date_span > 0 else 0
        entries_per_day = round(entries_count / days_active, 1) if days_active > 0 else 0

        # Streaks
        current_streak, longest_streak = calc_streak(dates_set)

        # Primary stake (most played)
        primary_stake = max(stakes_dict, key=stakes_dict.get) if stakes_dict else None

        # Classification
        reg_type = classify_reg_type(days_active, entries_count, days_since_last, days_since_first)

        # Estimate hands from points
        estimated_hands = int(total_points / POINTS_PER_HAND)

        # Estimate hands per date for calendar display
        hands_by_date = {date: int(pts / POINTS_PER_HAND) for date, pts in points_by_date.items()}

        result.append({
            "nickname": nick,
            "entries": entries_count,
            "days_active": days_active,
            "first_seen": first_seen,
            "last_seen": last_seen,
            "activity_rate": activity_rate,
            "entries_per_day": entries_per_day,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "dates": dates_set,  # for calendar hover
            "stakes": stakes_dict,  # {stake: count} for pie chart
            "primary_stake": primary_stake,
            "stake_count": len(stakes_list),
            "reg_type": reg_type,
            "total_points": round(total_points, 0),
            "estimated_hands": estimated_hands,
            "hands_by_date": hands_by_date,
        })

    return result


def build_mega_json(leaderboards_dir: Path) -> dict:
    """Build the complete stats JSON."""
    entries = parse_csv_files(leaderboards_dir)

    if not entries:
        return {"error": "No CSV files found", "entries": 0}

    # Unique dates and stakes
    dates = sorted(set(e["date"] for e in entries))
    stakes = sorted(set(e["stake"] for e in entries))
    latest_date = dates[-1] if dates else "2026-01-01"

    players = build_player_stats(entries, latest_date)

    # Sort players by entries (volume) as default order
    players_sorted = sorted(players, key=lambda x: x["entries"], reverse=True)

    # Count reg types
    reg_counts = {"grinder": 0, "regular": 0, "casual": 0, "new": 0, "inactive": 0}
    for p in players_sorted:
        reg_counts[p["reg_type"]] += 1

    return {
        "generated_at": datetime.now().isoformat(),
        "latest_date": latest_date,
        "summary": {
            "total_entries": len(entries),
            "unique_players": len(players),
            "dates_covered": dates,
            "stakes_covered": stakes,
            "files_processed": len(set(e["file"] for e in entries)),
            "reg_counts": reg_counts
        },
        "players": players_sorted
    }


def main():
    script_dir = Path(__file__).parent
    leaderboards_dir = script_dir.parent / "leaderboards"
    output_file = leaderboards_dir / "stats.json"

    print(f"Processing CSVs from: {leaderboards_dir}")

    stats = build_mega_json(leaderboards_dir)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)

    s = stats["summary"]
    print(f"Generated: {output_file}")
    print(f"Summary:")
    print(f"  - Total entries: {s['total_entries']}")
    print(f"  - Unique players: {s['unique_players']}")
    print(f"  - Dates: {s['dates_covered'][0]} to {s['dates_covered'][-1]}")
    print(f"  - Stakes: {', '.join(s['stakes_covered'])}")

    # Show top 10 by volume
    print(f"\nTop 10 by volume:")
    for i, p in enumerate(stats["players"][:10], 1):
        print(f"  {i}. {p['nickname']:<20} {p['entries']:>3} entries, {p['days_active']:>2}d active, {p['activity_rate']:.0%} rate [{p['reg_type']}]")


if __name__ == "__main__":
    main()
