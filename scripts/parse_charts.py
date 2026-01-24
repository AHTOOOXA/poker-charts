#!/usr/bin/env python3
import json
import os
from pathlib import Path

CHARTS_DIR = Path(__file__).parent / "charts_raw"

# Chart ID to (hero, scenario, villain) mapping
# RFI Charts
RFI_CHARTS = {
    16: ('UTG', 'RFI', None),
    24: ('MP', 'RFI', None),
    26: ('CO', 'RFI', None),
    27: ('BTN', 'RFI', None),
    28: ('SB', 'RFI', None),
}

# vs Open Charts (3bet/call ranges) - hero facing open from villain
# Charts 29-38 have both 3bet and cold-call options
VS_OPEN_CHARTS = {
    29: ('MP', 'vs-open', 'UTG'),
    30: ('CO', 'vs-open', 'UTG'),
    31: ('BTN', 'vs-open', 'UTG'),
    32: ('BTN', 'vs-open', 'CO'),
    33: ('SB', 'vs-open', 'UTG'),
    34: ('SB', 'vs-open', 'MP'),
    36: ('SB', 'vs-open', 'CO'),
    38: ('SB', 'vs-open', 'BTN'),
}

# vs 3bet Charts - hero opened, facing 3bet from villain
VS_3BET = {
    39: ('UTG', 'vs-3bet', 'MP'),
    44: ('UTG', 'vs-3bet', 'CO'),
    45: ('UTG', 'vs-3bet', 'BTN'),
    46: ('UTG', 'vs-3bet', 'SB'),
    47: ('UTG', 'vs-3bet', 'BB'),
    48: ('MP', 'vs-3bet', 'CO'),
    49: ('MP', 'vs-3bet', 'BTN'),
    50: ('MP', 'vs-3bet', 'SB'),
    51: ('MP', 'vs-3bet', 'BB'),
    52: ('CO', 'vs-3bet', 'BTN'),
    53: ('CO', 'vs-3bet', 'SB'),
    54: ('CO', 'vs-3bet', 'BB'),
    55: ('BTN', 'vs-3bet', 'SB'),
    56: ('BTN', 'vs-3bet', 'BB'),
    57: ('SB', 'vs-3bet', 'BB'),
}

# BB Defense Charts - BB facing open from villain (using 2.5x sizing)
BB_DEFENSE = {
    67: ('BB', 'vs-open', 'UTG'),
    70: ('BB', 'vs-open', 'MP'),
    73: ('BB', 'vs-open', 'CO'),
    76: ('BB', 'vs-open', 'BTN'),
    78: ('BB', 'vs-open', 'SB'),
}


def get_rfi_action(color: str) -> str | None:
    """RFI chart colors."""
    if color == 'mariner':
        return 'raise'
    elif color == 'sand':
        return 'raise-passive'  # vs fish only
    return None


def get_vs_open_action(color: str) -> str | None:
    """vs Open chart colors (for non-BB positions)."""
    if color == 'mariner':
        return '3bet'
    elif color == 'green':
        return 'call-passive'  # cold call vs fish only
    return None


def get_vs_3bet_action(color: str) -> str | None:
    """vs 3bet chart colors."""
    if color == 'blue':
        return 'call'
    elif color == 'red':
        return 'all-in'  # 4bet for value
    elif color == 'purple':
        return '4bet-bluff'  # 4bet bluff, fold to 5bet
    # sand = fold, so return None
    return None


def get_bb_defense_action(color: str) -> str | None:
    """BB defense chart colors."""
    if color == 'green':
        return 'call'
    elif color == 'mariner':
        return '3bet-fold'  # 3bet, fold to 4bet
    elif color == 'blue':
        return '3bet-call'  # 3bet, call 4bet
    elif color == 'red':
        return 'all-in'  # 3bet/5bet all-in
    return None


