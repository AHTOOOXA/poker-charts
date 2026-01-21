#!/usr/bin/env python3
"""Analyze player data to find meaningful classification thresholds."""

import json
from pathlib import Path
from collections import Counter
import math

def load_data():
    stats_file = Path(__file__).parent.parent / "leaderboards" / "stats.json"
    with open(stats_file) as f:
        return json.load(f)

def percentiles(values: list, pcts: list[int]) -> dict:
    """Calculate percentiles for a list of values."""
    sorted_vals = sorted(values)
    n = len(sorted_vals)
    result = {}
    for p in pcts:
        idx = int((p / 100) * n)
        idx = min(idx, n - 1)
        result[f"p{p}"] = sorted_vals[idx]
    return result

def histogram(values: list, bins: list) -> dict:
    """Count values falling into bins."""
    counts = {f"<{bins[0]}": 0}
    for i in range(len(bins) - 1):
        counts[f"{bins[i]}-{bins[i+1]}"] = 0
    counts[f">{bins[-1]}"] = 0

    for v in values:
        if v < bins[0]:
            counts[f"<{bins[0]}"] += 1
        elif v > bins[-1]:
            counts[f">{bins[-1]}"] += 1
        else:
            for i in range(len(bins) - 1):
                if bins[i] <= v <= bins[i+1]:
                    counts[f"{bins[i]}-{bins[i+1]}"] += 1
                    break
    return counts

def correlation(x: list, y: list) -> float:
    """Pearson correlation coefficient."""
    n = len(x)
    mean_x = sum(x) / n
    mean_y = sum(y) / n

    num = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
    den_x = math.sqrt(sum((xi - mean_x) ** 2 for xi in x))
    den_y = math.sqrt(sum((yi - mean_y) ** 2 for yi in y))

    if den_x * den_y == 0:
        return 0
    return num / (den_x * den_y)

