#!/usr/bin/env python3
"""
Analyze leaderboard data to calculate effective rakeback in bb/100.

Outputs:
- JSON data file for the web app
- Markdown report for documentation

Includes:
- Rakeback by prize level for each (gamemode, stake)
- Score variance analysis
- Temporal patterns and anomaly detection
"""

import csv
import json
import statistics
from pathlib import Path
from collections import defaultdict
from datetime import datetime

# Stake to big blind mapping (in dollars)
STAKE_TO_BB = {
    "nl2": 0.02,
    "nl5": 0.05,
    "nl10": 0.10,
    "nl25": 0.25,
    "nl50": 0.50,
    "nl100": 1.00,
    "nl200": 2.00,
    "nl500": 5.00,
    "nl1000": 10.00,
    "nl2000": 20.00,
}

# Points per hand by game type (base rate, no happy hour)
PTS_PER_HAND = {
    "rush": 1.50,
    "regular": 0.48,
    "9max": 0.48,
}

# Max happy hour bonus (Rush only): 4 tables × 220 hands/hr × 2 hours × 1.5 pts/hand
MAX_HH_BONUS = 2640


def parse_csv_files(leaderboards_dir: Path) -> list[dict]:
    """Parse all CSV files and return list of entries."""
    entries = []

    for csv_file in leaderboards_dir.glob("*.csv"):
        # Skip non-leaderboard files
        if csv_file.stem in ("stats",):
            continue

        # Parse filename
        parts = csv_file.stem.split("-")

        if len(parts) >= 6 and parts[0] == "rush":
            # rush-holdem-nl25-2026-01-18
            game_type = "rush"
            stake = parts[2]
            date_str = f"{parts[3]}-{parts[4]}-{parts[5]}"
        elif len(parts) >= 5 and parts[0] == "holdem9max":
            # holdem9max-nl25-2026-01-18
            game_type = "9max"
            stake = parts[1]
            date_str = f"{parts[2]}-{parts[3]}-{parts[4]}"
        elif len(parts) >= 5 and parts[0] == "holdem":
            # holdem-nl25-2026-01-18
            game_type = "regular"
            stake = parts[1]
            date_str = f"{parts[2]}-{parts[3]}-{parts[4]}"
        else:
            continue

        if stake not in STAKE_TO_BB:
            continue

        with open(csv_file, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    rank = int(row.get("Rank", 0))
                    points = float(row.get("Points", 0) or 0)
                    prize = float(row.get("Prize", 0) or 0)

                    if rank > 0 and prize > 0:
                        entries.append({
                            "date": date_str,
                            "game_type": game_type,
                            "stake": stake,
                            "rank": rank,
                            "points": points,
                            "prize": prize,
                        })
                except (ValueError, KeyError):
                    continue

    return entries


def calculate_hands(points: float, game_type: str, max_hh: bool = False) -> int:
    """
    Calculate hands needed to earn given points.

    For Rush with max HH: hands = (points - 2640) / 1.5
    Otherwise: hands = points / pts_per_hand
    """
    base_rate = PTS_PER_HAND[game_type]

    if game_type == "rush" and max_hh:
        # Subtract max HH bonus, then divide by base rate
        adjusted_points = max(0, points - MAX_HH_BONUS)
        return int(adjusted_points / base_rate)
    else:
        return int(points / base_rate)


def calculate_rakeback_bb100(prize: float, hands: int, stake: str) -> float:
    """Calculate rakeback in bb/100."""
    if hands <= 0:
        return 0.0
    bb_value = STAKE_TO_BB[stake]
    prize_in_bb = prize / bb_value
    return (prize_in_bb / hands) * 100


def analyze_prize_levels(entries: list[dict]) -> dict:
    """
    Group entries by (game_type, stake, prize) and calculate statistics.
    """
    # Group by game_type -> stake -> prize
    grouped = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

    for e in entries:
        grouped[e["game_type"]][e["stake"]][e["prize"]].append(e)

    results = {}

    for game_type in sorted(grouped.keys()):
        results[game_type] = {}

        for stake in sorted(grouped[game_type].keys(), key=lambda s: STAKE_TO_BB.get(s, 0)):
            prize_stats = []

            for prize in sorted(grouped[game_type][stake].keys(), reverse=True):
                prize_entries = grouped[game_type][stake][prize]
                points_list = [e["points"] for e in prize_entries]
                ranks = [e["rank"] for e in prize_entries]

                n = len(points_list)
                avg_points = statistics.mean(points_list)
                min_points = min(points_list)
                max_points = max(points_list)
                std_points = statistics.stdev(points_list) if n > 1 else 0
                cv = (std_points / avg_points * 100) if avg_points > 0 else 0

                # Rank range
                min_rank = min(ranks)
                max_rank = max(ranks)
                rank_str = str(min_rank) if min_rank == max_rank else f"{min_rank}-{max_rank}"

                # Calculate hands and rakeback for both scenarios
                hands_no_hh = calculate_hands(avg_points, game_type, max_hh=False)
                hands_max_hh = calculate_hands(avg_points, game_type, max_hh=True)

                bb100_no_hh = calculate_rakeback_bb100(prize, hands_no_hh, stake)
                bb100_max_hh = calculate_rakeback_bb100(prize, hands_max_hh, stake)

                prize_stats.append({
                    "prize": prize,
                    "ranks": rank_str,
                    "count": n,
                    "avg_points": avg_points,
                    "min_points": min_points,
                    "max_points": max_points,
                    "std_points": std_points,
                    "cv": cv,
                    "hands_no_hh": hands_no_hh,
                    "hands_max_hh": hands_max_hh,
                    "bb100_no_hh": bb100_no_hh,
                    "bb100_max_hh": bb100_max_hh,
                })

            results[game_type][stake] = prize_stats

    return results


def analyze_temporal_patterns(entries: list[dict]) -> dict:
    """Analyze day-of-week patterns and detect anomalies for rank 1 scores."""
    # Group by game_type -> stake -> date -> entries
    by_date = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))

    for e in entries:
        by_date[e["game_type"]][e["stake"]][e["date"]].append(e)

    results = {"day_of_week": {}, "anomalies": {}}
    dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    for game_type in sorted(by_date.keys()):
        results["day_of_week"][game_type] = {}

        for stake in sorted(by_date[game_type].keys(), key=lambda s: STAKE_TO_BB.get(s, 0)):
            # Get rank 1 score for each date
            rank1_by_date = {}
            for date, date_entries in by_date[game_type][stake].items():
                rank1 = [e for e in date_entries if e["rank"] == 1]
                if rank1:
                    rank1_by_date[date] = rank1[0]["points"]

            if not rank1_by_date:
                continue

            # Day of week analysis - min/avg/max rank 1 score by day
            dow_scores = defaultdict(list)
            for date, pts in rank1_by_date.items():
                dt = datetime.strptime(date, "%Y-%m-%d")
                dow = dt.strftime("%A")
                dow_scores[dow].append(pts)

            dow_stats = []
            for dow in dow_order:
                scores = dow_scores.get(dow, [])
                if scores:
                    dow_stats.append({
                        "day": dow[:3],
                        "min": round(min(scores)),
                        "avg": round(statistics.mean(scores)),
                        "max": round(max(scores)),
                        "n": len(scores),
                    })
            results["day_of_week"][game_type][stake] = dow_stats

    # Anomaly detection (dates with unusually high/low top scores)
    for game_type in sorted(by_date.keys()):
        results["anomalies"][game_type] = {}

        for stake in sorted(by_date[game_type].keys(), key=lambda s: STAKE_TO_BB.get(s, 0)):
            # Get top score (rank 1) for each date
            top_scores = []
            for date, date_entries in by_date[game_type][stake].items():
                rank1_entries = [e for e in date_entries if e["rank"] == 1]
                if rank1_entries:
                    top_scores.append({"date": date, "points": rank1_entries[0]["points"]})

            if len(top_scores) < 7:
                continue

            points_list = [s["points"] for s in top_scores]
            mean_pts = statistics.mean(points_list)
            std_pts = statistics.stdev(points_list)

            # Flag dates > 2 std devs from mean
            anomalies = []
            for s in top_scores:
                z_score = (s["points"] - mean_pts) / std_pts if std_pts > 0 else 0
                if abs(z_score) > 2:
                    anomalies.append({
                        "date": s["date"],
                        "points": s["points"],
                        "z_score": round(z_score, 2),
                        "type": "high" if z_score > 0 else "low",
                    })

            if anomalies:
                results["anomalies"][game_type][stake] = sorted(anomalies, key=lambda x: x["date"])

    return results


