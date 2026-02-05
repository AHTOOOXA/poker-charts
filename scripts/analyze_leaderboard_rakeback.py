#!/usr/bin/env python3
"""
Analyze leaderboard data to calculate effective rakeback in bb/100.

Outputs:
- JSON data file for the web app
- Markdown report for documentation

Includes:
- Points distribution per prize tier (for swarm plot visualization)
- Hands and bb/100 calculations (with and without Happy Hour)
- Day-of-week variance analysis
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

# Holiday dates to exclude from day-of-week analysis
HOLIDAYS = {
    '2025-12-24', '2025-12-25', '2025-12-26',  # Christmas
    '2025-12-31', '2026-01-01', '2026-01-02',  # New Year
    '2026-01-06',  # Epiphany
}


def parse_csv_files(leaderboards_dir: Path) -> list[dict]:
    """Parse all CSV files and return list of entries."""
    entries = []

    for csv_file in leaderboards_dir.glob("*.csv"):
        if csv_file.stem in ("stats",):
            continue

        parts = csv_file.stem.split("-")

        if len(parts) >= 6 and parts[0] == "rush":
            game_type = "rush"
            stake = parts[2]
            date_str = f"{parts[3]}-{parts[4]}-{parts[5]}"
        elif len(parts) >= 5 and parts[0] == "holdem9max":
            game_type = "9max"
            stake = parts[1]
            date_str = f"{parts[2]}-{parts[3]}-{parts[4]}"
        elif len(parts) >= 5 and parts[0] == "holdem":
            game_type = "regular"
            stake = parts[1]
            date_str = f"{parts[2]}-{parts[3]}-{parts[4]}"
        else:
            continue

        if stake not in STAKE_TO_BB:
            continue

        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            dow = dt.strftime("%a")
        except ValueError:
            continue

        is_holiday = date_str in HOLIDAYS

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
                            "dow": dow,
                            "is_holiday": is_holiday,
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
    """Calculate hands needed to earn given points."""
    base_rate = PTS_PER_HAND[game_type]

    if game_type == "rush" and max_hh:
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


def percentile(sorted_list: list, p: float) -> float:
    """Calculate percentile from sorted list."""
    if not sorted_list:
        return 0
    k = (len(sorted_list) - 1) * p
    f = int(k)
    c = f + 1 if f + 1 < len(sorted_list) else f
    return sorted_list[f] + (sorted_list[c] - sorted_list[f]) * (k - f)


def analyze_prize_levels(entries: list[dict]) -> dict:
    """
    Group entries by (game_type, stake, prize) and calculate statistics.

    For each prize tier, we track the MINIMUM score needed to win that prize
    (i.e., the cutoff - the lowest-scoring person who still won that prize each day).
    """
    # Group by game_type -> stake -> prize -> date -> entries
    grouped = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: defaultdict(list))))

    for e in entries:
        grouped[e["game_type"]][e["stake"]][e["prize"]][e["date"]].append(e)

    results = {}

    for game_type in sorted(grouped.keys()):
        results[game_type] = {}

        for stake in sorted(grouped[game_type].keys(), key=lambda s: STAKE_TO_BB.get(s, 0)):
            prize_stats = []

            for prize in sorted(grouped[game_type][stake].keys(), reverse=True):
                # For each day, find the MINIMUM score that won this prize
                # (the cutoff - lowest rank in this prize tier)
                daily_minimums = []
                all_ranks = []

                for date, day_entries in grouped[game_type][stake][prize].items():
                    # Find the entry with the highest rank (lowest placement) for this prize
                    # That person had the minimum score needed to win this prize
                    min_score_entry = max(day_entries, key=lambda e: e["rank"])
                    daily_minimums.append(min_score_entry["points"])
                    all_ranks.extend([e["rank"] for e in day_entries])

                n = len(daily_minimums)
                if n < 2:
                    continue

                points_list = sorted(daily_minimums)

                # Calculate percentiles for distribution of daily minimums
                p_min = min(points_list)
                p25 = percentile(points_list, 0.25)
                p50 = percentile(points_list, 0.50)  # median
                p75 = percentile(points_list, 0.75)
                p_max = max(points_list)

                # Rank range
                min_rank = min(all_ranks)
                max_rank = max(all_ranks)
                rank_str = str(min_rank) if min_rank == max_rank else f"{min_rank}-{max_rank}"

                # Calculate hands and rakeback using median
                hands_no_hh = calculate_hands(p50, game_type, max_hh=False)
                hands_max_hh = calculate_hands(p50, game_type, max_hh=True)

                bb100_no_hh = calculate_rakeback_bb100(prize, hands_no_hh, stake)
                bb100_max_hh = calculate_rakeback_bb100(prize, hands_max_hh, stake)

                prize_stats.append({
                    "prize": prize,
                    "ranks": rank_str,
                    "count": n,
                    # Distribution of daily minimum scores (cutoffs)
                    "distribution": {
                        "min": round(p_min),
                        "p25": round(p25),
                        "median": round(p50),
                        "p75": round(p75),
                        "max": round(p_max),
                    },
                    # Calculated metrics
                    "hands_no_hh": hands_no_hh,
                    "hands_max_hh": hands_max_hh,
                    "bb100_no_hh": bb100_no_hh,
                    "bb100_max_hh": bb100_max_hh,
                })

            results[game_type][stake] = prize_stats

    return results


def analyze_day_of_week(entries: list[dict]) -> dict:
    """
    Analyze day-of-week patterns for rank 1 across stakes.
    Returns summary for the disclaimer.
    """
    # Filter out holidays for cleaner day-of-week analysis
    non_holiday = [e for e in entries if not e["is_holiday"]]

    # Weight by stake (lower stakes = bigger pools = more weight)
    stake_weights = {
        'nl2': 5, 'nl5': 4, 'nl10': 3, 'nl25': 2,
        'nl50': 1, 'nl100': 0.5, 'nl200': 0.25,
    }

    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    results = {}

    for game_type in ['rush', 'regular', '9max']:
        game_entries = [e for e in non_holiday if e['game_type'] == game_type]
        if not game_entries:
            continue

        # Collect weighted rankings
        weighted_rankings = defaultdict(list)

        stakes = set(e['stake'] for e in game_entries)
        for stake in stakes:
            weight = stake_weights.get(stake, 1)
            stake_entries = [e for e in game_entries if e['stake'] == stake]

            # Get top 3 prize tiers
            top_prizes = sorted(set(e['prize'] for e in stake_entries), reverse=True)[:3]

            for prize in top_prizes:
                prize_entries = [e for e in stake_entries if e['prize'] == prize]

                by_day = defaultdict(list)
                for e in prize_entries:
                    by_day[e['dow']].append(e['points'])

                day_medians = {
                    day: statistics.median(pts)
                    for day, pts in by_day.items()
                    if len(pts) >= 2
                }

                if len(day_medians) >= 5:
                    sorted_days = sorted(day_medians.keys(), key=lambda d: day_medians[d])
                    for rank, day in enumerate(sorted_days, 1):
                        weighted_rankings[day].append((rank, weight))

        # Calculate weighted average rank per day
        day_scores = {}
        for day in days:
            entries_for_day = weighted_rankings.get(day, [])
            if entries_for_day:
                weighted_sum = sum(rank * weight for rank, weight in entries_for_day)
                total_weight = sum(weight for _, weight in entries_for_day)
                day_scores[day] = weighted_sum / total_weight

        if day_scores:
            sorted_days = sorted(day_scores.keys(), key=lambda d: day_scores[d])
            easiest = sorted_days[0]
            hardest = sorted_days[-1]

            # Calculate variance percentage
            if easiest in day_scores and hardest in day_scores:
                # Get actual point difference for top prizes
                variance_samples = []
                for stake in stakes:
                    stake_entries = [e for e in game_entries if e['stake'] == stake]
                    top_prize = max(e['prize'] for e in stake_entries)
                    prize_entries = [e for e in stake_entries if e['prize'] == top_prize]

                    by_day = defaultdict(list)
                    for e in prize_entries:
                        by_day[e['dow']].append(e['points'])

                    if easiest in by_day and hardest in by_day:
                        easy_med = statistics.median(by_day[easiest])
                        hard_med = statistics.median(by_day[hardest])
                        if easy_med > 0:
                            variance_samples.append((hard_med - easy_med) / easy_med * 100)

                # Use median of absolute variances to avoid cancellation
                avg_variance = statistics.median([abs(v) for v in variance_samples]) if variance_samples else 15
            else:
                avg_variance = 15

            results[game_type] = {
                "easiest_day": easiest,
                "hardest_day": hardest,
                "variance_pct": round(avg_variance),
                "day_scores": {day: round(score, 2) for day, score in day_scores.items()},
            }

    return results


def build_json_data(prize_analysis: dict, dow_analysis: dict) -> dict:
    """Build JSON data structure for the web app."""
    game_names = {"rush": "Rush & Cash", "regular": "Regular Holdem", "9max": "9-max Holdem"}

    data = {
        "generated_at": datetime.now().isoformat(),
        "day_of_week": dow_analysis,
        "game_types": [],
    }

    for game_type in ["rush", "regular", "9max"]:
        if game_type not in prize_analysis:
            continue

        game_data = {
            "id": game_type,
            "name": game_names[game_type],
            "has_happy_hour": game_type == "rush",
            "pts_per_hand": PTS_PER_HAND[game_type],
            "stakes": [],
        }

        for stake in prize_analysis[game_type]:
            stats = prize_analysis[game_type][stake]
            if not stats:
                continue

            # Find top 3 best value (highest bb/100)
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
                    "distribution": s["distribution"],
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

    return data


def format_number(n: float) -> str:
    """Format number with K suffix for thousands."""
    if n >= 1000:
        return f"{n/1000:.1f}k"
    return f"{n:.0f}"


def generate_markdown_report(prize_analysis: dict, dow_analysis: dict) -> str:
    """Generate the markdown report."""
    lines = [
        "# GGPoker Leaderboard Rakeback Analysis",
        "",
        "Effective rakeback in bb/100 calculated from leaderboard prize data.",
        "",
        "## Day of Week Patterns",
        "",
    ]

    for game_type, dow_data in dow_analysis.items():
        game_names = {"rush": "Rush & Cash", "regular": "Regular Holdem", "9max": "9-max Holdem"}
        lines.append(f"**{game_names.get(game_type, game_type)}:** "
                    f"{dow_data['easiest_day']} is easiest, "
                    f"{dow_data['hardest_day']} is hardest "
                    f"(~{dow_data['variance_pct']}% variance)")

    lines.extend([
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
        "",
        "---",
        "",
    ])

    game_names = {"rush": "Rush & Cash", "regular": "Regular Holdem", "9max": "9-max Holdem"}

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

            if game_type == "rush":
                lines.append("| Prize | Ranks | Points (p25-med-p75) | Hands | bb/100 | HH Hands | HH bb/100 |")
                lines.append("|------:|:-----:|---------------------:|------:|-------:|---------:|----------:|")
            else:
                lines.append("| Prize | Ranks | Points (p25-med-p75) | Hands | bb/100 |")
                lines.append("|------:|:-----:|---------------------:|------:|-------:|")

            for s in stats:
                d = s["distribution"]
                pts_str = f"{format_number(d['p25'])}-{format_number(d['median'])}-{format_number(d['p75'])}"

                if game_type == "rush":
                    lines.append(
                        f"| ${s['prize']:.0f} | {s['ranks']} | {pts_str} | "
                        f"{format_number(s['hands_no_hh'])} | {s['bb100_no_hh']:.2f} | "
                        f"{format_number(s['hands_max_hh'])} | {s['bb100_max_hh']:.2f} |"
                    )
                else:
                    lines.append(
                        f"| ${s['prize']:.0f} | {s['ranks']} | {pts_str} | "
                        f"{format_number(s['hands_no_hh'])} | {s['bb100_no_hh']:.2f} |"
                    )

            lines.append("")

    lines.append("---")
    lines.append("")
    lines.append(f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}*")

    return "\n".join(lines)


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

    print("Analyzing day-of-week patterns...")
    dow_analysis = analyze_day_of_week(entries)

    print("Generating JSON data...")
    json_data = build_json_data(prize_analysis, dow_analysis)
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    print(f"JSON saved to: {json_file}")

    print("Generating markdown report...")
    report = generate_markdown_report(prize_analysis, dow_analysis)
    markdown_file.write_text(report)
    print(f"Markdown saved to: {markdown_file}")

    # Print summary
    print(f"\nDay of Week Summary:")
    for game, data in dow_analysis.items():
        print(f"  {game}: {data['easiest_day']} (easiest) → {data['hardest_day']} (hardest), ~{data['variance_pct']}% variance")


if __name__ == "__main__":
    main()