def parse_chart(chart_id: int, action_mapper) -> dict[str, str]:
    """Parse a chart JSON file and return hand -> action mapping."""
    file_path = CHARTS_DIR / f"{chart_id}.json"
    if not file_path.exists():
        print(f"Warning: {file_path} not found")
        return {}

    with open(file_path) as f:
        data = json.load(f)

    cells = data.get('full_state', {}).get('cells', [])
    hands = {}

    for cell in cells:
        name = cell['name']
        colors = cell.get('color', [])

        if colors:
            # Take the first color (highest priority action)
            color = colors[0]['color']
            action = action_mapper(color)
            if action:
                hands[name] = action

    return hands


def format_range(hands: dict[str, str]) -> str:
    """Format a range dict as TypeScript object entries."""
    if not hands:
        return ""

    lines = []
    current_line = "    "

    for hand, action in sorted(hands.items(), key=lambda x: x[0]):
        entry = f"'{hand}': '{action}', "
        if len(current_line) + len(entry) > 140:
            lines.append(current_line.rstrip())
            current_line = "    " + entry
        else:
            current_line += entry

    if current_line.strip():
        lines.append(current_line.rstrip())

    return '\n'.join(lines)


def main():
    all_ranges = {}

    # Parse RFI charts
    print("\n=== RFI Charts ===")
    for chart_id, (hero, scenario, villain) in RFI_CHARTS.items():
        key = f"{hero}-{scenario}"
        hands = parse_chart(chart_id, get_rfi_action)
        if hands:
            all_ranges[key] = hands
            print(f"Parsed {key}: {len(hands)} hands")

    # Parse vs Open charts (non-BB)
    print("\n=== vs Open Charts ===")
    for chart_id, (hero, scenario, villain) in VS_OPEN_CHARTS.items():
        key = f"{hero}-{scenario}-{villain}"
        hands = parse_chart(chart_id, get_vs_open_action)
        if hands:
            all_ranges[key] = hands
            print(f"Parsed {key}: {len(hands)} hands")

    # Parse vs 3bet charts
    print("\n=== vs 3bet Charts ===")
    for chart_id, (hero, scenario, villain) in VS_3BET.items():
        key = f"{hero}-{scenario}-{villain}"
        hands = parse_chart(chart_id, get_vs_3bet_action)
        if hands:
            all_ranges[key] = hands
            print(f"Parsed {key}: {len(hands)} hands")

    # Parse BB Defense charts
    print("\n=== BB Defense Charts ===")
    for chart_id, (hero, scenario, villain) in BB_DEFENSE.items():
        key = f"{hero}-{scenario}-{villain}"
        hands = parse_chart(chart_id, get_bb_defense_action)
        if hands:
            all_ranges[key] = hands
            print(f"Parsed {key}: {len(hands)} hands")

    # Generate TypeScript code
    ts_code = '''import type { Action, Position, Scenario } from '@/types/poker'

// Range is a record of hand name to action
export type Range = Record<string, Action>

// Key format: "hero-scenario-villain" e.g., "BTN-RFI" or "BTN-vs-3bet-BB"
export type RangeKey = string

export function getRangeKey(hero: Position, scenario: Scenario, villain?: Position): RangeKey {
  if (villain) {
    return `${hero}-${scenario}-${villain}`
  }
  return `${hero}-${scenario}`
}

const ranges: Record<RangeKey, Range> = {
'''

    for key, hands in sorted(all_ranges.items()):
        ts_code += f"  // {key}\n"
        ts_code += f"  '{key}': {{\n"
        ts_code += format_range(hands)
        ts_code += "\n  },\n\n"

    ts_code += '''}

export function getRange(hero: Position, scenario: Scenario, villain?: Position): Range | null {
  const key = getRangeKey(hero, scenario, villain)
  return ranges[key] || null
}

export function getAction(
  hero: Position,
  scenario: Scenario,
  hand: string,
  villain?: Position
): Action | null {
  const range = getRange(hero, scenario, villain)
  if (!range) return null
  return range[hand] || 'fold'
}
'''

    output_path = Path(__file__).parent.parent / "src" / "data" / "ranges" / "index.ts"
    with open(output_path, 'w') as f:
        f.write(ts_code)

    print(f"\n=== Generated {output_path} ===")
    print(f"Total ranges: {len(all_ranges)}")


if __name__ == '__main__':
    main()
