#!/usr/bin/env python3
"""
Parse pekarstas chart data into simplified 4-action format.

Actions:
- fold: don't play
- call: passive (call open, call 3bet, etc.)
- raise: aggressive (open, 3bet, 4bet depending on context)
- allin: maximum aggression (jam)

Cells can be:
- Single action: 'raise'
- Split (mixed/marginal): ['raise', 'fold']
"""
import json
from pathlib import Path

CHARTS_DIR = Path(__file__).parent / "charts_raw"

# Chart mappings
RFI_CHARTS = {
    16: ('UTG', 'RFI', None),
    24: ('MP', 'RFI', None),
    26: ('CO', 'RFI', None),
    27: ('BTN', 'RFI', None),
    28: ('SB', 'RFI', None),
}

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

# vs-4bet for non-BB positions (you 3bet, villain 4bets)
# Colors: blue=call, sand=marginal call, red=5bet allin
VS_4BET = {
    58: ('MP', 'vs-4bet', 'UTG'),
    59: ('CO', 'vs-4bet', 'UTG'),   # Raw data combines EP-MP
    60: ('BTN', 'vs-4bet', 'UTG'),  # Raw data combines EP-MP
    61: ('BTN', 'vs-4bet', 'CO'),
    62: ('SB', 'vs-4bet', 'UTG'),
    63: ('SB', 'vs-4bet', 'MP'),
    64: ('SB', 'vs-4bet', 'CO'),
    65: ('SB', 'vs-4bet', 'BTN'),
}

# BB Defense - generates TWO charts per villain:
# 1. BB vs-open (what to do facing open): call / raise(3bet) / allin
# 2. BB vs-4bet (if we 3bet, what if they 4bet): fold / call / allin
BB_DEFENSE = {
    67: ('BB', 'UTG'),   # 2.5x sizing
    70: ('BB', 'MP'),
    73: ('BB', 'CO'),
    76: ('BB', 'BTN'),
    78: ('BB', 'SB'),
}


def parse_rfi(color: str) -> str | list | None:
    """RFI: mariner=raise, sand=marginal raise"""
    if color == 'mariner':
        return 'raise'
    elif color == 'sand':
        return ['raise', 'fold']
    return None


def parse_vs_open(color: str) -> str | list | None:
    """vs Open: mariner=3bet(raise), green=marginal call"""
    if color == 'mariner':
        return 'raise'
    elif color == 'green':
        return ['call', 'fold']
    return None


def parse_vs_3bet(color: str) -> str | list | None:
    """vs 3bet: blue=call, red=allin(4bet value), purple=marginal 4bet(bluff)"""
    if color == 'blue':
        return 'call'
    elif color == 'red':
        return 'allin'
    elif color == 'purple':
        return ['raise', 'fold']
    return None


def parse_vs_4bet(color: str) -> str | list | None:
    """vs 4bet (non-BB): blue=call, sand=marginal call, red=5bet allin"""
    if color == 'blue':
        return 'call'
    elif color == 'sand':
        return ['call', 'fold']
    elif color == 'red':
        return 'allin'
    return None


def parse_bb_vs_open(color: str) -> str | None:
    """BB vs open: green=call, mariner/blue=raise(3bet), red=allin"""
    if color == 'green':
        return 'call'
    elif color in ('mariner', 'blue'):
        return 'raise'  # 3bet
    elif color == 'red':
        return 'allin'  # 3bet/5bet jam
    return None


def parse_bb_vs_4bet(color: str) -> str | None:
    """BB vs 4bet (after we 3bet): mariner=fold, blue=call, red=allin"""
    if color == 'mariner':
        return 'fold'
    elif color == 'blue':
        return 'call'
    elif color == 'red':
        return 'allin'
    # green hands don't 3bet, so they're not in this chart
    return None


def parse_chart(chart_id: int, parser) -> dict:
    """Parse a chart JSON file."""
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
            color = colors[0]['color']
            action = parser(color)
            if action:
                hands[name] = action

    return hands


def format_cell(cell) -> str:
    """Format a cell value for TypeScript."""
    if isinstance(cell, list):
        return f"['{cell[0]}', '{cell[1]}']"
    return f"'{cell}'"


