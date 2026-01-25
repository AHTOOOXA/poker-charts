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

    for csv_file in leaderboards_dir.glob("*holdem-*.csv"):
        # Parse filename: rush-holdem-nl25-2026-01-18.csv or holdem-nl25-2026-01-18.csv
        parts = csv_file.stem.split("-")
        if len(parts) >= 6 and parts[0] == "rush":
            # rush-holdem-nl25-2026-01-18
            game_type = "rush"
            stake = parts[2]  # nl25
            year = parts[3]   # 2026
            month = parts[4]  # 01
            day = parts[5]    # 18
            date_str = f"{year}-{month}-{day}"
        elif len(parts) >= 5:
            # holdem-nl25-2026-01-18
            game_type = "regular"
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
                            "game_type": game_type,
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

    def make_game_type_stats():
        return {
            "entries": 0,
            "total_points": 0.0,
            "total_prize": 0.0,
            "stakes": defaultdict(int),
            "points_by_stake": defaultdict(float),
            "ranks": [],
            "entries_list": [],  # individual entry records
        }

    players = defaultdict(lambda: {
        # Unified stats (all game types combined)
        "entries": 0,
        "total_points": 0.0,
        "total_prize": 0.0,
        "stakes": defaultdict(int),
        "points_by_stake": defaultdict(float),
        "dates": [],
        "points_by_date": defaultdict(float),
        "ranks": [],  # all placements for stats
        # Per-game-type stats
        "rush": make_game_type_stats(),
        "regular": make_game_type_stats(),
    })

    for entry in entries:
        nick = entry["nickname"]
        p = players[nick]
        game_type = entry["game_type"]
        gt = p[game_type]

        # Unified stats
        p["entries"] += 1
        p["total_points"] += entry["points"]
        p["total_prize"] += entry["prize"]
        p["stakes"][entry["stake"]] += 1
        p["points_by_stake"][entry["stake"]] += entry["points"]
        p["dates"].append(entry["date"])
        p["points_by_date"][entry["date"]] += entry["points"]
        p["ranks"].append(entry["rank"])

        # Per-game-type stats
        gt["entries"] += 1
        gt["total_points"] += entry["points"]
        gt["total_prize"] += entry["prize"]
        gt["stakes"][entry["stake"]] += 1
        gt["points_by_stake"][entry["stake"]] += entry["points"]
        gt["ranks"].append(entry["rank"])
        gt["entries_list"].append({
            "date": entry["date"],
            "stake": entry["stake"],
            "rank": entry["rank"],
            "points": entry["points"],
            "prize": entry["prize"],
        })

    # Build final list
    # Hand estimation based on real data calibration:
    # Rush & Cash: AHTOOOXA 76.5K hands = 92.7K points = 1.21 pts/hand
    # Regular Holdem: AHTOOOXA 12K hands = 5.7K points = 0.48 pts/hand
    # Regular is slower paced with different point structure
    POINTS_PER_HAND_RUSH = 1.21
    POINTS_PER_HAND_REGULAR = 0.48

    def build_game_type_output(gt_stats: dict, game_type: str) -> dict:
        """Build output for a game type (rush or regular)."""
        ranks = gt_stats["ranks"]
        total_points = gt_stats["total_points"]
        points_by_stake = dict(gt_stats["points_by_stake"])

        # Use different ratio based on game type
        pts_per_hand = POINTS_PER_HAND_RUSH if game_type == "rush" else POINTS_PER_HAND_REGULAR

        estimated_hands = int(total_points / pts_per_hand) if pts_per_hand > 0 else 0
        hands_by_stake = {stake: int(pts / pts_per_hand) for stake, pts in points_by_stake.items()} if pts_per_hand > 0 else {}

        top1 = sum(1 for r in ranks if r == 1)
        top3 = sum(1 for r in ranks if r <= 3)
        top10 = sum(1 for r in ranks if r <= 10)
        top50 = sum(1 for r in ranks if r <= 50)
        best_rank = min(ranks) if ranks else 0
        avg_rank = round(sum(ranks) / len(ranks), 1) if ranks else 0

        # Sort entries by date descending (most recent first)
        entries_list = sorted(gt_stats["entries_list"], key=lambda x: x["date"], reverse=True)

        return {
            "entries": gt_stats["entries"],
            "estimated_hands": estimated_hands,
            "total_points": round(total_points, 0),
            "total_prize": round(gt_stats["total_prize"], 2),
            "hands_by_stake": hands_by_stake,
            "top1": top1,
            "top3": top3,
            "top10": top10,
            "top50": top50,
            "best_rank": best_rank,
            "avg_rank": avg_rank,
            "entries_list": entries_list,
        }

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

        # Build game type breakdowns first (need them for unified estimates)
        rush_stats = build_game_type_output(p["rush"], "rush")
        regular_stats = build_game_type_output(p["regular"], "regular")

        # Total estimated hands = sum of both game types
        estimated_hands = rush_stats["estimated_hands"] + regular_stats["estimated_hands"]

        # Calculate weighted average pts/hand based on game type split
        rush_pts = p["rush"]["total_points"]
        regular_pts = p["regular"]["total_points"]
        if estimated_hands > 0 and total_points > 0:
            weighted_pts_per_hand = total_points / estimated_hands
        else:
            weighted_pts_per_hand = POINTS_PER_HAND_RUSH  # fallback

        # Estimate hands per date for calendar display (using weighted average)
        hands_by_date = {date: int(pts / weighted_pts_per_hand) if weighted_pts_per_hand > 0 else 0
                        for date, pts in points_by_date.items()}

        # Estimate hands per stake (sum from game type breakdowns)
        hands_by_stake = {}
        for stake in set(list(rush_stats["hands_by_stake"].keys()) + list(regular_stats["hands_by_stake"].keys())):
            hands_by_stake[stake] = rush_stats["hands_by_stake"].get(stake, 0) + regular_stats["hands_by_stake"].get(stake, 0)

        # Placement stats
        ranks = p["ranks"]
        total_prize = p["total_prize"]
        top1 = sum(1 for r in ranks if r == 1)
        top3 = sum(1 for r in ranks if r <= 3)
        top10 = sum(1 for r in ranks if r <= 10)
        top50 = sum(1 for r in ranks if r <= 50)
        best_rank = min(ranks) if ranks else 0
        avg_rank = round(sum(ranks) / len(ranks), 1) if ranks else 0

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
            "stakes": stakes_dict,  # {stake: entry_count}
            "hands_by_stake": hands_by_stake,  # {stake: estimated_hands}
            "primary_stake": primary_stake,
            "stake_count": len(stakes_list),
            "reg_type": reg_type,
            "total_points": round(total_points, 0),
            "estimated_hands": estimated_hands,
            "hands_by_date": hands_by_date,
            # Placement stats
            "top1": top1,
            "top3": top3,
            "top10": top10,
            "top50": top50,
            "best_rank": best_rank,
            "avg_rank": avg_rank,
            "total_prize": round(total_prize, 2),
            # Game type breakdowns
            "rush": rush_stats,
            "regular": regular_stats,
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
