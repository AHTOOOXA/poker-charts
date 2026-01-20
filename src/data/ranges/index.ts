import type { Action, Position, Scenario } from '@/types/poker'

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

// Sample ranges - in real app these would be comprehensive
const ranges: Record<RangeKey, Range> = {
  // BTN RFI - wide opening range
  'BTN-RFI': {
    'AA': 'raise', 'AKs': 'raise', 'AQs': 'raise', 'AJs': 'raise', 'ATs': 'raise', 'A9s': 'raise', 'A8s': 'raise', 'A7s': 'raise', 'A6s': 'raise', 'A5s': 'raise', 'A4s': 'raise', 'A3s': 'raise', 'A2s': 'raise',
    'AKo': 'raise', 'KK': 'raise', 'KQs': 'raise', 'KJs': 'raise', 'KTs': 'raise', 'K9s': 'raise', 'K8s': 'raise', 'K7s': 'raise', 'K6s': 'raise', 'K5s': 'raise', 'K4s': 'raise', 'K3s': 'raise', 'K2s': 'raise',
    'AQo': 'raise', 'KQo': 'raise', 'QQ': 'raise', 'QJs': 'raise', 'QTs': 'raise', 'Q9s': 'raise', 'Q8s': 'raise', 'Q7s': 'raise', 'Q6s': 'raise', 'Q5s': 'raise', 'Q4s': 'raise', 'Q3s': 'raise', 'Q2s': 'raise',
    'AJo': 'raise', 'KJo': 'raise', 'QJo': 'raise', 'JJ': 'raise', 'JTs': 'raise', 'J9s': 'raise', 'J8s': 'raise', 'J7s': 'raise', 'J6s': 'raise', 'J5s': 'raise',
    'ATo': 'raise', 'KTo': 'raise', 'QTo': 'raise', 'JTo': 'raise', 'TT': 'raise', 'T9s': 'raise', 'T8s': 'raise', 'T7s': 'raise', 'T6s': 'raise',
    'A9o': 'raise', 'K9o': 'raise', 'Q9o': 'raise', 'J9o': 'raise', 'T9o': 'raise', '99': 'raise', '98s': 'raise', '97s': 'raise', '96s': 'raise',
    'A8o': 'raise', 'K8o': 'raise', '88': 'raise', '87s': 'raise', '86s': 'raise', '85s': 'raise',
    'A7o': 'raise', '77': 'raise', '76s': 'raise', '75s': 'raise',
    'A6o': 'raise', '66': 'raise', '65s': 'raise', '64s': 'raise',
    'A5o': 'raise', '55': 'raise', '54s': 'raise', '53s': 'raise',
    'A4o': 'raise', '44': 'raise', '43s': 'raise',
    'A3o': 'raise', '33': 'raise',
    'A2o': 'raise', '22': 'raise',
  },

  // CO RFI - slightly tighter
  'CO-RFI': {
    'AA': 'raise', 'AKs': 'raise', 'AQs': 'raise', 'AJs': 'raise', 'ATs': 'raise', 'A9s': 'raise', 'A8s': 'raise', 'A7s': 'raise', 'A6s': 'raise', 'A5s': 'raise', 'A4s': 'raise', 'A3s': 'raise', 'A2s': 'raise',
    'AKo': 'raise', 'KK': 'raise', 'KQs': 'raise', 'KJs': 'raise', 'KTs': 'raise', 'K9s': 'raise', 'K8s': 'raise', 'K7s': 'raise', 'K6s': 'raise', 'K5s': 'raise',
    'AQo': 'raise', 'KQo': 'raise', 'QQ': 'raise', 'QJs': 'raise', 'QTs': 'raise', 'Q9s': 'raise', 'Q8s': 'raise', 'Q7s': 'raise',
    'AJo': 'raise', 'KJo': 'raise', 'QJo': 'raise', 'JJ': 'raise', 'JTs': 'raise', 'J9s': 'raise', 'J8s': 'raise',
    'ATo': 'raise', 'KTo': 'raise', 'QTo': 'raise', 'JTo': 'raise', 'TT': 'raise', 'T9s': 'raise', 'T8s': 'raise',
    'A9o': 'raise', 'K9o': 'raise', '99': 'raise', '98s': 'raise', '97s': 'raise',
    'A8o': 'raise', '88': 'raise', '87s': 'raise', '86s': 'raise',
    'A7o': 'raise', '77': 'raise', '76s': 'raise', '75s': 'raise',
    'A6o': 'raise', '66': 'raise', '65s': 'raise',
    'A5o': 'raise', '55': 'raise', '54s': 'raise',
    '44': 'raise', '33': 'raise', '22': 'raise',
  },

  // MP RFI - tighter
  'MP-RFI': {
    'AA': 'raise', 'AKs': 'raise', 'AQs': 'raise', 'AJs': 'raise', 'ATs': 'raise', 'A9s': 'raise', 'A8s': 'raise', 'A5s': 'raise', 'A4s': 'raise',
    'AKo': 'raise', 'KK': 'raise', 'KQs': 'raise', 'KJs': 'raise', 'KTs': 'raise', 'K9s': 'raise',
    'AQo': 'raise', 'KQo': 'raise', 'QQ': 'raise', 'QJs': 'raise', 'QTs': 'raise', 'Q9s': 'raise',
    'AJo': 'raise', 'KJo': 'raise', 'JJ': 'raise', 'JTs': 'raise', 'J9s': 'raise',
    'ATo': 'raise', 'KTo': 'raise', 'TT': 'raise', 'T9s': 'raise',
    '99': 'raise', '98s': 'raise',
    '88': 'raise', '87s': 'raise',
    '77': 'raise', '76s': 'raise',
    '66': 'raise', '65s': 'raise',
    '55': 'raise', '54s': 'raise',
    '44': 'raise', '33': 'raise', '22': 'raise',
  },

  // UTG RFI - tightest
  'UTG-RFI': {
    'AA': 'raise', 'AKs': 'raise', 'AQs': 'raise', 'AJs': 'raise', 'ATs': 'raise',
    'AKo': 'raise', 'KK': 'raise', 'KQs': 'raise', 'KJs': 'raise', 'KTs': 'raise',
    'AQo': 'raise', 'KQo': 'raise', 'QQ': 'raise', 'QJs': 'raise', 'QTs': 'raise',
    'AJo': 'raise', 'JJ': 'raise', 'JTs': 'raise',
    'TT': 'raise', 'T9s': 'raise',
    '99': 'raise',
    '88': 'raise',
    '77': 'raise',
    '66': 'raise',
    '55': 'raise',
  },

  // SB RFI (steal)
  'SB-RFI': {
    'AA': 'raise', 'AKs': 'raise', 'AQs': 'raise', 'AJs': 'raise', 'ATs': 'raise', 'A9s': 'raise', 'A8s': 'raise', 'A7s': 'raise', 'A6s': 'raise', 'A5s': 'raise', 'A4s': 'raise', 'A3s': 'raise', 'A2s': 'raise',
    'AKo': 'raise', 'KK': 'raise', 'KQs': 'raise', 'KJs': 'raise', 'KTs': 'raise', 'K9s': 'raise', 'K8s': 'raise', 'K7s': 'raise', 'K6s': 'raise', 'K5s': 'raise', 'K4s': 'raise', 'K3s': 'raise', 'K2s': 'raise',
    'AQo': 'raise', 'KQo': 'raise', 'QQ': 'raise', 'QJs': 'raise', 'QTs': 'raise', 'Q9s': 'raise', 'Q8s': 'raise', 'Q7s': 'raise', 'Q6s': 'raise', 'Q5s': 'raise', 'Q4s': 'raise', 'Q3s': 'raise', 'Q2s': 'raise',
    'AJo': 'raise', 'KJo': 'raise', 'QJo': 'raise', 'JJ': 'raise', 'JTs': 'raise', 'J9s': 'raise', 'J8s': 'raise', 'J7s': 'raise', 'J6s': 'raise', 'J5s': 'raise', 'J4s': 'raise',
    'ATo': 'raise', 'KTo': 'raise', 'QTo': 'raise', 'JTo': 'raise', 'TT': 'raise', 'T9s': 'raise', 'T8s': 'raise', 'T7s': 'raise', 'T6s': 'raise',
    'A9o': 'raise', 'K9o': 'raise', 'Q9o': 'raise', 'J9o': 'raise', 'T9o': 'raise', '99': 'raise', '98s': 'raise', '97s': 'raise', '96s': 'raise',
    'A8o': 'raise', 'K8o': 'raise', 'Q8o': 'raise', '88': 'raise', '87s': 'raise', '86s': 'raise', '85s': 'raise',
    'A7o': 'raise', 'K7o': 'raise', '77': 'raise', '76s': 'raise', '75s': 'raise', '74s': 'raise',
    'A6o': 'raise', 'K6o': 'raise', '66': 'raise', '65s': 'raise', '64s': 'raise',
    'A5o': 'raise', 'K5o': 'raise', '55': 'raise', '54s': 'raise', '53s': 'raise',
    'A4o': 'raise', 'K4o': 'raise', '44': 'raise', '43s': 'raise',
    'A3o': 'raise', '33': 'raise', '32s': 'raise',
    'A2o': 'raise', '22': 'raise',
  },

  // BTN vs BB 3bet
  'BTN-vs-3bet-BB': {
    'AA': 'all-in', 'AKs': 'all-in', 'AQs': 'call', 'AJs': 'call', 'ATs': 'call', 'A9s': 'fold', 'A8s': 'fold', 'A7s': 'fold', 'A6s': 'fold', 'A5s': 'call', 'A4s': 'call',
    'AKo': 'all-in', 'KK': 'all-in', 'KQs': 'call', 'KJs': 'call', 'KTs': 'call', 'K9s': 'fold',
    'AQo': 'call', 'KQo': 'fold', 'QQ': 'all-in', 'QJs': 'call', 'QTs': 'call',
    'AJo': 'fold', 'JJ': 'all-in', 'JTs': 'call',
    'ATo': 'fold', 'TT': 'call', 'T9s': 'call',
    '99': 'call', '98s': 'call',
    '88': 'call', '87s': 'call',
    '77': 'call', '76s': 'call',
    '66': 'call', '65s': 'call',
    '55': 'call', '54s': 'call',
    '44': 'fold',
    '33': 'fold',
    '22': 'fold',
  },

  // BTN vs SB 3bet
  'BTN-vs-3bet-SB': {
    'AA': 'all-in', 'AKs': 'all-in', 'AQs': 'call', 'AJs': 'call', 'ATs': 'call', 'A5s': 'call', 'A4s': 'call',
    'AKo': 'all-in', 'KK': 'all-in', 'KQs': 'call', 'KJs': 'call', 'KTs': 'call',
    'AQo': 'call', 'QQ': 'all-in', 'QJs': 'call', 'QTs': 'call',
    'AJo': 'fold', 'JJ': 'all-in', 'JTs': 'call',
    'TT': 'call', 'T9s': 'call',
    '99': 'call', '98s': 'call',
    '88': 'call', '87s': 'call',
    '77': 'call', '76s': 'call',
    '66': 'call', '65s': 'call',
    '55': 'call', '54s': 'call',
    '44': 'fold',
    '33': 'fold',
    '22': 'fold',
  },

  // CO vs BTN 3bet
  'CO-vs-3bet-BTN': {
    'AA': 'all-in', 'AKs': 'all-in', 'AQs': 'call', 'AJs': 'call', 'ATs': 'fold', 'A5s': 'call',
    'AKo': 'all-in', 'KK': 'all-in', 'KQs': 'call', 'KJs': 'fold',
    'AQo': 'call', 'QQ': 'all-in', 'QJs': 'call',
    'JJ': 'all-in', 'JTs': 'call',
    'TT': 'call', 'T9s': 'call',
    '99': 'call', '98s': 'call',
    '88': 'call', '87s': 'call',
    '77': 'call', '76s': 'call',
    '66': 'call', '65s': 'call',
    '55': 'fold',
    '44': 'fold',
  },

  // BB vs BTN open (defend)
  'BB-vs-open-BTN': {
    'AA': '3bet', 'AKs': '3bet', 'AQs': '3bet', 'AJs': '3bet', 'ATs': 'call', 'A9s': 'call', 'A8s': 'call', 'A7s': 'call', 'A6s': 'call', 'A5s': '3bet', 'A4s': '3bet', 'A3s': 'call', 'A2s': 'call',
    'AKo': '3bet', 'KK': '3bet', 'KQs': '3bet', 'KJs': 'call', 'KTs': 'call', 'K9s': 'call', 'K8s': 'call', 'K7s': 'call', 'K6s': 'call', 'K5s': 'call', 'K4s': 'call', 'K3s': 'call', 'K2s': 'call',
    'AQo': '3bet', 'KQo': 'call', 'QQ': '3bet', 'QJs': 'call', 'QTs': 'call', 'Q9s': 'call', 'Q8s': 'call', 'Q7s': 'call', 'Q6s': 'call', 'Q5s': 'call', 'Q4s': 'call',
    'AJo': 'call', 'KJo': 'call', 'QJo': 'call', 'JJ': '3bet', 'JTs': 'call', 'J9s': 'call', 'J8s': 'call', 'J7s': 'call', 'J6s': 'call',
    'ATo': 'call', 'KTo': 'call', 'QTo': 'call', 'JTo': 'call', 'TT': '3bet', 'T9s': 'call', 'T8s': 'call', 'T7s': 'call', 'T6s': 'call',
    'A9o': 'call', 'K9o': 'call', 'Q9o': 'call', 'J9o': 'call', 'T9o': 'call', '99': 'call', '98s': 'call', '97s': 'call', '96s': 'call',
    'A8o': 'call', 'K8o': 'fold', '88': 'call', '87s': 'call', '86s': 'call', '85s': 'call',
    'A7o': 'call', '77': 'call', '76s': 'call', '75s': 'call', '74s': 'call',
    'A6o': 'fold', '66': 'call', '65s': 'call', '64s': 'call', '63s': 'call',
    'A5o': 'fold', '55': 'call', '54s': 'call', '53s': 'call', '52s': 'call',
    'A4o': 'fold', '44': 'call', '43s': 'call', '42s': 'call',
    'A3o': 'fold', '33': 'call', '32s': 'call',
    'A2o': 'fold', '22': 'call',
  },

  // BB vs CO open
  'BB-vs-open-CO': {
    'AA': '3bet', 'AKs': '3bet', 'AQs': '3bet', 'AJs': 'call', 'ATs': 'call', 'A9s': 'call', 'A8s': 'call', 'A7s': 'call', 'A6s': 'fold', 'A5s': '3bet', 'A4s': 'call', 'A3s': 'fold', 'A2s': 'fold',
    'AKo': '3bet', 'KK': '3bet', 'KQs': '3bet', 'KJs': 'call', 'KTs': 'call', 'K9s': 'call', 'K8s': 'fold', 'K7s': 'fold',
    'AQo': '3bet', 'KQo': 'call', 'QQ': '3bet', 'QJs': 'call', 'QTs': 'call', 'Q9s': 'call', 'Q8s': 'fold',
    'AJo': 'call', 'KJo': 'call', 'QJo': 'call', 'JJ': '3bet', 'JTs': 'call', 'J9s': 'call', 'J8s': 'fold',
    'ATo': 'call', 'KTo': 'fold', 'QTo': 'fold', 'JTo': 'call', 'TT': '3bet', 'T9s': 'call', 'T8s': 'call',
    'A9o': 'fold', 'K9o': 'fold', '99': 'call', '98s': 'call', '97s': 'call',
    'A8o': 'fold', '88': 'call', '87s': 'call', '86s': 'call',
    '77': 'call', '76s': 'call', '75s': 'call',
    '66': 'call', '65s': 'call', '64s': 'call',
    '55': 'call', '54s': 'call',
    '44': 'call', '43s': 'call',
    '33': 'call',
    '22': 'call',
  },

  // BB vs UTG open (tight defense)
  'BB-vs-open-UTG': {
    'AA': '3bet', 'AKs': '3bet', 'AQs': 'call', 'AJs': 'call', 'ATs': 'call',
    'AKo': '3bet', 'KK': '3bet', 'KQs': 'call', 'KJs': 'fold', 'KTs': 'fold',
    'AQo': 'call', 'KQo': 'fold', 'QQ': '3bet', 'QJs': 'fold', 'QTs': 'fold',
    'AJo': 'fold', 'JJ': 'call', 'JTs': 'call',
    'ATo': 'fold', 'TT': 'call', 'T9s': 'call',
    '99': 'call', '98s': 'call',
    '88': 'call', '87s': 'call',
    '77': 'call', '76s': 'call',
    '66': 'call', '65s': 'call',
    '55': 'call', '54s': 'call',
    '44': 'fold',
    '33': 'fold',
    '22': 'fold',
  },

  // SB vs BTN open
  'SB-vs-open-BTN': {
    'AA': '3bet', 'AKs': '3bet', 'AQs': '3bet', 'AJs': '3bet', 'ATs': 'call', 'A9s': 'fold', 'A5s': '3bet', 'A4s': '3bet',
    'AKo': '3bet', 'KK': '3bet', 'KQs': '3bet', 'KJs': 'call', 'KTs': 'fold',
    'AQo': '3bet', 'KQo': 'call', 'QQ': '3bet', 'QJs': 'call', 'QTs': 'fold',
    'AJo': 'call', 'KJo': 'fold', 'JJ': '3bet', 'JTs': 'call',
    'ATo': 'fold', 'TT': '3bet', 'T9s': 'call',
    '99': 'call', '98s': 'call',
    '88': 'call', '87s': 'call',
    '77': 'call', '76s': 'call',
    '66': 'call', '65s': 'call',
    '55': 'call', '54s': 'call',
    '44': 'fold',
    '33': 'fold',
    '22': 'fold',
  },

  // CO vs BB 3bet (after CO opened)
  'CO-vs-3bet-BB': {
    'AA': 'all-in', 'AKs': 'all-in', 'AQs': 'call', 'AJs': 'call', 'ATs': 'fold', 'A5s': 'call',
    'AKo': 'all-in', 'KK': 'all-in', 'KQs': 'call', 'KJs': 'fold',
    'AQo': 'call', 'QQ': 'all-in', 'QJs': 'call',
    'JJ': 'all-in', 'JTs': 'call',
    'TT': 'call', 'T9s': 'call',
    '99': 'call', '98s': 'call',
    '88': 'call', '87s': 'call',
    '77': 'call', '76s': 'call',
    '66': 'fold', '65s': 'fold',
    '55': 'fold',
    '44': 'fold',
  },

  // CO vs SB 3bet
  'CO-vs-3bet-SB': {
    'AA': 'all-in', 'AKs': 'all-in', 'AQs': 'call', 'AJs': 'fold', 'A5s': 'call',
    'AKo': 'all-in', 'KK': 'all-in', 'KQs': 'call',
    'AQo': 'call', 'QQ': 'all-in', 'QJs': 'call',
    'JJ': 'all-in', 'JTs': 'call',
    'TT': 'call', 'T9s': 'call',
    '99': 'call', '98s': 'call',
    '88': 'call', '87s': 'call',
    '77': 'call', '76s': 'call',
    '66': 'fold',
    '55': 'fold',
    '44': 'fold',
  },

  // BB vs SB open (very wide defense)
  'BB-vs-open-SB': {
    'AA': '3bet', 'AKs': '3bet', 'AQs': '3bet', 'AJs': '3bet', 'ATs': 'call', 'A9s': 'call', 'A8s': 'call', 'A7s': 'call', 'A6s': 'call', 'A5s': '3bet', 'A4s': '3bet', 'A3s': 'call', 'A2s': 'call',
    'AKo': '3bet', 'KK': '3bet', 'KQs': '3bet', 'KJs': 'call', 'KTs': 'call', 'K9s': 'call', 'K8s': 'call', 'K7s': 'call', 'K6s': 'call', 'K5s': 'call', 'K4s': 'call', 'K3s': 'call', 'K2s': 'call',
    'AQo': '3bet', 'KQo': 'call', 'QQ': '3bet', 'QJs': 'call', 'QTs': 'call', 'Q9s': 'call', 'Q8s': 'call', 'Q7s': 'call', 'Q6s': 'call', 'Q5s': 'call', 'Q4s': 'call', 'Q3s': 'call', 'Q2s': 'call',
    'AJo': '3bet', 'KJo': 'call', 'QJo': 'call', 'JJ': '3bet', 'JTs': 'call', 'J9s': 'call', 'J8s': 'call', 'J7s': 'call', 'J6s': 'call', 'J5s': 'call', 'J4s': 'call', 'J3s': 'call',
    'ATo': 'call', 'KTo': 'call', 'QTo': 'call', 'JTo': 'call', 'TT': '3bet', 'T9s': 'call', 'T8s': 'call', 'T7s': 'call', 'T6s': 'call', 'T5s': 'call', 'T4s': 'call',
    'A9o': 'call', 'K9o': 'call', 'Q9o': 'call', 'J9o': 'call', 'T9o': 'call', '99': '3bet', '98s': 'call', '97s': 'call', '96s': 'call', '95s': 'call',
    'A8o': 'call', 'K8o': 'call', 'Q8o': 'call', 'J8o': 'call', 'T8o': 'call', '98o': 'call', '88': 'call', '87s': 'call', '86s': 'call', '85s': 'call', '84s': 'call',
    'A7o': 'call', 'K7o': 'call', 'Q7o': 'fold', '97o': 'call', '87o': 'call', '77': 'call', '76s': 'call', '75s': 'call', '74s': 'call', '73s': 'call',
    'A6o': 'call', 'K6o': 'fold', '96o': 'fold', '86o': 'call', '76o': 'call', '66': 'call', '65s': 'call', '64s': 'call', '63s': 'call', '62s': 'call',
    'A5o': 'call', 'K5o': 'fold', '75o': 'fold', '65o': 'call', '55': 'call', '54s': 'call', '53s': 'call', '52s': 'call',
    'A4o': 'call', 'K4o': 'fold', '64o': 'fold', '54o': 'call', '44': 'call', '43s': 'call', '42s': 'call',
    'A3o': 'call', '53o': 'fold', '43o': 'call', '33': 'call', '32s': 'call',
    'A2o': 'call', '42o': 'fold', '32o': 'call', '22': 'call',
  },

  // MP vs UTG open
  'MP-vs-open-UTG': {
    'AA': '3bet', 'AKs': '3bet', 'AQs': 'call',
    'AKo': '3bet', 'KK': '3bet', 'KQs': 'fold',
    'AQo': 'fold', 'QQ': '3bet', 'QJs': 'fold',
    'JJ': 'call', 'JTs': 'fold',
    'TT': 'call', 'T9s': 'fold',
    '99': 'call',
    '88': 'call',
    '77': 'call',
    '66': 'call',
    '55': 'fold',
    '44': 'fold',
  },
}

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