def format_number(n: float) -> str:
    """Format number with K suffix for thousands."""
    if n >= 1000:
        return f"{n/1000:.1f}k"
    return f"{n:.0f}"


def generate_markdown_report(prize_analysis: dict, temporal: dict) -> str:
    """Generate the markdown report."""
    lines = [
        "# GGPoker Leaderboard Rakeback Analysis",
        "",
        "Effective rakeback in bb/100 calculated from leaderboard prize data.",
        "",
        "## Methodology",
        "",
        "```",
        "prize_in_bb = prize_usd / bb_value",
        "hands_played = points / pts_per_hand",
        "rakeback_bb100 = (prize_in_bb / hands_played) * 100",
        "```",
        "",
        "**Points per hand rates:**",
        "- Rush & Cash: 1.50 pts/hand (base)",
        "- Regular Holdem: 0.48 pts/hand",
        "- 9-max Holdem: 0.48 pts/hand",
        "",
        "**Happy Hour (Rush only):**",
        "- Max daily bonus: 2,640 pts (4 tables × 220 hands/hr × 2 hrs × 1.5 pts)",
        "- 0% HH: `hands = points / 1.5`",
        "- Max HH: `hands = (points - 2640) / 1.5`",
        "",
        "---",
        "",
    ]

    # Game type display names
    game_names = {"rush": "Rush & Cash", "regular": "Regular Holdem", "9max": "9-max Holdem"}

    # Prize level tables
    for game_type in ["rush", "regular", "9max"]:
        if game_type not in prize_analysis:
            continue

        lines.append(f"## {game_names[game_type]}")
        lines.append("")

        for stake in prize_analysis[game_type]:
            stats = prize_analysis[game_type][stake]
            if not stats:
                continue

            lines.append(f"### {stake.upper()}")
            lines.append("")

            # Header differs for Rush (has HH columns) vs Regular/9max
            if game_type == "rush":
                lines.append("| Prize | Ranks | N | Avg Pts | Range | CV% | Hands (0%HH) | bb/100 | Hands (maxHH) | bb/100 |")
                lines.append("|------:|:-----:|--:|--------:|------:|----:|-------------:|-------:|--------------:|-------:|")
            else:
                lines.append("| Prize | Ranks | N | Avg Pts | Range | CV% | Hands | bb/100 |")
                lines.append("|------:|:-----:|--:|--------:|------:|----:|------:|-------:|")

            for s in stats:
                range_str = f"{format_number(s['min_points'])}-{format_number(s['max_points'])}"

                if game_type == "rush":
                    lines.append(
                        f"| ${s['prize']:.0f} | {s['ranks']} | {s['count']} | "
                        f"{format_number(s['avg_points'])} | {range_str} | {s['cv']:.0f}% | "
                        f"{format_number(s['hands_no_hh'])} | {s['bb100_no_hh']:.2f} | "
                        f"{format_number(s['hands_max_hh'])} | {s['bb100_max_hh']:.2f} |"
                    )
                else:
                    lines.append(
                        f"| ${s['prize']:.0f} | {s['ranks']} | {s['count']} | "
                        f"{format_number(s['avg_points'])} | {range_str} | {s['cv']:.0f}% | "
                        f"{format_number(s['hands_no_hh'])} | {s['bb100_no_hh']:.2f} |"
                    )

            lines.append("")

    # Day of week patterns
    lines.append("---")
    lines.append("")
    lines.append("## Day of Week Patterns")
    lines.append("")
    lines.append("Points needed for rank 1 by day of week (min/avg/max).")
    lines.append("")

    for game_type in ["rush", "regular", "9max"]:
        if game_type not in temporal["day_of_week"]:
            continue

        lines.append(f"### {game_names[game_type]}")
        lines.append("")

        for stake in temporal["day_of_week"][game_type]:
            stats = temporal["day_of_week"][game_type][stake]
            if not stats:
                continue

            lines.append(f"**{stake.upper()}:**")
            for s in stats:
                lines.append(f"  {s['day']}: {format_number(s['min'])}-{format_number(s['avg'])}-{format_number(s['max'])}")
            lines.append("")

        lines.append("")

    # Anomalies
    lines.append("---")
    lines.append("")
    lines.append("## Anomalies Detected")
    lines.append("")
    lines.append("Dates where competition was unusually high or low (>2 std dev from mean).")
    lines.append("")

    has_anomalies = False
    for game_type in ["rush", "regular", "9max"]:
        if game_type not in temporal["anomalies"]:
            continue

        game_anomalies = temporal["anomalies"][game_type]
        if not game_anomalies:
            continue

        has_anomalies = True
        lines.append(f"### {game_names[game_type]}")
        lines.append("")

        for stake in game_anomalies:
            anomalies = game_anomalies[stake]
            lines.append(f"**{stake.upper()}:**")
            for a in anomalies:
                emoji = "📈" if a["type"] == "high" else "📉"
                lines.append(f"- {a['date']}: {format_number(a['points'])} pts (z={a['z_score']}) {emoji}")
            lines.append("")

    if not has_anomalies:
        lines.append("No significant anomalies detected.")
        lines.append("")

    # Footer
    lines.append("---")
    lines.append("")
    lines.append(f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*")

    return "\n".join(lines)


def build_json_data(prize_analysis: dict, temporal: dict) -> dict:
    """Build JSON data structure for the web app."""
    game_names = {"rush": "Rush & Cash", "regular": "Regular Holdem", "9max": "9-max Holdem"}

    data = {
        "generated_at": datetime.now().isoformat(),
        "game_types": [],
    }

    for game_type in ["rush", "regular", "9max"]:
        if game_type not in prize_analysis:
            continue

        game_data = {
            "id": game_type,
            "name": game_names[game_type],
            "has_happy_hour": game_type == "rush",
            "stakes": [],
        }

        for stake in prize_analysis[game_type]:
            stats = prize_analysis[game_type][stake]
            if not stats:
                continue

            # Find top 3 best value (highest bb/100 for 0% HH)
            sorted_by_value = sorted(stats, key=lambda x: x["bb100_no_hh"], reverse=True)
            top3_prizes = {s["prize"] for s in sorted_by_value[:3]}

            stake_data = {
                "id": stake,
                "name": stake.upper(),
                "bb_value": STAKE_TO_BB[stake],
                "prize_levels": [],
            }

            for s in stats:
                level = {
                    "prize": s["prize"],
                    "ranks": s["ranks"],
                    "min_points": round(s["min_points"]),
                    "max_points": round(s["max_points"]),
                    "hands_no_hh": s["hands_no_hh"],
                    "bb100_no_hh": round(s["bb100_no_hh"], 2),
                    "is_top_value": s["prize"] in top3_prizes,
                }

                if game_type == "rush":
                    level["hands_max_hh"] = s["hands_max_hh"]
                    level["bb100_max_hh"] = round(s["bb100_max_hh"], 2)

                stake_data["prize_levels"].append(level)

            game_data["stakes"].append(stake_data)

        data["game_types"].append(game_data)

    # Add day of week patterns (rank 1 scores)
    data["day_of_week"] = {}
    for game_type in temporal["day_of_week"]:
        data["day_of_week"][game_type] = temporal["day_of_week"][game_type]

    # Add anomalies (unusual competition days)
    data["anomalies"] = {}
    for game_type in temporal.get("anomalies", {}):
        if temporal["anomalies"][game_type]:
            data["anomalies"][game_type] = temporal["anomalies"][game_type]

    return data


def main():
    script_dir = Path(__file__).parent
    leaderboards_dir = script_dir.parent / "leaderboards"
    markdown_file = script_dir.parent / "docs" / "LEADERBOARD_RAKEBACK.md"
    json_file = script_dir.parent / "public" / "leaderboards" / "rakeback.json"

    print(f"Loading CSVs from: {leaderboards_dir}")
    entries = parse_csv_files(leaderboards_dir)
    print(f"Loaded {len(entries)} entries")

    if not entries:
        print("No entries found!")
        return

    print("Analyzing prize levels...")
    prize_analysis = analyze_prize_levels(entries)

    print("Analyzing temporal patterns...")
    temporal = analyze_temporal_patterns(entries)

    print("Generating JSON data...")
    json_data = build_json_data(prize_analysis, temporal)
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    print(f"JSON saved to: {json_file}")

    print("Generating markdown report...")
    report = generate_markdown_report(prize_analysis, temporal)
    markdown_file.write_text(report)
    print(f"Markdown saved to: {markdown_file}")

    # Print summary
    total_stakes = sum(len(stakes) for stakes in prize_analysis.values())
    print(f"\nSummary:")
    print(f"  Game types: {', '.join(prize_analysis.keys())}")
    print(f"  Total stake/game combinations: {total_stakes}")


if __name__ == "__main__":
    main()
