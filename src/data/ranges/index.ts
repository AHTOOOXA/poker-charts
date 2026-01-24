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

const ranges: Record<RangeKey, Range> = {
  // BB-vs-open-BTN
  'BB-vs-open-BTN': {
    '22': 'call', '32s': 'call', '33': 'call', '42s': 'call', '43s': 'call', '44': 'call', '52s': 'call', '53s': 'call',
    '54s': '3bet-fold', '55': 'call', '63s': 'call', '64s': 'call', '65s': '3bet-fold', '66': 'call', '74s': 'call', '75s': 'call',
    '76o': 'call', '76s': '3bet-fold', '77': 'all-in', '85s': 'call', '86s': '3bet-fold', '87o': 'call', '87s': '3bet-fold',
    '88': 'all-in', '95s': 'call', '96s': 'call', '97s': '3bet-fold', '98o': 'call', '98s': '3bet-call', '99': 'all-in', 'A2o': 'call',
    'A2s': 'call', 'A3o': 'call', 'A3s': 'call', 'A4o': 'call', 'A4s': '3bet-fold', 'A5o': 'call', 'A5s': '3bet-fold', 'A6o': 'call',
    'A6s': 'call', 'A7o': 'call', 'A7s': 'call', 'A8o': 'call', 'A8s': 'call', 'A9o': 'call', 'A9s': 'call', 'AA': 'all-in',
    'AJo': '3bet-fold', 'AJs': '3bet-call', 'AKo': 'all-in', 'AKs': 'all-in', 'AQo': '3bet-fold', 'AQs': '3bet-call', 'ATo': 'call',
    'ATs': '3bet-call', 'J2s': 'call', 'J3s': 'call', 'J4s': 'call', 'J5s': 'call', 'J6s': 'call', 'J7s': 'call', 'J8o': 'call',
    'J8s': 'call', 'J9o': 'call', 'J9s': '3bet-fold', 'JJ': 'all-in', 'JTo': 'call', 'JTs': '3bet-call', 'K2s': 'call', 'K3s': 'call',
    'K4s': 'call', 'K5s': 'call', 'K6s': 'call', 'K7o': 'call', 'K7s': 'call', 'K8o': 'call', 'K8s': 'call', 'K9o': 'call', 'K9s': 'call',
    'KJo': 'call', 'KJs': '3bet-call', 'KK': 'all-in', 'KQo': 'call', 'KQs': '3bet-call', 'KTo': 'call', 'KTs': '3bet-fold', 'Q2s': 'call',
    'Q3s': 'call', 'Q4s': 'call', 'Q5s': 'call', 'Q6s': 'call', 'Q7s': 'call', 'Q8o': 'call', 'Q8s': 'call', 'Q9o': 'call', 'Q9s': 'call',
    'QJo': 'call', 'QJs': '3bet-fold', 'QQ': 'all-in', 'QTo': 'call', 'QTs': '3bet-fold', 'T4s': 'call', 'T5s': 'call', 'T6s': 'call',
    'T7s': 'call', 'T8o': 'call', 'T8s': '3bet-fold', 'T9o': 'call', 'T9s': '3bet-call', 'TT': '3bet-call',
  },

  // BB-vs-open-CO
  'BB-vs-open-CO': {
    '22': 'call', '33': 'call', '43s': 'call', '44': 'call', '53s': 'call', '54s': 'call', '55': 'call', '63s': 'call', '64s': 'call',
    '65s': '3bet-fold', '66': 'call', '74s': 'call', '75s': 'call', '76s': '3bet-call', '77': 'call', '84s': 'call', '85s': 'call',
    '86s': 'call', '87s': '3bet-call', '88': 'all-in', '95s': 'call', '96s': 'call', '97s': 'call', '98s': '3bet-call', '99': 'all-in',
    'A2s': 'call', 'A3s': 'call', 'A4s': '3bet-fold', 'A5s': '3bet-fold', 'A6s': 'call', 'A7s': 'call', 'A8o': 'call', 'A8s': 'call',
    'A9o': 'call', 'A9s': 'call', 'AA': 'all-in', 'AJo': '3bet-fold', 'AJs': '3bet-call', 'AKo': 'all-in', 'AKs': 'all-in',
    'AQo': '3bet-fold', 'AQs': '3bet-call', 'ATo': 'call', 'ATs': '3bet-fold', 'J2s': 'call', 'J3s': 'call', 'J4s': 'call', 'J5s': 'call',
    'J6s': 'call', 'J7s': 'call', 'J8s': 'call', 'J9s': 'call', 'JJ': 'all-in', 'JTs': '3bet-fold', 'K2s': 'call', 'K3s': 'call',
    'K4s': 'call', 'K5s': 'call', 'K6s': 'call', 'K7s': 'call', 'K8s': 'call', 'K9s': 'call', 'KJo': 'call', 'KJs': '3bet-fold',
    'KK': 'all-in', 'KQo': '3bet-fold', 'KQs': '3bet-call', 'KTo': 'call', 'KTs': '3bet-fold', 'Q2s': 'call', 'Q3s': 'call', 'Q4s': 'call',
    'Q5s': 'call', 'Q6s': 'call', 'Q7s': 'call', 'Q8s': 'call', 'Q9s': 'call', 'QJo': 'call', 'QJs': '3bet-fold', 'QQ': 'all-in',
    'QTo': 'call', 'QTs': '3bet-fold', 'T7s': 'call', 'T8s': 'call', 'T9s': 'call', 'TT': '3bet-call',
  },

  // BB-vs-open-MP
  'BB-vs-open-MP': {
    '22': 'call', '33': 'call', '43s': 'call', '44': 'call', '53s': 'call', '54s': '3bet-fold', '55': 'call', '64s': 'call',
    '65s': '3bet-fold', '66': 'call', '75s': 'call', '76s': '3bet-fold', '77': 'call', '86s': 'call', '87s': '3bet-fold', '88': 'call',
    '96s': 'call', '97s': 'call', '98s': 'call', '99': 'call', 'A2s': 'call', 'A3s': 'call', 'A4s': '3bet-fold', 'A5s': '3bet-fold',
    'A6s': 'call', 'A7s': 'call', 'A8s': 'call', 'A9s': 'call', 'AA': 'all-in', 'AJo': 'call', 'AJs': '3bet-fold', 'AKo': '3bet-call',
    'AKs': 'all-in', 'AQo': 'call', 'AQs': '3bet-fold', 'ATo': 'call', 'ATs': '3bet-fold', 'J8s': 'call', 'J9s': 'call', 'JJ': '3bet-call',
    'JTs': 'call', 'K2s': 'call', 'K3s': 'call', 'K4s': 'call', 'K5s': 'call', 'K6s': 'call', 'K7s': 'call', 'K8s': 'call', 'K9s': 'call',
    'KJo': 'call', 'KJs': '3bet-fold', 'KK': 'all-in', 'KQo': 'call', 'KQs': '3bet-fold', 'KTs': 'call', 'Q7s': 'call', 'Q8s': 'call',
    'Q9s': 'call', 'QJo': 'call', 'QJs': '3bet-fold', 'QQ': '3bet-call', 'QTs': 'call', 'T7s': 'call', 'T8s': 'call', 'T9s': 'call',
    'TT': '3bet-call',
  },

  // BB-vs-open-SB
  'BB-vs-open-SB': {
    '22': 'call', '32s': 'call', '33': 'call', '42s': 'call', '43s': 'call', '44': 'call', '52s': 'call', '53s': 'call', '54o': 'call',
    '54s': '3bet-call', '55': 'call', '62s': 'call', '63s': 'call', '64s': '3bet-fold', '65o': 'call', '65s': '3bet-call', '66': 'all-in',
    '72s': 'call', '73s': 'call', '74s': 'call', '75o': 'call', '75s': '3bet-fold', '76o': 'call', '76s': '3bet-call', '77': 'all-in',
    '82s': 'call', '83s': 'call', '84s': 'call', '85s': '3bet-fold', '86o': 'call', '86s': '3bet-fold', '87o': 'call', '87s': '3bet-call',
    '88': 'all-in', '92s': 'call', '93s': 'call', '94s': 'call', '95s': 'call', '96s': '3bet-fold', '97o': 'call', '97s': '3bet-fold',
    '98o': '3bet-fold', '98s': '3bet-fold', '99': '3bet-call', 'A2o': '3bet-fold', 'A2s': '3bet-fold', 'A3o': '3bet-fold',
    'A3s': '3bet-fold', 'A4o': '3bet-fold', 'A4s': '3bet-fold', 'A5o': '3bet-fold', 'A5s': '3bet-fold', 'A6o': 'call', 'A6s': 'call',
    'A7o': 'call', 'A7s': 'call', 'A8o': 'call', 'A8s': 'call', 'A9o': 'call', 'A9s': 'call', 'AA': '3bet-call', 'AJo': '3bet-fold',
    'AJs': '3bet-call', 'AKo': 'all-in', 'AKs': 'all-in', 'AQo': '3bet-call', 'AQs': '3bet-call', 'ATo': 'call', 'ATs': '3bet-call',
    'J2s': 'call', 'J3s': 'call', 'J4s': 'call', 'J5s': 'call', 'J6s': 'call', 'J7o': 'call', 'J7s': 'call', 'J8o': 'call', 'J8s': 'call',
    'J9o': 'call', 'J9s': 'call', 'JJ': 'all-in', 'JTo': 'call', 'JTs': '3bet-call', 'K2s': 'call', 'K3s': 'call', 'K4o': '3bet-fold',
    'K4s': 'call', 'K5o': 'call', 'K5s': 'call', 'K6o': 'call', 'K6s': 'call', 'K7o': 'call', 'K7s': 'call', 'K8o': 'call', 'K8s': 'call',
    'K9o': 'call', 'K9s': 'call', 'KJo': 'call', 'KJs': '3bet-call', 'KK': 'all-in', 'KQo': '3bet-fold', 'KQs': '3bet-call', 'KTo': 'call',
    'KTs': '3bet-fold', 'Q2s': 'call', 'Q3s': 'call', 'Q4s': 'call', 'Q5s': 'call', 'Q6o': 'call', 'Q6s': 'call', 'Q7o': 'call',
    'Q7s': 'call', 'Q8o': 'call', 'Q8s': 'call', 'Q9o': 'call', 'Q9s': 'call', 'QJo': 'call', 'QJs': '3bet-call', 'QQ': 'all-in',
    'QTo': 'call', 'QTs': '3bet-fold', 'T2s': 'call', 'T3s': 'call', 'T4s': 'call', 'T5s': 'call', 'T6s': '3bet-fold', 'T7o': 'call',
    'T7s': '3bet-fold', 'T8o': 'call', 'T8s': 'call', 'T9o': 'call', 'T9s': '3bet-call', 'TT': '3bet-call',
  },

  // BB-vs-open-UTG
  'BB-vs-open-UTG': {
    '22': 'call', '33': 'call', '43s': 'call', '44': 'call', '53s': 'call', '54s': '3bet-fold', '55': 'call', '64s': 'call',
    '65s': '3bet-fold', '66': 'call', '75s': 'call', '76s': '3bet-fold', '77': 'call', '86s': 'call', '87s': '3bet-fold', '88': 'call',
    '96s': 'call', '97s': 'call', '98s': 'call', '99': 'call', 'A2s': 'call', 'A3s': 'call', 'A4s': '3bet-fold', 'A5s': '3bet-fold',
    'A6s': 'call', 'A7s': 'call', 'A8s': 'call', 'A9s': 'call', 'AA': 'all-in', 'AJo': 'call', 'AJs': '3bet-fold', 'AKo': '3bet-call',
    'AKs': 'all-in', 'AQo': 'call', 'AQs': '3bet-fold', 'ATo': 'call', 'ATs': '3bet-fold', 'J8s': 'call', 'J9s': 'call', 'JJ': '3bet-call',
    'JTo': 'call', 'JTs': 'call', 'K2s': 'call', 'K3s': 'call', 'K4s': 'call', 'K5s': 'call', 'K6s': 'call', 'K7s': 'call', 'K8s': 'call',
    'K9s': 'call', 'KJo': 'call', 'KJs': '3bet-fold', 'KK': 'all-in', 'KQo': 'call', 'KQs': '3bet-fold', 'KTs': 'call', 'Q8s': 'call',
    'Q9s': 'call', 'QJo': 'call', 'QJs': '3bet-fold', 'QQ': '3bet-call', 'QTo': 'call', 'QTs': 'call', 'T7s': 'call', 'T8s': 'call',
    'T9s': 'call', 'TT': '3bet-call',
  },

  // BTN-RFI
  'BTN-RFI': {
    '22': 'raise', '33': 'raise', '43s': 'raise-passive', '44': 'raise', '53s': 'raise-passive', '54s': 'raise', '55': 'raise',
    '63s': 'raise-passive', '64s': 'raise', '65s': 'raise', '66': 'raise', '74s': 'raise-passive', '75s': 'raise', '76s': 'raise',
    '77': 'raise', '85s': 'raise-passive', '86s': 'raise', '87s': 'raise', '88': 'raise', '96s': 'raise', '97s': 'raise', '98o': 'raise',
    '98s': 'raise', '99': 'raise', 'A2s': 'raise', 'A3s': 'raise', 'A4o': 'raise', 'A4s': 'raise', 'A5o': 'raise', 'A5s': 'raise',
    'A6o': 'raise', 'A6s': 'raise', 'A7o': 'raise', 'A7s': 'raise', 'A8o': 'raise', 'A8s': 'raise', 'A9o': 'raise', 'A9s': 'raise',
    'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATo': 'raise',
    'ATs': 'raise', 'J5s': 'raise', 'J6s': 'raise', 'J7s': 'raise', 'J8o': 'raise', 'J8s': 'raise', 'J9o': 'raise', 'J9s': 'raise',
    'JJ': 'raise', 'JTo': 'raise', 'JTs': 'raise', 'K2s': 'raise', 'K3s': 'raise', 'K4s': 'raise', 'K5s': 'raise', 'K6s': 'raise',
    'K7s': 'raise', 'K8o': 'raise-passive', 'K8s': 'raise', 'K9o': 'raise', 'K9s': 'raise', 'KJo': 'raise', 'KJs': 'raise', 'KK': 'raise',
    'KQo': 'raise', 'KQs': 'raise', 'KTo': 'raise', 'KTs': 'raise', 'Q2s': 'raise', 'Q3s': 'raise', 'Q4s': 'raise', 'Q5s': 'raise',
    'Q6s': 'raise', 'Q7s': 'raise', 'Q8o': 'raise', 'Q8s': 'raise', 'Q9o': 'raise', 'Q9s': 'raise', 'QJo': 'raise', 'QJs': 'raise',
    'QQ': 'raise', 'QTo': 'raise', 'QTs': 'raise', 'T6s': 'raise', 'T7s': 'raise', 'T8o': 'raise', 'T8s': 'raise', 'T9o': 'raise',
    'T9s': 'raise', 'TT': 'raise',
  },

  // BTN-vs-3bet-BB
  'BTN-vs-3bet-BB': {
    '22': 'call', '33': 'call', '44': 'call', '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call',
    '87s': 'call', '88': 'call', '98s': 'call', '99': 'call', 'A2s': '4bet-bluff', 'A3s': '4bet-bluff', 'A4s': 'call', 'A5s': 'call',
    'A6s': 'call', 'A7s': 'call', 'A8s': 'call', 'A9s': 'call', 'AA': 'all-in', 'AJo': '4bet-bluff', 'AJs': 'call', 'AKo': 'all-in',
    'AKs': 'all-in', 'AQo': 'call', 'AQs': 'call', 'ATo': 'call', 'ATs': 'call', 'J8s': 'call', 'J9s': 'call', 'JJ': 'all-in',
    'JTs': 'call', 'K6s': '4bet-bluff', 'K7s': '4bet-bluff', 'K8s': 'call', 'K9s': 'call', 'KJs': 'call', 'KK': 'all-in',
    'KQo': '4bet-bluff', 'KQs': 'call', 'KTs': 'call', 'Q9s': 'call', 'QJs': 'call', 'QQ': 'all-in', 'QTs': 'call', 'T8s': 'call',
    'T9s': 'call', 'TT': 'call',
  },

  // BTN-vs-3bet-SB
  'BTN-vs-3bet-SB': {
    '22': 'call', '33': 'call', '44': 'call', '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call',
    '87s': 'call', '88': 'call', '97s': 'call', '98s': 'call', '99': 'call', 'A2s': '4bet-bluff', 'A3s': '4bet-bluff', 'A4s': 'call',
    'A5s': 'call', 'A6s': 'call', 'A7s': '4bet-bluff', 'A8s': 'call', 'A9s': 'call', 'AA': 'all-in', 'AJo': '4bet-bluff', 'AJs': 'call',
    'AKo': 'all-in', 'AKs': 'all-in', 'AQo': 'call', 'AQs': 'call', 'ATo': 'call', 'ATs': 'call', 'J8s': 'call', 'J9s': 'call',
    'JJ': 'all-in', 'JTs': 'call', 'K6s': '4bet-bluff', 'K7s': '4bet-bluff', 'K8s': 'call', 'K9s': 'call', 'KJs': 'call', 'KK': 'all-in',
    'KQo': '4bet-bluff', 'KQs': 'call', 'KTs': 'call', 'Q8s': 'call', 'Q9s': 'call', 'QJs': 'call', 'QQ': 'all-in', 'QTs': 'call',
    'T8s': 'call', 'T9s': 'call', 'TT': 'call',
  },

  // BTN-vs-open-CO
  'BTN-vs-open-CO': {
    '44': 'call-passive', '55': 'call-passive', '66': '3bet', '76s': '3bet', '77': '3bet', '87s': '3bet', '88': '3bet', '98s': '3bet',
    '99': '3bet', 'A5s': '3bet', 'A7s': '3bet', 'A8s': '3bet', 'A9s': '3bet', 'AA': '3bet', 'AJo': '3bet', 'AJs': '3bet', 'AKo': '3bet',
    'AKs': '3bet', 'AQo': '3bet', 'AQs': '3bet', 'ATs': '3bet', 'J9s': '3bet', 'JJ': '3bet', 'JTs': '3bet', 'K9s': '3bet', 'KJs': '3bet',
    'KK': '3bet', 'KQo': '3bet', 'KQs': '3bet', 'KTs': '3bet', 'Q9s': '3bet', 'QJs': '3bet', 'QQ': '3bet', 'QTs': '3bet', 'T8s': '3bet',
    'T9s': '3bet', 'TT': '3bet',
  },

  // BTN-vs-open-UTG
  'BTN-vs-open-UTG': {
    '55': 'call-passive', '66': 'call-passive', '76s': '3bet', '77': '3bet', '87s': '3bet', '88': '3bet', '98s': '3bet', '99': '3bet',
    'A2s': '3bet', 'A3s': '3bet', 'A4s': '3bet', 'A5s': '3bet', 'AA': '3bet', 'AJs': '3bet', 'AKo': '3bet', 'AKs': '3bet', 'AQo': '3bet',
    'AQs': '3bet', 'ATs': '3bet', 'JJ': '3bet', 'JTs': '3bet', 'KJs': '3bet', 'KK': '3bet', 'KQs': '3bet', 'KTs': '3bet', 'QJs': '3bet',
    'QQ': '3bet', 'QTs': '3bet', 'T9s': '3bet', 'TT': '3bet',
  },

  // CO-RFI
  'CO-RFI': {
    '22': 'raise', '33': 'raise', '44': 'raise', '54s': 'raise', '55': 'raise', '64s': 'raise', '65s': 'raise', '66': 'raise',
    '75s': 'raise', '76s': 'raise', '77': 'raise', '86s': 'raise', '87s': 'raise', '88': 'raise', '97s': 'raise', '98s': 'raise',
    '99': 'raise', 'A2s': 'raise', 'A3s': 'raise', 'A4s': 'raise', 'A5s': 'raise', 'A6s': 'raise', 'A7s': 'raise', 'A8s': 'raise',
    'A9o': 'raise-passive', 'A9s': 'raise', 'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise',
    'AQs': 'raise', 'ATo': 'raise', 'ATs': 'raise', 'J7s': 'raise', 'J8s': 'raise', 'J9s': 'raise', 'JJ': 'raise', 'JTo': 'raise',
    'JTs': 'raise', 'K5s': 'raise-passive', 'K6s': 'raise', 'K7s': 'raise', 'K8s': 'raise', 'K9s': 'raise', 'KJo': 'raise', 'KJs': 'raise',
    'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise', 'KTo': 'raise', 'KTs': 'raise', 'Q8s': 'raise', 'Q9s': 'raise', 'QJo': 'raise',
    'QJs': 'raise', 'QQ': 'raise', 'QTo': 'raise', 'QTs': 'raise', 'T7s': 'raise', 'T8s': 'raise', 'T9o': 'raise-passive', 'T9s': 'raise',
    'TT': 'raise',
  },

  // CO-vs-3bet-BB
  'CO-vs-3bet-BB': {
    '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call',
    'A4s': '4bet-bluff', 'A5s': '4bet-bluff', 'A8s': '4bet-bluff', 'A9s': 'call', 'AA': 'all-in', 'AJs': 'call', 'AKo': 'all-in',
    'AKs': 'all-in', 'AQo': 'call', 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'K8s': '4bet-bluff', 'K9s': 'call',
    'KJs': 'call', 'KK': 'all-in', 'KQs': 'call', 'KTs': 'call', 'QJs': 'call', 'QQ': 'all-in', 'QTs': 'call', 'T9s': 'call', 'TT': 'call',
  },

  // CO-vs-3bet-BTN
  'CO-vs-3bet-BTN': {
    '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call', '98s': 'call',
    '99': 'call', 'A4s': '4bet-bluff', 'A5s': '4bet-bluff', 'A6s': 'call', 'A7s': 'call', 'A8s': '4bet-bluff', 'A9s': 'call',
    'AA': 'all-in', 'AJo': 'call', 'AJs': 'call', 'AKo': 'all-in', 'AKs': 'all-in', 'AQo': '4bet-bluff', 'AQs': 'call', 'ATs': 'call',
    'J9s': 'call', 'JJ': 'all-in', 'JTs': 'call', 'K9s': '4bet-bluff', 'KJs': 'call', 'KK': 'all-in', 'KQo': 'call', 'KQs': 'call',
    'KTs': 'call', 'QJs': 'call', 'QQ': 'all-in', 'QTs': 'call', 'T9s': 'call', 'TT': 'call',
  },

  // CO-vs-3bet-SB
  'CO-vs-3bet-SB': {
    '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call', '98s': 'call',
    '99': 'call', 'A4s': '4bet-bluff', 'A5s': '4bet-bluff', 'A8s': '4bet-bluff', 'A9s': 'call', 'AA': 'all-in', 'AJs': 'call',
    'AKo': 'all-in', 'AKs': 'all-in', 'AQo': 'call', 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call',
    'KK': 'all-in', 'KQo': '4bet-bluff', 'KQs': 'call', 'KTs': 'call', 'QJs': 'call', 'QQ': 'all-in', 'QTs': 'call', 'T9s': 'call',
    'TT': 'call',
  },

  // CO-vs-open-UTG
  'CO-vs-open-UTG': {
    '66': 'call-passive', '77': '3bet', '88': '3bet', '99': '3bet', 'A4s': '3bet', 'A5s': '3bet', 'AA': '3bet', 'AJs': '3bet',
    'AKo': '3bet', 'AKs': '3bet', 'AQo': '3bet', 'AQs': '3bet', 'ATs': '3bet', 'JJ': '3bet', 'JTs': '3bet', 'KJs': '3bet', 'KK': '3bet',
    'KQs': '3bet', 'KTs': '3bet', 'QJs': '3bet', 'QQ': '3bet', 'QTs': '3bet', 'T9s': 'call-passive', 'TT': '3bet',
  },

  // MP-RFI
  'MP-RFI': {
    '22': 'raise-passive', '33': 'raise', '44': 'raise', '55': 'raise', '65s': 'raise', '66': 'raise', '76s': 'raise', '77': 'raise',
    '87s': 'raise', '88': 'raise', '98s': 'raise', '99': 'raise', 'A2s': 'raise', 'A3s': 'raise', 'A4s': 'raise', 'A5s': 'raise',
    'A6s': 'raise', 'A7s': 'raise', 'A8s': 'raise', 'A9s': 'raise', 'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise',
    'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATo': 'raise', 'ATs': 'raise', 'J9s': 'raise', 'JJ': 'raise', 'JTs': 'raise',
    'K8s': 'raise', 'K9s': 'raise', 'KJo': 'raise', 'KJs': 'raise', 'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise', 'KTs': 'raise',
    'Q9s': 'raise', 'QJs': 'raise', 'QQ': 'raise', 'QTs': 'raise', 'T8s': 'raise-passive', 'T9s': 'raise', 'TT': 'raise',
  },

  // MP-vs-3bet-BB
  'MP-vs-3bet-BB': {
    '65s': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call', 'A4s': '4bet-bluff', 'A5s': '4bet-bluff',
    'AA': 'all-in', 'AJs': 'call', 'AKo': 'all-in', 'AKs': 'all-in', 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call',
    'KJs': 'call', 'KK': 'all-in', 'KQs': 'call', 'KTs': '4bet-bluff', 'QJs': 'call', 'QQ': 'all-in', 'TT': 'call',
  },

  // MP-vs-3bet-BTN
  'MP-vs-3bet-BTN': {
    '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call', 'A4s': '4bet-bluff',
    'A5s': '4bet-bluff', 'A9s': 'call', 'AA': 'all-in', 'AJs': 'call', 'AKo': 'all-in', 'AKs': 'all-in', 'AQo': '4bet-bluff',
    'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'all-in', 'KQs': 'call', 'KTs': '4bet-bluff',
    'QJs': 'call', 'QQ': 'all-in', 'QTs': 'call', 'T9s': 'call', 'TT': 'call',
  },

  // MP-vs-3bet-CO
  'MP-vs-3bet-CO': {
    '77': 'call', '88': 'call', '99': 'call', 'A4s': '4bet-bluff', 'A5s': '4bet-bluff', 'AA': 'all-in', 'AJs': 'call', 'AKo': 'all-in',
    'AKs': 'all-in', 'AQo': '4bet-bluff', 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'all-in',
    'KQs': 'call', 'KTs': '4bet-bluff', 'QJs': 'call', 'QQ': 'all-in', 'QTs': 'call', 'TT': 'call',
  },

  // MP-vs-3bet-SB
  'MP-vs-3bet-SB': {
    '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call', 'A4s': '4bet-bluff',
    'A5s': '4bet-bluff', 'A9s': 'call', 'AA': 'all-in', 'AJs': 'call', 'AKo': 'call', 'AKs': 'all-in', 'AQs': 'call', 'ATs': 'call',
    'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'all-in', 'KQs': 'call', 'KTs': '4bet-bluff', 'QJs': 'call', 'QQ': 'all-in',
    'QTs': '4bet-bluff', 'T9s': 'call', 'TT': 'call',
  },

  // MP-vs-open-UTG
  'MP-vs-open-UTG': {
    '66': 'call-passive', '77': '3bet', '88': '3bet', '99': '3bet', 'A4s': '3bet', 'A5s': '3bet', 'AA': '3bet', 'AJs': '3bet',
    'AKo': '3bet', 'AKs': '3bet', 'AQo': '3bet', 'AQs': '3bet', 'ATs': '3bet', 'JJ': '3bet', 'JTs': '3bet', 'KJs': '3bet', 'KK': '3bet',
    'KQs': '3bet', 'KTs': '3bet', 'QJs': '3bet', 'QQ': '3bet', 'QTs': '3bet', 'TT': '3bet',
  },

  // SB-RFI
  'SB-RFI': {
    '22': 'raise', '33': 'raise', '43s': 'raise', '44': 'raise', '53s': 'raise', '54s': 'raise', '55': 'raise', '64s': 'raise',
    '65s': 'raise', '66': 'raise', '75s': 'raise', '76s': 'raise', '77': 'raise', '86s': 'raise', '87s': 'raise', '88': 'raise',
    '96s': 'raise', '97s': 'raise', '98o': 'raise', '98s': 'raise', '99': 'raise', 'A2s': 'raise', 'A3s': 'raise', 'A4o': 'raise',
    'A4s': 'raise', 'A5o': 'raise', 'A5s': 'raise', 'A6o': 'raise', 'A6s': 'raise', 'A7o': 'raise', 'A7s': 'raise', 'A8o': 'raise',
    'A8s': 'raise', 'A9o': 'raise', 'A9s': 'raise', 'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise',
    'AQo': 'raise', 'AQs': 'raise', 'ATo': 'raise', 'ATs': 'raise', 'J5s': 'raise', 'J6s': 'raise', 'J7s': 'raise', 'J8o': 'raise',
    'J8s': 'raise', 'J9o': 'raise', 'J9s': 'raise', 'JJ': 'raise', 'JTo': 'raise', 'JTs': 'raise', 'K2s': 'raise', 'K3s': 'raise',
    'K4s': 'raise', 'K5s': 'raise', 'K6s': 'raise', 'K7s': 'raise', 'K8o': 'raise-passive', 'K8s': 'raise', 'K9o': 'raise', 'K9s': 'raise',
    'KJo': 'raise', 'KJs': 'raise', 'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise', 'KTo': 'raise', 'KTs': 'raise', 'Q3s': 'raise',
    'Q4s': 'raise', 'Q5s': 'raise', 'Q6s': 'raise', 'Q7s': 'raise', 'Q8o': 'raise', 'Q8s': 'raise', 'Q9o': 'raise', 'Q9s': 'raise',
    'QJo': 'raise', 'QJs': 'raise', 'QQ': 'raise', 'QTo': 'raise', 'QTs': 'raise', 'T6s': 'raise', 'T7s': 'raise', 'T8o': 'raise',
    'T8s': 'raise', 'T9o': 'raise', 'T9s': 'raise', 'TT': 'raise',
  },

  // SB-vs-3bet-BB
  'SB-vs-3bet-BB': {
    '22': 'call', '33': 'call', '44': 'call', '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call',
    '87s': 'call', '88': 'call', '97s': 'call', '98s': 'call', '99': 'call', 'A2s': '4bet-bluff', 'A3s': 'call', 'A4s': 'call',
    'A5s': 'call', 'A6s': '4bet-bluff', 'A7s': 'call', 'A8s': 'call', 'A9s': 'call', 'AA': 'all-in', 'AJo': '4bet-bluff', 'AJs': 'call',
    'AKo': 'all-in', 'AKs': 'all-in', 'AQo': '4bet-bluff', 'AQs': 'call', 'ATo': 'call', 'ATs': 'call', 'J8s': '4bet-bluff', 'J9s': 'call',
    'JJ': 'all-in', 'JTs': 'call', 'K6s': 'call', 'K7s': 'call', 'K8s': 'call', 'K9s': 'call', 'KJo': 'call', 'KJs': 'call',
    'KK': 'all-in', 'KQo': '4bet-bluff', 'KQs': 'call', 'KTs': 'call', 'Q8s': '4bet-bluff', 'Q9s': 'call', 'QJs': 'call', 'QQ': 'all-in',
    'QTs': 'call', 'T8s': 'call', 'T9s': 'call', 'TT': 'all-in',
  },

  // SB-vs-open-BTN
  'SB-vs-open-BTN': {
    '44': 'call-passive', '55': 'call-passive', '66': 'call-passive', '76s': '3bet', '77': '3bet', '87s': '3bet', '88': '3bet',
    '98s': '3bet', '99': '3bet', 'A2s': '3bet', 'A3s': '3bet', 'A4s': '3bet', 'A5s': '3bet', 'A6s': '3bet', 'A7s': '3bet', 'A8s': '3bet',
    'A9s': '3bet', 'AA': '3bet', 'AJo': '3bet', 'AJs': '3bet', 'AKo': '3bet', 'AKs': '3bet', 'AQo': '3bet', 'AQs': '3bet', 'ATo': '3bet',
    'ATs': '3bet', 'J8s': 'call-passive', 'J9s': '3bet', 'JJ': '3bet', 'JTo': 'call-passive', 'JTs': '3bet', 'K7s': 'call-passive',
    'K8s': 'call-passive', 'K9s': '3bet', 'KJo': 'call-passive', 'KJs': '3bet', 'KK': '3bet', 'KQo': '3bet', 'KQs': '3bet', 'KTs': '3bet',
    'Q7s': 'call-passive', 'Q8s': 'call-passive', 'Q9s': '3bet', 'QJo': 'call-passive', 'QJs': '3bet', 'QQ': '3bet', 'QTs': '3bet',
    'T8s': '3bet', 'T9s': '3bet', 'TT': '3bet',
  },

  // SB-vs-open-CO
  'SB-vs-open-CO': {
    '66': 'call-passive', '76s': 'call-passive', '77': 'call-passive', '86s': 'call-passive', '87s': '3bet', '88': '3bet', '98s': '3bet',
    '99': '3bet', 'A2s': 'call-passive', 'A3s': 'call-passive', 'A4s': '3bet', 'A5s': '3bet', 'A9s': '3bet', 'AA': '3bet', 'AJo': '3bet',
    'AJs': '3bet', 'AKo': '3bet', 'AKs': '3bet', 'AQo': '3bet', 'AQs': '3bet', 'ATs': '3bet', 'J9s': 'call-passive', 'JJ': '3bet',
    'JTs': '3bet', 'K9s': 'call-passive', 'KJs': '3bet', 'KK': '3bet', 'KQo': '3bet', 'KQs': '3bet', 'KTs': '3bet', 'Q9s': 'call-passive',
    'QJs': '3bet', 'QQ': '3bet', 'QTs': '3bet', 'T9s': '3bet', 'TT': '3bet',
  },

  // SB-vs-open-MP
  'SB-vs-open-MP': {
    '76s': '3bet', '87s': '3bet', '88': '3bet', '98s': 'call-passive', '99': '3bet', 'A2s': 'call-passive', 'A3s': 'call-passive',
    'A4s': '3bet', 'A5s': '3bet', 'A9s': 'call-passive', 'AA': '3bet', 'AJs': '3bet', 'AKo': '3bet', 'AKs': '3bet', 'AQo': '3bet',
    'AQs': '3bet', 'ATs': '3bet', 'JJ': '3bet', 'JTs': '3bet', 'KJs': '3bet', 'KK': '3bet', 'KQs': '3bet', 'KTs': '3bet', 'QJs': '3bet',
    'QQ': '3bet', 'QTs': '3bet', 'T9s': 'call-passive', 'TT': '3bet',
  },

  // SB-vs-open-UTG
  'SB-vs-open-UTG': {
    '87s': 'call-passive', '88': 'call-passive', '98s': 'call-passive', '99': '3bet', 'A2s': 'call-passive', 'A3s': 'call-passive',
    'A4s': 'call-passive', 'A5s': '3bet', 'A9s': 'call-passive', 'AA': '3bet', 'AJs': '3bet', 'AKo': '3bet', 'AKs': '3bet', 'AQo': '3bet',
    'AQs': '3bet', 'ATs': '3bet', 'JJ': '3bet', 'JTs': '3bet', 'KJs': '3bet', 'KK': '3bet', 'KQs': '3bet', 'QJs': '3bet', 'QQ': '3bet',
    'T9s': 'call-passive', 'TT': '3bet',
  },

  // UTG-RFI
  'UTG-RFI': {
    '22': 'raise-passive', '33': 'raise-passive', '44': 'raise-passive', '55': 'raise', '66': 'raise', '77': 'raise',
    '87s': 'raise-passive', '88': 'raise', '98s': 'raise', '99': 'raise', 'A2s': 'raise', 'A3s': 'raise', 'A4s': 'raise', 'A5s': 'raise',
    'A6s': 'raise', 'A7s': 'raise', 'A8s': 'raise', 'A9s': 'raise', 'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise',
    'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATo': 'raise-passive', 'ATs': 'raise', 'JJ': 'raise', 'JTs': 'raise', 'KJs': 'raise',
    'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise', 'KTs': 'raise', 'QJs': 'raise', 'QQ': 'raise', 'QTs': 'raise', 'T9s': 'raise',
    'TT': 'raise',
  },

  // UTG-vs-3bet-BB
  'UTG-vs-3bet-BB': {
    '87s': 'call', '88': 'call', '99': 'call', 'A4s': '4bet-bluff', 'A5s': '4bet-bluff', 'AA': 'all-in', 'AJs': 'call', 'AKo': 'all-in',
    'AKs': 'all-in', 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'all-in', 'KQs': 'call',
    'KTs': '4bet-bluff', 'QJs': 'call', 'QQ': 'all-in', 'T9s': 'call', 'TT': 'call',
  },

  // UTG-vs-3bet-BTN
  'UTG-vs-3bet-BTN': {
    '55': 'call', '66': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call', 'A4s': '4bet-bluff', 'A5s': '4bet-bluff',
    'AA': 'all-in', 'AJs': 'call', 'AKo': 'all-in', 'AKs': 'all-in', 'AQo': '4bet-bluff', 'AQs': 'call', 'ATs': 'call', 'JJ': 'call',
    'JTs': 'call', 'KJs': 'call', 'KK': 'all-in', 'KQs': 'call', 'KTs': 'call', 'QJs': 'call', 'QQ': 'all-in', 'QTs': 'call',
    'T9s': 'call', 'TT': 'call',
  },

  // UTG-vs-3bet-CO
  'UTG-vs-3bet-CO': {
    '88': 'call', '99': 'call', 'A5s': '4bet-bluff', 'AA': 'all-in', 'AJs': 'call', 'AKo': 'all-in', 'AKs': 'all-in', 'AQo': '4bet-bluff',
    'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'KJs': 'call', 'KK': 'all-in', 'KQs': 'call', 'KTs': 'call', 'QJs': 'call', 'QQ': 'all-in',
    'TT': 'call',
  },

  // UTG-vs-3bet-MP
  'UTG-vs-3bet-MP': {
    '99': 'call', 'A5s': '4bet-bluff', 'AA': 'all-in', 'AJs': 'call', 'AKo': 'all-in', 'AKs': 'all-in', 'AQo': '4bet-bluff', 'AQs': 'call',
    'ATs': 'call', 'JJ': 'call', 'KJs': 'call', 'KK': 'all-in', 'KQs': 'call', 'KTs': 'call', 'QQ': 'all-in', 'TT': 'call',
  },

  // UTG-vs-3bet-SB
  'UTG-vs-3bet-SB': {
    '66': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call', 'A4s': '4bet-bluff', 'A5s': '4bet-bluff', 'AA': 'all-in',
    'AJs': 'call', 'AKo': 'call', 'AKs': 'all-in', 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call',
    'KK': 'all-in', 'KQs': 'call', 'KTs': '4bet-bluff', 'QJs': 'call', 'QQ': 'all-in', 'T9s': 'call', 'TT': 'call',
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