def format_chart(hands: dict) -> str:
    """Format a chart as TypeScript object entries."""
    if not hands:
        return ""

    lines = []
    current_line = "    "

    for hand, cell in sorted(hands.items()):
        entry = f"'{hand}': {format_cell(cell)}, "
        if len(current_line) + len(entry) > 120:
            lines.append(current_line.rstrip())
            current_line = "    " + entry
        else:
            current_line += entry

    if current_line.strip():
        lines.append(current_line.rstrip())

    return '\n'.join(lines)


def main():
    all_charts = {}

    print("\n=== RFI Charts ===")
    for chart_id, (hero, scenario, villain) in RFI_CHARTS.items():
        key = f"{hero}-{scenario}"
        hands = parse_chart(chart_id, parse_rfi)
        if hands:
            all_charts[key] = hands
            splits = sum(1 for v in hands.values() if isinstance(v, list))
            print(f"{key}: {len(hands)} hands ({splits} mixed)")

    print("\n=== vs Open Charts ===")
    for chart_id, (hero, scenario, villain) in VS_OPEN_CHARTS.items():
        key = f"{hero}-{scenario}-{villain}"
        hands = parse_chart(chart_id, parse_vs_open)
        if hands:
            all_charts[key] = hands
            splits = sum(1 for v in hands.values() if isinstance(v, list))
            print(f"{key}: {len(hands)} hands ({splits} mixed)")

    print("\n=== vs 3bet Charts ===")
    for chart_id, (hero, scenario, villain) in VS_3BET.items():
        key = f"{hero}-{scenario}-{villain}"
        hands = parse_chart(chart_id, parse_vs_3bet)
        if hands:
            all_charts[key] = hands
            splits = sum(1 for v in hands.values() if isinstance(v, list))
            print(f"{key}: {len(hands)} hands ({splits} mixed)")

    print("\n=== vs 4bet Charts (non-BB) ===")
    for chart_id, (hero, scenario, villain) in VS_4BET.items():
        key = f"{hero}-{scenario}-{villain}"
        hands = parse_chart(chart_id, parse_vs_4bet)
        if hands:
            all_charts[key] = hands
            splits = sum(1 for v in hands.values() if isinstance(v, list))
            print(f"{key}: {len(hands)} hands ({splits} mixed)")

    print("\n=== BB Defense Charts ===")
    for chart_id, (hero, villain) in BB_DEFENSE.items():
        # Chart 1: BB vs open
        key_vs_open = f"{hero}-vs-open-{villain}"
        hands_vs_open = parse_chart(chart_id, parse_bb_vs_open)
        if hands_vs_open:
            all_charts[key_vs_open] = hands_vs_open
            print(f"{key_vs_open}: {len(hands_vs_open)} hands")

        # Chart 2: BB vs 4bet (only 3betting hands)
        key_vs_4bet = f"{hero}-vs-4bet-{villain}"
        hands_vs_4bet = parse_chart(chart_id, parse_bb_vs_4bet)
        if hands_vs_4bet:
            all_charts[key_vs_4bet] = hands_vs_4bet
            print(f"{key_vs_4bet}: {len(hands_vs_4bet)} hands")

    # Generate TypeScript
    ts_code = '''import type { Cell, Position, Scenario } from '@/types/poker'

// Chart is a sparse map of hand -> cell (unlisted hands are fold)
export type Chart = Record<string, Cell>

export type ChartKey = string

export function getChartKey(hero: Position, scenario: Scenario, villain?: Position): ChartKey {
  if (villain) {
    return `${hero}-${scenario}-${villain}`
  }
  return `${hero}-${scenario}`
}

const charts: Record<ChartKey, Chart> = {
'''

    for key, hands in sorted(all_charts.items()):
        ts_code += f"  '{key}': {{\n"
        ts_code += format_chart(hands)
        ts_code += "\n  },\n\n"

    ts_code += '''}

export function getChart(hero: Position, scenario: Scenario, villain?: Position): Chart | null {
  const key = getChartKey(hero, scenario, villain)
  return charts[key] || null
}

export function getCell(
  hero: Position,
  scenario: Scenario,
  hand: string,
  villain?: Position
): Cell {
  const chart = getChart(hero, scenario, villain)
  if (!chart) return 'fold'
  return chart[hand] || 'fold'
}
'''

    output_path = Path(__file__).parent.parent / "src" / "data" / "ranges" / "index.ts"
    with open(output_path, 'w') as f:
        f.write(ts_code)

    print(f"\n=== Generated {output_path} ===")
    print(f"Total charts: {len(all_charts)}")


if __name__ == '__main__':
    main()
