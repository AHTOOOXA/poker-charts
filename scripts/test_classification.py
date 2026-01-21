#!/usr/bin/env python3
"""Test new classification logic against player data."""

import json
from pathlib import Path
from datetime import datetime
from collections import Counter

def load_data():
    stats_file = Path(__file__).parent.parent / "leaderboards" / "stats.json"
    with open(stats_file) as f:
        return json.load(f)


def classify_old(days_active: int, activity_rate: float, days_since_last: int, days_since_first: int) -> str:
    """Current classification logic."""
    if days_since_first <= 5 and days_active <= 3:
        return "new"
    if days_since_last > 5:
        return "inactive"
    if activity_rate >= 0.5 and days_active >= 7:
        return "grinder"
    return "casual"


def classify_new(days_active: int, entries: int, days_since_last: int, days_since_first: int) -> str:
    """New classification logic based on consistency + volume."""

    # Inactive override: haven't played in 10+ days
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


def main():
    data = load_data()
    players = data["players"]
    latest_date = datetime.strptime(data["latest_date"], "%Y-%m-%d")

    print("=" * 70)
    print("CLASSIFICATION COMPARISON: OLD vs NEW")
    print("=" * 70)
    print()

    old_counts = Counter()
    new_counts = Counter()
    transitions = Counter()

    # Classify all players
    results = []
    for p in players:
        first_dt = datetime.strptime(p["first_seen"], "%Y-%m-%d")
        last_dt = datetime.strptime(p["last_seen"], "%Y-%m-%d")
        days_since_first = (latest_date - first_dt).days
        days_since_last = (latest_date - last_dt).days

        old_type = classify_old(
            p["days_active"],
            p["activity_rate"],
            days_since_last,
            days_since_first
        )

        new_type = classify_new(
            p["days_active"],
            p["entries"],
            days_since_last,
            days_since_first
        )

        old_counts[old_type] += 1
        new_counts[new_type] += 1
        transitions[(old_type, new_type)] += 1

        results.append({
            **p,
            "old_type": old_type,
            "new_type": new_type,
            "days_since_last": days_since_last,
            "days_since_first": days_since_first,
        })

    # Summary comparison
    print("-" * 70)
    print("DISTRIBUTION COMPARISON")
    print("-" * 70)
    print(f"{'Type':<12} {'Old':>8} {'Old %':>8} {'New':>8} {'New %':>8} {'Delta':>8}")
    print("-" * 70)

    all_types = ["grinder", "regular", "casual", "new", "inactive"]
    for t in all_types:
        old = old_counts.get(t, 0)
        new = new_counts.get(t, 0)
        old_pct = 100 * old / len(players)
        new_pct = 100 * new / len(players)
        delta = new - old
        delta_str = f"+{delta}" if delta > 0 else str(delta)
        print(f"{t:<12} {old:>8} {old_pct:>7.1f}% {new:>8} {new_pct:>7.1f}% {delta_str:>8}")

    print()

    # Transition matrix
    print("-" * 70)
    print("TRANSITION MATRIX (Old → New)")
    print("-" * 70)
    header = "Old \\ New"
    print(f"{header:<12}", end="")
    for new_t in all_types:
        print(f"{new_t:>10}", end="")
    print()
    print("-" * 70)

    for old_t in ["grinder", "casual", "new", "inactive"]:
        print(f"{old_t:<12}", end="")
        for new_t in all_types:
            count = transitions.get((old_t, new_t), 0)
            print(f"{count:>10}", end="")
        print()

    print()

    # Deep dive into each new category
    print("-" * 70)
    print("NEW CLASSIFICATION STATS")
    print("-" * 70)

    for reg_type in all_types:
        group = [r for r in results if r["new_type"] == reg_type]
        if not group:
            continue

        print(f"\n{reg_type.upper()} ({len(group)} players, {100*len(group)/len(players):.1f}%):")

        days = [p["days_active"] for p in group]
        entries = [p["entries"] for p in group]
        rate = [p["activity_rate"] for p in group]

        print(f"  days_active:   min={min(days):>2}, max={max(days):>2}, mean={sum(days)/len(days):>5.1f}, median={sorted(days)[len(days)//2]:>2}")
        print(f"  entries:       min={min(entries):>2}, max={max(entries):>2}, mean={sum(entries)/len(entries):>5.1f}, median={sorted(entries)[len(entries)//2]:>2}")
        print(f"  activity_rate: min={min(rate):.2f}, max={max(rate):.2f}, mean={sum(rate)/len(rate):.2f}")

        # Show sample players
        print(f"  sample players:")
        samples = sorted(group, key=lambda x: x["entries"], reverse=True)[:3]
        for s in samples:
            print(f"    - {s['nickname']:<20} {s['entries']:>2} entries, {s['days_active']:>2} days, {s['activity_rate']:.0%} rate")

    print()

    # Interesting transitions
    print("-" * 70)
    print("NOTABLE TRANSITIONS")
    print("-" * 70)

    # Grinders who became regular (downgrade)
    downgraded = [r for r in results if r["old_type"] == "grinder" and r["new_type"] == "regular"]
    if downgraded:
        print(f"\nGrinder → Regular ({len(downgraded)} players):")
        for p in sorted(downgraded, key=lambda x: x["entries"], reverse=True)[:5]:
            print(f"  - {p['nickname']:<20} {p['entries']:>2} entries, {p['days_active']:>2} days, {p['activity_rate']:.0%} rate")

    # Casuals who became grinder (upgrade)
    upgraded_grinder = [r for r in results if r["old_type"] == "casual" and r["new_type"] == "grinder"]
    if upgraded_grinder:
        print(f"\nCasual → Grinder ({len(upgraded_grinder)} players):")
        for p in sorted(upgraded_grinder, key=lambda x: x["entries"], reverse=True)[:5]:
            print(f"  - {p['nickname']:<20} {p['entries']:>2} entries, {p['days_active']:>2} days, {p['activity_rate']:.0%} rate")

    # Casuals who became regular
    upgraded_regular = [r for r in results if r["old_type"] == "casual" and r["new_type"] == "regular"]
    if upgraded_regular:
        print(f"\nCasual → Regular ({len(upgraded_regular)} players):")
        for p in sorted(upgraded_regular, key=lambda x: x["entries"], reverse=True)[:5]:
            print(f"  - {p['nickname']:<20} {p['entries']:>2} entries, {p['days_active']:>2} days, {p['activity_rate']:.0%} rate")

    # New who became casual (aged out of new)
    aged_out = [r for r in results if r["old_type"] == "new" and r["new_type"] == "casual"]
    if aged_out:
        print(f"\nNew → Casual ({len(aged_out)} players, aged out of 'new' window):")
        for p in sorted(aged_out, key=lambda x: x["entries"], reverse=True)[:5]:
            print(f"  - {p['nickname']:<20} {p['entries']:>2} entries, {p['days_active']:>2} days, first_seen={p['first_seen']}")

    # Inactive changes
    was_inactive = [r for r in results if r["old_type"] == "inactive" and r["new_type"] != "inactive"]
    print(f"\nInactive → Active ({len(was_inactive)} players, threshold change 5→10 days):")
    by_new_type = Counter(r["new_type"] for r in was_inactive)
    for t, c in by_new_type.most_common():
        print(f"  → {t}: {c}")

    became_inactive = [r for r in results if r["old_type"] != "inactive" and r["new_type"] == "inactive"]
    print(f"\nActive → Inactive ({len(became_inactive)} players):")
    by_old_type = Counter(r["old_type"] for r in became_inactive)
    for t, c in by_old_type.most_common():
        print(f"  {t} →: {c}")


if __name__ == "__main__":
    main()