def main():
    data = load_data()
    players = data["players"]
    summary = data["summary"]

    print("=" * 60)
    print("PLAYER DATA ANALYSIS")
    print("=" * 60)
    print(f"Total players: {len(players)}")
    print(f"Date range: {summary['dates_covered'][0]} to {summary['dates_covered'][-1]}")
    print(f"Total days in dataset: {len(summary['dates_covered'])}")
    print()

    # Extract metrics
    days_active = [p["days_active"] for p in players]
    entries = [p["entries"] for p in players]
    activity_rate = [p["activity_rate"] for p in players]
    entries_per_day = [p["entries_per_day"] for p in players]
    current_streak = [p["current_streak"] for p in players]
    longest_streak = [p["longest_streak"] for p in players]
    stake_count = [p["stake_count"] for p in players]

    # 1. DAYS ACTIVE DISTRIBUTION
    print("-" * 60)
    print("1. DAYS ACTIVE (out of 20 possible)")
    print("-" * 60)
    pcts = percentiles(days_active, [10, 25, 50, 75, 90, 95, 99])
    print(f"   Min: {min(days_active)}, Max: {max(days_active)}, Mean: {sum(days_active)/len(days_active):.1f}")
    print(f"   Percentiles: {pcts}")

    hist = histogram(days_active, [1, 3, 5, 7, 10, 15, 20])
    print(f"   Distribution: {hist}")
    print()

    # 2. ENTRIES DISTRIBUTION
    print("-" * 60)
    print("2. TOTAL ENTRIES")
    print("-" * 60)
    pcts = percentiles(entries, [10, 25, 50, 75, 90, 95, 99])
    print(f"   Min: {min(entries)}, Max: {max(entries)}, Mean: {sum(entries)/len(entries):.1f}")
    print(f"   Percentiles: {pcts}")

    hist = histogram(entries, [1, 3, 5, 10, 20, 30, 50])
    print(f"   Distribution: {hist}")
    print()

    # 3. ACTIVITY RATE DISTRIBUTION
    print("-" * 60)
    print("3. ACTIVITY RATE (days_active / days_since_first_seen)")
    print("-" * 60)
    pcts = percentiles(activity_rate, [10, 25, 50, 75, 90, 95, 99])
    print(f"   Min: {min(activity_rate)}, Max: {max(activity_rate)}, Mean: {sum(activity_rate)/len(activity_rate):.2f}")
    print(f"   Percentiles: {pcts}")

    hist = histogram(activity_rate, [0.1, 0.25, 0.5, 0.75, 0.9, 1.0])
    print(f"   Distribution: {hist}")
    print()

    # 4. ENTRIES PER DAY
    print("-" * 60)
    print("4. ENTRIES PER ACTIVE DAY")
    print("-" * 60)
    pcts = percentiles(entries_per_day, [10, 25, 50, 75, 90, 95, 99])
    print(f"   Min: {min(entries_per_day)}, Max: {max(entries_per_day)}, Mean: {sum(entries_per_day)/len(entries_per_day):.1f}")
    print(f"   Percentiles: {pcts}")

    hist = histogram(entries_per_day, [1, 1.5, 2, 3, 4, 5])
    print(f"   Distribution: {hist}")
    print()

    # 5. STREAK ANALYSIS
    print("-" * 60)
    print("5. CURRENT STREAK (consecutive days ending at last_seen)")
    print("-" * 60)
    pcts = percentiles(current_streak, [10, 25, 50, 75, 90, 95, 99])
    print(f"   Min: {min(current_streak)}, Max: {max(current_streak)}, Mean: {sum(current_streak)/len(current_streak):.1f}")
    print(f"   Percentiles: {pcts}")

    hist = histogram(current_streak, [1, 2, 3, 5, 7, 10, 15])
    print(f"   Distribution: {hist}")
    print()

    print("-" * 60)
    print("6. LONGEST STREAK")
    print("-" * 60)
    pcts = percentiles(longest_streak, [10, 25, 50, 75, 90, 95, 99])
    print(f"   Min: {min(longest_streak)}, Max: {max(longest_streak)}, Mean: {sum(longest_streak)/len(longest_streak):.1f}")
    print(f"   Percentiles: {pcts}")
    print()

    # 6. STAKE COUNT
    print("-" * 60)
    print("7. STAKE COUNT (how many different stakes played)")
    print("-" * 60)
    stake_dist = Counter(stake_count)
    print(f"   Distribution: {dict(sorted(stake_dist.items()))}")
    print()

    # 7. CORRELATIONS
    print("-" * 60)
    print("8. CORRELATIONS")
    print("-" * 60)
    print(f"   days_active vs entries:        {correlation(days_active, entries):.3f}")
    print(f"   days_active vs activity_rate:  {correlation(days_active, activity_rate):.3f}")
    print(f"   days_active vs entries_per_day:{correlation(days_active, entries_per_day):.3f}")
    print(f"   entries vs entries_per_day:    {correlation(entries, entries_per_day):.3f}")
    print(f"   days_active vs longest_streak: {correlation(days_active, longest_streak):.3f}")
    print(f"   stake_count vs entries:        {correlation(stake_count, entries):.3f}")
    print()

    # 8. CROSS-TABULATION: days_active vs entries_per_day
    print("-" * 60)
    print("9. PLAYER SEGMENTS (days_active x entries_per_day)")
    print("-" * 60)

    segments = {
        "high_vol_high_freq": [],  # >= 2 epd, >= 10 days
        "high_vol_low_freq": [],   # >= 2 epd, < 10 days
        "low_vol_high_freq": [],   # < 2 epd, >= 10 days
        "low_vol_low_freq": [],    # < 2 epd, < 10 days
    }

    for p in players:
        high_vol = p["entries_per_day"] >= 2
        high_freq = p["days_active"] >= 10

        if high_vol and high_freq:
            segments["high_vol_high_freq"].append(p)
        elif high_vol and not high_freq:
            segments["high_vol_low_freq"].append(p)
        elif not high_vol and high_freq:
            segments["low_vol_high_freq"].append(p)
        else:
            segments["low_vol_low_freq"].append(p)

    for name, seg in segments.items():
        print(f"   {name}: {len(seg)} players")
        if seg:
            avg_entries = sum(p["entries"] for p in seg) / len(seg)
            avg_days = sum(p["days_active"] for p in seg) / len(seg)
            print(f"      avg entries: {avg_entries:.1f}, avg days: {avg_days:.1f}")
    print()

    # 9. RECENCY ANALYSIS
    print("-" * 60)
    print("10. RECENCY (days since last seen, from latest date)")
    print("-" * 60)

    from datetime import datetime
    latest = datetime.strptime(data["latest_date"], "%Y-%m-%d")

    days_since_last = []
    for p in players:
        last_dt = datetime.strptime(p["last_seen"], "%Y-%m-%d")
        days_since_last.append((latest - last_dt).days)

    pcts = percentiles(days_since_last, [10, 25, 50, 75, 90, 95, 99])
    print(f"   Min: {min(days_since_last)}, Max: {max(days_since_last)}, Mean: {sum(days_since_last)/len(days_since_last):.1f}")
    print(f"   Percentiles: {pcts}")

    hist = histogram(days_since_last, [0, 1, 3, 5, 7, 10, 15])
    print(f"   Distribution: {hist}")

    # How many played on the latest date?
    played_latest = sum(1 for p in players if p["last_seen"] == data["latest_date"])
    print(f"   Played on latest date ({data['latest_date']}): {played_latest} ({100*played_latest/len(players):.1f}%)")
    print()

    # 10. TOP PLAYERS DEEP DIVE
    print("-" * 60)
    print("11. TOP 20 BY ENTRIES (potential grinders)")
    print("-" * 60)
    top_by_entries = sorted(players, key=lambda p: p["entries"], reverse=True)[:20]
    print(f"   {'Nickname':<20} {'Entries':>7} {'Days':>5} {'Rate':>5} {'EPD':>5} {'Streak':>6} {'Stakes':>6}")
    for p in top_by_entries:
        print(f"   {p['nickname']:<20} {p['entries']:>7} {p['days_active']:>5} {p['activity_rate']:>5.0%} {p['entries_per_day']:>5.1f} {p['current_streak']:>6} {p['stake_count']:>6}")
    print()

    # 11. SINGLE-DAY PLAYERS
    print("-" * 60)
    print("12. SINGLE-DAY PLAYERS ANALYSIS")
    print("-" * 60)
    single_day = [p for p in players if p["days_active"] == 1]
    print(f"   Count: {len(single_day)} ({100*len(single_day)/len(players):.1f}% of all players)")

    # When did they play?
    single_day_dates = Counter()
    for p in single_day:
        single_day_dates[p["first_seen"]] += 1

    print(f"   By date (showing dates with 10+ single-day players):")
    for date, count in sorted(single_day_dates.items()):
        if count >= 10:
            print(f"      {date}: {count}")
    print()

    # 12. CURRENT REG_TYPE BREAKDOWN WITH STATS
    print("-" * 60)
    print("13. CURRENT REG_TYPE CLASSIFICATION STATS")
    print("-" * 60)

    for reg_type in ["grinder", "casual", "new", "inactive"]:
        group = [p for p in players if p["reg_type"] == reg_type]
        if not group:
            continue

        print(f"\n   {reg_type.upper()} ({len(group)} players):")

        g_days = [p["days_active"] for p in group]
        g_entries = [p["entries"] for p in group]
        g_rate = [p["activity_rate"] for p in group]
        g_epd = [p["entries_per_day"] for p in group]

        print(f"      days_active:    min={min(g_days)}, max={max(g_days)}, mean={sum(g_days)/len(g_days):.1f}")
        print(f"      entries:        min={min(g_entries)}, max={max(g_entries)}, mean={sum(g_entries)/len(g_entries):.1f}")
        print(f"      activity_rate:  min={min(g_rate):.2f}, max={max(g_rate):.2f}, mean={sum(g_rate)/len(g_rate):.2f}")
        print(f"      entries_per_day:min={min(g_epd):.1f}, max={max(g_epd):.1f}, mean={sum(g_epd)/len(g_epd):.1f}")


if __name__ == "__main__":
    main()
