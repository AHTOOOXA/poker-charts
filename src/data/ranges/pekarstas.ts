import type { Chart } from './index'

export const charts: Record<string, Chart> = {
  'BB-vs-4bet-BTN': {
    '54s': 'fold', '65s': 'fold', '76s': 'fold', '77': 'allin', '86s': 'fold', '87s': 'fold', '88': 'allin',
    '97s': 'fold', '98s': 'call', '99': 'allin', 'A4s': 'fold', 'A5s': 'fold', 'AA': 'allin', 'AJo': 'fold',
    'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': 'fold', 'AQs': 'call', 'ATs': 'call', 'J9s': 'fold',
    'JJ': 'allin', 'JTs': 'call', 'KJs': 'call', 'KK': 'allin', 'KQs': 'call', 'KTs': 'fold', 'QJs': 'fold',
    'QQ': 'allin', 'QTs': 'fold', 'T8s': 'fold', 'T9s': 'call', 'TT': 'call',
  },

  'BB-vs-4bet-CO': {
    '65s': 'fold', '76s': 'call', '87s': 'call', '88': 'allin', '98s': 'call', '99': 'allin', 'A4s': 'fold',
    'A5s': 'fold', 'AA': 'allin', 'AJo': 'fold', 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': 'fold',
    'AQs': 'call', 'ATs': 'fold', 'JJ': 'allin', 'JTs': 'fold', 'KJs': 'fold', 'KK': 'allin', 'KQo': 'fold',
    'KQs': 'call', 'KTs': 'fold', 'QJs': 'fold', 'QQ': 'allin', 'QTs': 'fold', 'TT': 'call',
  },

  'BB-vs-4bet-MP': {
    '54s': 'fold', '65s': 'fold', '76s': 'fold', '87s': 'fold', 'A4s': 'fold', 'A5s': 'fold', 'AA': 'allin',
    'AJs': 'fold', 'AKo': 'call', 'AKs': 'allin', 'AQs': 'fold', 'ATs': 'fold', 'JJ': 'call', 'KJs': 'fold',
    'KK': 'allin', 'KQs': 'fold', 'QJs': 'fold', 'QQ': 'call', 'TT': 'call',
  },

  'BB-vs-4bet-SB': {
    '54s': 'call', '64s': 'fold', '65s': 'call', '66': 'allin', '75s': 'fold', '76s': 'call', '77': 'allin',
    '85s': 'fold', '86s': 'fold', '87s': 'call', '88': 'allin', '96s': 'fold', '97s': 'fold', '98o': 'fold',
    '98s': 'fold', '99': 'call', 'A2o': 'fold', 'A2s': 'fold', 'A3o': 'fold', 'A3s': 'fold', 'A4o': 'fold',
    'A4s': 'fold', 'A5o': 'fold', 'A5s': 'fold', 'AA': 'call', 'AJo': 'fold', 'AJs': 'call', 'AKo': 'allin',
    'AKs': 'allin', 'AQo': 'call', 'AQs': 'call', 'ATs': 'call', 'JJ': 'allin', 'JTs': 'call', 'K4o': 'fold',
    'KJs': 'call', 'KK': 'allin', 'KQo': 'fold', 'KQs': 'call', 'KTs': 'fold', 'QJs': 'call', 'QQ': 'allin',
    'QTs': 'fold', 'T6s': 'fold', 'T7s': 'fold', 'T9s': 'call', 'TT': 'call',
  },

  'BB-vs-4bet-UTG': {
    '54s': 'fold', '65s': 'fold', '76s': 'fold', '87s': 'fold', 'A4s': 'fold', 'A5s': 'fold', 'AA': 'allin',
    'AJs': 'fold', 'AKo': 'call', 'AKs': 'allin', 'AQs': 'fold', 'ATs': 'fold', 'JJ': 'call', 'KJs': 'fold',
    'KK': 'allin', 'KQs': 'fold', 'QJs': 'fold', 'QQ': 'call', 'TT': 'call',
  },

  'BB-vs-open-BTN': {
    '22': 'call', '32s': 'call', '33': 'call', '42s': 'call', '43s': 'call', '44': 'call', '52s': 'call',
    '53s': 'call', '54s': 'raise', '55': 'call', '63s': 'call', '64s': 'call', '65s': 'raise', '66': 'call',
    '74s': 'call', '75s': 'call', '76o': 'call', '76s': 'raise', '77': 'allin', '85s': 'call', '86s': 'raise',
    '87o': 'call', '87s': 'raise', '88': 'allin', '95s': 'call', '96s': 'call', '97s': 'raise', '98o': 'call',
    '98s': 'raise', '99': 'allin', 'A2o': 'call', 'A2s': 'call', 'A3o': 'call', 'A3s': 'call', 'A4o': 'call',
    'A4s': 'raise', 'A5o': 'call', 'A5s': 'raise', 'A6o': 'call', 'A6s': 'call', 'A7o': 'call', 'A7s': 'call',
    'A8o': 'call', 'A8s': 'call', 'A9o': 'call', 'A9s': 'call', 'AA': 'allin', 'AJo': 'raise', 'AJs': 'raise',
    'AKo': 'allin', 'AKs': 'allin', 'AQo': 'raise', 'AQs': 'raise', 'ATo': 'call', 'ATs': 'raise', 'J2s': 'call',
    'J3s': 'call', 'J4s': 'call', 'J5s': 'call', 'J6s': 'call', 'J7s': 'call', 'J8o': 'call', 'J8s': 'call',
    'J9o': 'call', 'J9s': 'raise', 'JJ': 'allin', 'JTo': 'call', 'JTs': 'raise', 'K2s': 'call', 'K3s': 'call',
    'K4s': 'call', 'K5s': 'call', 'K6s': 'call', 'K7o': 'call', 'K7s': 'call', 'K8o': 'call', 'K8s': 'call',
    'K9o': 'call', 'K9s': 'call', 'KJo': 'call', 'KJs': 'raise', 'KK': 'allin', 'KQo': 'call', 'KQs': 'raise',
    'KTo': 'call', 'KTs': 'raise', 'Q2s': 'call', 'Q3s': 'call', 'Q4s': 'call', 'Q5s': 'call', 'Q6s': 'call',
    'Q7s': 'call', 'Q8o': 'call', 'Q8s': 'call', 'Q9o': 'call', 'Q9s': 'call', 'QJo': 'call', 'QJs': 'raise',
    'QQ': 'allin', 'QTo': 'call', 'QTs': 'raise', 'T4s': 'call', 'T5s': 'call', 'T6s': 'call', 'T7s': 'call',
    'T8o': 'call', 'T8s': 'raise', 'T9o': 'call', 'T9s': 'raise', 'TT': 'raise',
  },

  'BB-vs-open-CO': {
    '22': 'call', '33': 'call', '43s': 'call', '44': 'call', '53s': 'call', '54s': 'call', '55': 'call', '63s': 'call',
    '64s': 'call', '65s': 'raise', '66': 'call', '74s': 'call', '75s': 'call', '76s': 'raise', '77': 'call',
    '84s': 'call', '85s': 'call', '86s': 'call', '87s': 'raise', '88': 'allin', '95s': 'call', '96s': 'call',
    '97s': 'call', '98s': 'raise', '99': 'allin', 'A2s': 'call', 'A3s': 'call', 'A4s': 'raise', 'A5s': 'raise',
    'A6s': 'call', 'A7s': 'call', 'A8o': 'call', 'A8s': 'call', 'A9o': 'call', 'A9s': 'call', 'AA': 'allin',
    'AJo': 'raise', 'AJs': 'raise', 'AKo': 'allin', 'AKs': 'allin', 'AQo': 'raise', 'AQs': 'raise', 'ATo': 'call',
    'ATs': 'raise', 'J2s': 'call', 'J3s': 'call', 'J4s': 'call', 'J5s': 'call', 'J6s': 'call', 'J7s': 'call',
    'J8s': 'call', 'J9s': 'call', 'JJ': 'allin', 'JTs': 'raise', 'K2s': 'call', 'K3s': 'call', 'K4s': 'call',
    'K5s': 'call', 'K6s': 'call', 'K7s': 'call', 'K8s': 'call', 'K9s': 'call', 'KJo': 'call', 'KJs': 'raise',
    'KK': 'allin', 'KQo': 'raise', 'KQs': 'raise', 'KTo': 'call', 'KTs': 'raise', 'Q2s': 'call', 'Q3s': 'call',
    'Q4s': 'call', 'Q5s': 'call', 'Q6s': 'call', 'Q7s': 'call', 'Q8s': 'call', 'Q9s': 'call', 'QJo': 'call',
    'QJs': 'raise', 'QQ': 'allin', 'QTo': 'call', 'QTs': 'raise', 'T7s': 'call', 'T8s': 'call', 'T9s': 'call',
    'TT': 'raise',
  },

  'BB-vs-open-MP': {
    '22': 'call', '33': 'call', '43s': 'call', '44': 'call', '53s': 'call', '54s': 'raise', '55': 'call',
    '64s': 'call', '65s': 'raise', '66': 'call', '75s': 'call', '76s': 'raise', '77': 'call', '86s': 'call',
    '87s': 'raise', '88': 'call', '96s': 'call', '97s': 'call', '98s': 'call', '99': 'call', 'A2s': 'call',
    'A3s': 'call', 'A4s': 'raise', 'A5s': 'raise', 'A6s': 'call', 'A7s': 'call', 'A8s': 'call', 'A9s': 'call',
    'AA': 'allin', 'AJo': 'call', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'allin', 'AQo': 'call', 'AQs': 'raise',
    'ATo': 'call', 'ATs': 'raise', 'J8s': 'call', 'J9s': 'call', 'JJ': 'raise', 'JTs': 'call', 'K2s': 'call',
    'K3s': 'call', 'K4s': 'call', 'K5s': 'call', 'K6s': 'call', 'K7s': 'call', 'K8s': 'call', 'K9s': 'call',
    'KJo': 'call', 'KJs': 'raise', 'KK': 'allin', 'KQo': 'call', 'KQs': 'raise', 'KTs': 'call', 'Q7s': 'call',
    'Q8s': 'call', 'Q9s': 'call', 'QJo': 'call', 'QJs': 'raise', 'QQ': 'raise', 'QTs': 'call', 'T7s': 'call',
    'T8s': 'call', 'T9s': 'call', 'TT': 'raise',
  },

  'BB-vs-open-SB': {
    '22': 'call', '32s': 'call', '33': 'call', '42s': 'call', '43s': 'call', '44': 'call', '52s': 'call',
    '53s': 'call', '54o': 'call', '54s': 'raise', '55': 'call', '62s': 'call', '63s': 'call', '64s': 'raise',
    '65o': 'call', '65s': 'raise', '66': 'allin', '72s': 'call', '73s': 'call', '74s': 'call', '75o': 'call',
    '75s': 'raise', '76o': 'call', '76s': 'raise', '77': 'allin', '82s': 'call', '83s': 'call', '84s': 'call',
    '85s': 'raise', '86o': 'call', '86s': 'raise', '87o': 'call', '87s': 'raise', '88': 'allin', '92s': 'call',
    '93s': 'call', '94s': 'call', '95s': 'call', '96s': 'raise', '97o': 'call', '97s': 'raise', '98o': 'raise',
    '98s': 'raise', '99': 'raise', 'A2o': 'raise', 'A2s': 'raise', 'A3o': 'raise', 'A3s': 'raise', 'A4o': 'raise',
    'A4s': 'raise', 'A5o': 'raise', 'A5s': 'raise', 'A6o': 'call', 'A6s': 'call', 'A7o': 'call', 'A7s': 'call',
    'A8o': 'call', 'A8s': 'call', 'A9o': 'call', 'A9s': 'call', 'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise',
    'AKo': 'allin', 'AKs': 'allin', 'AQo': 'raise', 'AQs': 'raise', 'ATo': 'call', 'ATs': 'raise', 'J2s': 'call',
    'J3s': 'call', 'J4s': 'call', 'J5s': 'call', 'J6s': 'call', 'J7o': 'call', 'J7s': 'call', 'J8o': 'call',
    'J8s': 'call', 'J9o': 'call', 'J9s': 'call', 'JJ': 'allin', 'JTo': 'call', 'JTs': 'raise', 'K2s': 'call',
    'K3s': 'call', 'K4o': 'raise', 'K4s': 'call', 'K5o': 'call', 'K5s': 'call', 'K6o': 'call', 'K6s': 'call',
    'K7o': 'call', 'K7s': 'call', 'K8o': 'call', 'K8s': 'call', 'K9o': 'call', 'K9s': 'call', 'KJo': 'call',
    'KJs': 'raise', 'KK': 'allin', 'KQo': 'raise', 'KQs': 'raise', 'KTo': 'call', 'KTs': 'raise', 'Q2s': 'call',
    'Q3s': 'call', 'Q4s': 'call', 'Q5s': 'call', 'Q6o': 'call', 'Q6s': 'call', 'Q7o': 'call', 'Q7s': 'call',
    'Q8o': 'call', 'Q8s': 'call', 'Q9o': 'call', 'Q9s': 'call', 'QJo': 'call', 'QJs': 'raise', 'QQ': 'allin',
    'QTo': 'call', 'QTs': 'raise', 'T2s': 'call', 'T3s': 'call', 'T4s': 'call', 'T5s': 'call', 'T6s': 'raise',
    'T7o': 'call', 'T7s': 'raise', 'T8o': 'call', 'T8s': 'call', 'T9o': 'call', 'T9s': 'raise', 'TT': 'raise',
  },

  'BB-vs-open-UTG': {
    '22': 'call', '33': 'call', '43s': 'call', '44': 'call', '53s': 'call', '54s': 'raise', '55': 'call',
    '64s': 'call', '65s': 'raise', '66': 'call', '75s': 'call', '76s': 'raise', '77': 'call', '86s': 'call',
    '87s': 'raise', '88': 'call', '96s': 'call', '97s': 'call', '98s': 'call', '99': 'call', 'A2s': 'call',
    'A3s': 'call', 'A4s': 'raise', 'A5s': 'raise', 'A6s': 'call', 'A7s': 'call', 'A8s': 'call', 'A9s': 'call',
    'AA': 'allin', 'AJo': 'call', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'allin', 'AQo': 'call', 'AQs': 'raise',
    'ATo': 'call', 'ATs': 'raise', 'J8s': 'call', 'J9s': 'call', 'JJ': 'raise', 'JTo': 'call', 'JTs': 'call',
    'K2s': 'call', 'K3s': 'call', 'K4s': 'call', 'K5s': 'call', 'K6s': 'call', 'K7s': 'call', 'K8s': 'call',
    'K9s': 'call', 'KJo': 'call', 'KJs': 'raise', 'KK': 'allin', 'KQo': 'call', 'KQs': 'raise', 'KTs': 'call',
    'Q8s': 'call', 'Q9s': 'call', 'QJo': 'call', 'QJs': 'raise', 'QQ': 'raise', 'QTo': 'call', 'QTs': 'call',
    'T7s': 'call', 'T8s': 'call', 'T9s': 'call', 'TT': 'raise',
  },

  'BTN-RFI': {
    '22': 'raise', '33': 'raise', '43s': ['raise', 'fold'], '44': 'raise', '53s': ['raise', 'fold'], '54s': 'raise',
    '55': 'raise', '63s': ['raise', 'fold'], '64s': 'raise', '65s': 'raise', '66': 'raise', '74s': ['raise', 'fold'],
    '75s': 'raise', '76s': 'raise', '77': 'raise', '85s': ['raise', 'fold'], '86s': 'raise', '87s': 'raise',
    '88': 'raise', '96s': 'raise', '97s': 'raise', '98o': 'raise', '98s': 'raise', '99': 'raise', 'A2s': 'raise',
    'A3s': 'raise', 'A4o': 'raise', 'A4s': 'raise', 'A5o': 'raise', 'A5s': 'raise', 'A6o': 'raise', 'A6s': 'raise',
    'A7o': 'raise', 'A7s': 'raise', 'A8o': 'raise', 'A8s': 'raise', 'A9o': 'raise', 'A9s': 'raise', 'AA': 'raise',
    'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATo': 'raise',
    'ATs': 'raise', 'J5s': 'raise', 'J6s': 'raise', 'J7s': 'raise', 'J8o': 'raise', 'J8s': 'raise', 'J9o': 'raise',
    'J9s': 'raise', 'JJ': 'raise', 'JTo': 'raise', 'JTs': 'raise', 'K2s': 'raise', 'K3s': 'raise', 'K4s': 'raise',
    'K5s': 'raise', 'K6s': 'raise', 'K7s': 'raise', 'K8o': ['raise', 'fold'], 'K8s': 'raise', 'K9o': 'raise',
    'K9s': 'raise', 'KJo': 'raise', 'KJs': 'raise', 'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise', 'KTo': 'raise',
    'KTs': 'raise', 'Q2s': 'raise', 'Q3s': 'raise', 'Q4s': 'raise', 'Q5s': 'raise', 'Q6s': 'raise', 'Q7s': 'raise',
    'Q8o': 'raise', 'Q8s': 'raise', 'Q9o': 'raise', 'Q9s': 'raise', 'QJo': 'raise', 'QJs': 'raise', 'QQ': 'raise',
    'QTo': 'raise', 'QTs': 'raise', 'T6s': 'raise', 'T7s': 'raise', 'T8o': 'raise', 'T8s': 'raise', 'T9o': 'raise',
    'T9s': 'raise', 'TT': 'raise',
  },

  'BTN-vs-3bet-BB': {
    '22': 'call', '33': 'call', '44': 'call', '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call',
    '77': 'call', '87s': 'call', '88': 'call', '98s': 'call', '99': 'call', 'A2s': ['raise', 'fold'],
    'A3s': ['raise', 'fold'], 'A4s': 'call', 'A5s': 'call', 'A6s': 'call', 'A7s': 'call', 'A8s': 'call', 'A9s': 'call',
    'AA': 'allin', 'AJo': ['raise', 'fold'], 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': 'call',
    'AQs': 'call', 'ATo': 'call', 'ATs': 'call', 'J8s': 'call', 'J9s': 'call', 'JJ': 'allin', 'JTs': 'call',
    'K6s': ['raise', 'fold'], 'K7s': ['raise', 'fold'], 'K8s': 'call', 'K9s': 'call', 'KJs': 'call', 'KK': 'allin',
    'KQo': ['raise', 'fold'], 'KQs': 'call', 'KTs': 'call', 'Q9s': 'call', 'QJs': 'call', 'QQ': 'allin', 'QTs': 'call',
    'T8s': 'call', 'T9s': 'call', 'TT': 'call',
  },

  'BTN-vs-3bet-SB': {
    '22': 'call', '33': 'call', '44': 'call', '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call',
    '77': 'call', '87s': 'call', '88': 'call', '97s': 'call', '98s': 'call', '99': 'call', 'A2s': ['raise', 'fold'],
    'A3s': ['raise', 'fold'], 'A4s': 'call', 'A5s': 'call', 'A6s': 'call', 'A7s': ['raise', 'fold'], 'A8s': 'call',
    'A9s': 'call', 'AA': 'allin', 'AJo': ['raise', 'fold'], 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin',
    'AQo': 'call', 'AQs': 'call', 'ATo': 'call', 'ATs': 'call', 'J8s': 'call', 'J9s': 'call', 'JJ': 'allin',
    'JTs': 'call', 'K6s': ['raise', 'fold'], 'K7s': ['raise', 'fold'], 'K8s': 'call', 'K9s': 'call', 'KJs': 'call',
    'KK': 'allin', 'KQo': ['raise', 'fold'], 'KQs': 'call', 'KTs': 'call', 'Q8s': 'call', 'Q9s': 'call', 'QJs': 'call',
    'QQ': 'allin', 'QTs': 'call', 'T8s': 'call', 'T9s': 'call', 'TT': 'call',
  },

  'BTN-vs-4bet-CO': {
    '66': ['call', 'fold'], '76s': 'call', '77': 'allin', '87s': 'call', '88': 'allin', '98s': 'call', '99': 'allin',
    'A5s': 'allin', 'A7s': ['call', 'fold'], 'A8s': ['call', 'fold'], 'A9s': ['call', 'fold'], 'AA': 'allin',
    'AJo': ['call', 'fold'], 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': ['call', 'fold'], 'AQs': 'call',
    'ATs': 'call', 'J9s': ['call', 'fold'], 'JJ': 'call', 'JTs': 'call', 'K9s': ['call', 'fold'], 'KJs': 'call',
    'KK': 'allin', 'KQo': ['call', 'fold'], 'KQs': 'call', 'KTs': 'call', 'Q9s': ['call', 'fold'], 'QJs': 'call',
    'QQ': 'allin', 'QTs': 'call', 'T8s': ['call', 'fold'], 'T9s': 'call', 'TT': 'call',
  },

  'BTN-vs-4bet-UTG': {
    '76s': 'call', '77': ['call', 'fold'], '87s': 'call', '88': ['call', 'fold'], '98s': 'call',
    '99': ['call', 'fold'], 'A2s': ['call', 'fold'], 'A3s': ['call', 'fold'], 'A4s': ['call', 'fold'],
    'A5s': ['call', 'fold'], 'AA': 'call', 'AJs': 'call', 'AKo': 'call', 'AKs': 'call', 'AQo': ['call', 'fold'],
    'AQs': 'call', 'ATs': ['call', 'fold'], 'JJ': 'call', 'JTs': ['call', 'fold'], 'KJs': ['call', 'fold'],
    'KK': 'call', 'KQs': ['call', 'fold'], 'KTs': ['call', 'fold'], 'QJs': ['call', 'fold'], 'QQ': 'call',
    'QTs': ['call', 'fold'], 'T9s': 'call', 'TT': 'call',
  },

  'BTN-vs-open-CO': {
    '44': ['call', 'fold'], '55': ['call', 'fold'], '66': 'raise', '76s': 'raise', '77': 'raise', '87s': 'raise',
    '88': 'raise', '98s': 'raise', '99': 'raise', 'A5s': 'raise', 'A7s': 'raise', 'A8s': 'raise', 'A9s': 'raise',
    'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise',
    'ATs': 'raise', 'J9s': 'raise', 'JJ': 'raise', 'JTs': 'raise', 'K9s': 'raise', 'KJs': 'raise', 'KK': 'raise',
    'KQo': 'raise', 'KQs': 'raise', 'KTs': 'raise', 'Q9s': 'raise', 'QJs': 'raise', 'QQ': 'raise', 'QTs': 'raise',
    'T8s': 'raise', 'T9s': 'raise', 'TT': 'raise',
  },

  'BTN-vs-open-UTG': {
    '55': ['call', 'fold'], '66': ['call', 'fold'], '76s': 'raise', '77': 'raise', '87s': 'raise', '88': 'raise',
    '98s': 'raise', '99': 'raise', 'A2s': 'raise', 'A3s': 'raise', 'A4s': 'raise', 'A5s': 'raise', 'AA': 'raise',
    'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATs': 'raise', 'JJ': 'raise',
    'JTs': 'raise', 'KJs': 'raise', 'KK': 'raise', 'KQs': 'raise', 'KTs': 'raise', 'QJs': 'raise', 'QQ': 'raise',
    'QTs': 'raise', 'T9s': 'raise', 'TT': 'raise',
  },

  'CO-RFI': {
    '22': 'raise', '33': 'raise', '44': 'raise', '54s': 'raise', '55': 'raise', '64s': 'raise', '65s': 'raise',
    '66': 'raise', '75s': 'raise', '76s': 'raise', '77': 'raise', '86s': 'raise', '87s': 'raise', '88': 'raise',
    '97s': 'raise', '98s': 'raise', '99': 'raise', 'A2s': 'raise', 'A3s': 'raise', 'A4s': 'raise', 'A5s': 'raise',
    'A6s': 'raise', 'A7s': 'raise', 'A8s': 'raise', 'A9o': ['raise', 'fold'], 'A9s': 'raise', 'AA': 'raise',
    'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATo': 'raise',
    'ATs': 'raise', 'J7s': 'raise', 'J8s': 'raise', 'J9s': 'raise', 'JJ': 'raise', 'JTo': 'raise', 'JTs': 'raise',
    'K5s': ['raise', 'fold'], 'K6s': 'raise', 'K7s': 'raise', 'K8s': 'raise', 'K9s': 'raise', 'KJo': 'raise',
    'KJs': 'raise', 'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise', 'KTo': 'raise', 'KTs': 'raise', 'Q8s': 'raise',
    'Q9s': 'raise', 'QJo': 'raise', 'QJs': 'raise', 'QQ': 'raise', 'QTo': 'raise', 'QTs': 'raise', 'T7s': 'raise',
    'T8s': 'raise', 'T9o': ['raise', 'fold'], 'T9s': 'raise', 'TT': 'raise',
  },

  'CO-vs-3bet-BB': {
    '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call',
    '99': 'call', 'A4s': ['raise', 'fold'], 'A5s': ['raise', 'fold'], 'A8s': ['raise', 'fold'], 'A9s': 'call',
    'AA': 'allin', 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': 'call', 'AQs': 'call', 'ATs': 'call',
    'JJ': 'call', 'JTs': 'call', 'K8s': ['raise', 'fold'], 'K9s': 'call', 'KJs': 'call', 'KK': 'allin', 'KQs': 'call',
    'KTs': 'call', 'QJs': 'call', 'QQ': 'allin', 'QTs': 'call', 'T9s': 'call', 'TT': 'call',
  },

  'CO-vs-3bet-BTN': {
    '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call',
    '98s': 'call', '99': 'call', 'A4s': ['raise', 'fold'], 'A5s': ['raise', 'fold'], 'A6s': 'call', 'A7s': 'call',
    'A8s': ['raise', 'fold'], 'A9s': 'call', 'AA': 'allin', 'AJo': 'call', 'AJs': 'call', 'AKo': 'allin',
    'AKs': 'allin', 'AQo': ['raise', 'fold'], 'AQs': 'call', 'ATs': 'call', 'J9s': 'call', 'JJ': 'allin',
    'JTs': 'call', 'K9s': ['raise', 'fold'], 'KJs': 'call', 'KK': 'allin', 'KQo': 'call', 'KQs': 'call', 'KTs': 'call',
    'QJs': 'call', 'QQ': 'allin', 'QTs': 'call', 'T9s': 'call', 'TT': 'call',
  },

  'CO-vs-3bet-SB': {
    '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call',
    '98s': 'call', '99': 'call', 'A4s': ['raise', 'fold'], 'A5s': ['raise', 'fold'], 'A8s': ['raise', 'fold'],
    'A9s': 'call', 'AA': 'allin', 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': 'call', 'AQs': 'call',
    'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'allin', 'KQo': ['raise', 'fold'], 'KQs': 'call',
    'KTs': 'call', 'QJs': 'call', 'QQ': 'allin', 'QTs': 'call', 'T9s': 'call', 'TT': 'call',
  },

  'CO-vs-4bet-UTG': {
    '77': ['call', 'fold'], '88': ['call', 'fold'], '99': ['call', 'fold'], 'A4s': ['call', 'fold'],
    'A5s': ['call', 'fold'], 'AA': 'call', 'AJs': 'call', 'AKo': 'call', 'AKs': 'call', 'AQo': ['call', 'fold'],
    'AQs': 'call', 'ATs': ['call', 'fold'], 'JJ': 'call', 'JTs': ['call', 'fold'], 'KJs': ['call', 'fold'],
    'KK': 'call', 'KQs': ['call', 'fold'], 'KTs': ['call', 'fold'], 'QJs': ['call', 'fold'], 'QQ': 'call',
    'QTs': ['call', 'fold'], 'TT': 'call',
  },

  'CO-vs-open-UTG': {
    '66': ['call', 'fold'], '77': 'raise', '88': 'raise', '99': 'raise', 'A4s': 'raise', 'A5s': 'raise', 'AA': 'raise',
    'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATs': 'raise', 'JJ': 'raise',
    'JTs': 'raise', 'KJs': 'raise', 'KK': 'raise', 'KQs': 'raise', 'KTs': 'raise', 'QJs': 'raise', 'QQ': 'raise',
    'QTs': 'raise', 'T9s': ['call', 'fold'], 'TT': 'raise',
  },

  'MP-RFI': {
    '22': ['raise', 'fold'], '33': 'raise', '44': 'raise', '55': 'raise', '65s': 'raise', '66': 'raise',
    '76s': 'raise', '77': 'raise', '87s': 'raise', '88': 'raise', '98s': 'raise', '99': 'raise', 'A2s': 'raise',
    'A3s': 'raise', 'A4s': 'raise', 'A5s': 'raise', 'A6s': 'raise', 'A7s': 'raise', 'A8s': 'raise', 'A9s': 'raise',
    'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise',
    'ATo': 'raise', 'ATs': 'raise', 'J9s': 'raise', 'JJ': 'raise', 'JTs': 'raise', 'K8s': 'raise', 'K9s': 'raise',
    'KJo': 'raise', 'KJs': 'raise', 'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise', 'KTs': 'raise', 'Q9s': 'raise',
    'QJs': 'raise', 'QQ': 'raise', 'QTs': 'raise', 'T8s': ['raise', 'fold'], 'T9s': 'raise', 'TT': 'raise',
  },

  'MP-vs-3bet-BB': {
    '65s': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call', 'A4s': ['raise', 'fold'],
    'A5s': ['raise', 'fold'], 'AA': 'allin', 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQs': 'call',
    'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'allin', 'KQs': 'call', 'KTs': ['raise', 'fold'],
    'QJs': 'call', 'QQ': 'allin', 'TT': 'call',
  },

  'MP-vs-3bet-BTN': {
    '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call',
    'A4s': ['raise', 'fold'], 'A5s': ['raise', 'fold'], 'A9s': 'call', 'AA': 'allin', 'AJs': 'call', 'AKo': 'allin',
    'AKs': 'allin', 'AQo': ['raise', 'fold'], 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call',
    'KK': 'allin', 'KQs': 'call', 'KTs': ['raise', 'fold'], 'QJs': 'call', 'QQ': 'allin', 'QTs': 'call', 'T9s': 'call',
    'TT': 'call',
  },

  'MP-vs-3bet-CO': {
    '77': 'call', '88': 'call', '99': 'call', 'A4s': ['raise', 'fold'], 'A5s': ['raise', 'fold'], 'AA': 'allin',
    'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': ['raise', 'fold'], 'AQs': 'call', 'ATs': 'call',
    'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'allin', 'KQs': 'call', 'KTs': ['raise', 'fold'], 'QJs': 'call',
    'QQ': 'allin', 'QTs': 'call', 'TT': 'call',
  },

  'MP-vs-3bet-SB': {
    '55': 'call', '65s': 'call', '66': 'call', '76s': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call',
    'A4s': ['raise', 'fold'], 'A5s': ['raise', 'fold'], 'A9s': 'call', 'AA': 'allin', 'AJs': 'call', 'AKo': 'call',
    'AKs': 'allin', 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'allin',
    'KQs': 'call', 'KTs': ['raise', 'fold'], 'QJs': 'call', 'QQ': 'allin', 'QTs': ['raise', 'fold'], 'T9s': 'call',
    'TT': 'call',
  },

  'MP-vs-4bet-UTG': {
    '77': ['call', 'fold'], '88': ['call', 'fold'], '99': ['call', 'fold'], 'A4s': ['call', 'fold'],
    'A5s': ['call', 'fold'], 'AA': 'call', 'AJs': ['call', 'fold'], 'AKo': 'call', 'AKs': 'call',
    'AQo': ['call', 'fold'], 'AQs': 'call', 'ATs': ['call', 'fold'], 'JJ': 'call', 'JTs': ['call', 'fold'],
    'KJs': ['call', 'fold'], 'KK': 'call', 'KQs': ['call', 'fold'], 'KTs': ['call', 'fold'], 'QJs': ['call', 'fold'],
    'QQ': 'call', 'QTs': ['call', 'fold'], 'TT': ['call', 'fold'],
  },

  'MP-vs-open-UTG': {
    '66': ['call', 'fold'], '77': 'raise', '88': 'raise', '99': 'raise', 'A4s': 'raise', 'A5s': 'raise', 'AA': 'raise',
    'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATs': 'raise', 'JJ': 'raise',
    'JTs': 'raise', 'KJs': 'raise', 'KK': 'raise', 'KQs': 'raise', 'KTs': 'raise', 'QJs': 'raise', 'QQ': 'raise',
    'QTs': 'raise', 'TT': 'raise',
  },

  'SB-RFI': {
    '22': 'raise', '33': 'raise', '43s': 'raise', '44': 'raise', '53s': 'raise', '54s': 'raise', '55': 'raise',
    '64s': 'raise', '65s': 'raise', '66': 'raise', '75s': 'raise', '76s': 'raise', '77': 'raise', '86s': 'raise',
    '87s': 'raise', '88': 'raise', '96s': 'raise', '97s': 'raise', '98o': 'raise', '98s': 'raise', '99': 'raise',
    'A2s': 'raise', 'A3s': 'raise', 'A4o': 'raise', 'A4s': 'raise', 'A5o': 'raise', 'A5s': 'raise', 'A6o': 'raise',
    'A6s': 'raise', 'A7o': 'raise', 'A7s': 'raise', 'A8o': 'raise', 'A8s': 'raise', 'A9o': 'raise', 'A9s': 'raise',
    'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise',
    'ATo': 'raise', 'ATs': 'raise', 'J5s': 'raise', 'J6s': 'raise', 'J7s': 'raise', 'J8o': 'raise', 'J8s': 'raise',
    'J9o': 'raise', 'J9s': 'raise', 'JJ': 'raise', 'JTo': 'raise', 'JTs': 'raise', 'K2s': 'raise', 'K3s': 'raise',
    'K4s': 'raise', 'K5s': 'raise', 'K6s': 'raise', 'K7s': 'raise', 'K8o': ['raise', 'fold'], 'K8s': 'raise',
    'K9o': 'raise', 'K9s': 'raise', 'KJo': 'raise', 'KJs': 'raise', 'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise',
    'KTo': 'raise', 'KTs': 'raise', 'Q3s': 'raise', 'Q4s': 'raise', 'Q5s': 'raise', 'Q6s': 'raise', 'Q7s': 'raise',
    'Q8o': 'raise', 'Q8s': 'raise', 'Q9o': 'raise', 'Q9s': 'raise', 'QJo': 'raise', 'QJs': 'raise', 'QQ': 'raise',
    'QTo': 'raise', 'QTs': 'raise', 'T6s': 'raise', 'T7s': 'raise', 'T8o': 'raise', 'T8s': 'raise', 'T9o': 'raise',
    'T9s': 'raise', 'TT': 'raise',
  },

  'SB-vs-3bet-BB': {
    '22': 'call', '33': 'call', '44': 'call', '54s': 'call', '55': 'call', '65s': 'call', '66': 'call', '76s': 'call',
    '77': 'call', '87s': 'call', '88': 'call', '97s': 'call', '98s': 'call', '99': 'call', 'A2s': ['raise', 'fold'],
    'A3s': 'call', 'A4s': 'call', 'A5s': 'call', 'A6s': ['raise', 'fold'], 'A7s': 'call', 'A8s': 'call', 'A9s': 'call',
    'AA': 'allin', 'AJo': ['raise', 'fold'], 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': ['raise', 'fold'],
    'AQs': 'call', 'ATo': 'call', 'ATs': 'call', 'J8s': ['raise', 'fold'], 'J9s': 'call', 'JJ': 'allin', 'JTs': 'call',
    'K6s': 'call', 'K7s': 'call', 'K8s': 'call', 'K9s': 'call', 'KJo': 'call', 'KJs': 'call', 'KK': 'allin',
    'KQo': ['raise', 'fold'], 'KQs': 'call', 'KTs': 'call', 'Q8s': ['raise', 'fold'], 'Q9s': 'call', 'QJs': 'call',
    'QQ': 'allin', 'QTs': 'call', 'T8s': 'call', 'T9s': 'call', 'TT': 'allin',
  },

  'SB-vs-4bet-BTN': {
    '76s': 'call', '77': ['call', 'fold'], '87s': 'call', '88': 'allin', '98s': 'call', '99': 'allin',
    'A2s': ['call', 'fold'], 'A3s': ['call', 'fold'], 'A4s': ['call', 'fold'], 'A5s': ['call', 'fold'],
    'A6s': ['call', 'fold'], 'A7s': ['call', 'fold'], 'A8s': ['call', 'fold'], 'A9s': ['call', 'fold'], 'AA': 'call',
    'AJo': ['call', 'fold'], 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': 'call', 'AQs': 'call',
    'ATo': ['call', 'fold'], 'ATs': 'call', 'J9s': ['call', 'fold'], 'JJ': 'allin', 'JTs': ['call', 'fold'],
    'K9s': ['call', 'fold'], 'KJs': ['call', 'fold'], 'KK': 'allin', 'KQo': ['call', 'fold'], 'KQs': 'call',
    'KTs': ['call', 'fold'], 'Q9s': ['call', 'fold'], 'QJs': ['call', 'fold'], 'QQ': 'allin', 'QTs': ['call', 'fold'],
    'T8s': ['call', 'fold'], 'T9s': 'call', 'TT': 'call',
  },

  'SB-vs-4bet-CO': {
    '87s': 'call', '88': 'allin', '98s': 'call', '99': 'allin', 'A4s': ['call', 'fold'], 'A5s': ['call', 'fold'],
    'A9s': ['call', 'fold'], 'AA': 'allin', 'AJo': ['call', 'fold'], 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin',
    'AQo': ['call', 'fold'], 'AQs': 'call', 'ATs': 'call', 'JJ': 'allin', 'JTs': ['call', 'fold'],
    'KJs': ['call', 'fold'], 'KK': 'allin', 'KQo': ['call', 'fold'], 'KQs': 'call', 'KTs': ['call', 'fold'],
    'QJs': ['call', 'fold'], 'QQ': 'allin', 'QTs': ['call', 'fold'], 'T8s': ['call', 'fold'], 'T9s': ['call', 'fold'],
    'TT': 'call',
  },

  'SB-vs-4bet-MP': {
    '76s': ['call', 'fold'], '87s': ['call', 'fold'], '88': ['call', 'fold'], '99': ['call', 'fold'],
    'A4s': ['call', 'fold'], 'A5s': ['call', 'fold'], 'AA': 'allin', 'AJs': ['call', 'fold'], 'AKo': 'call',
    'AKs': 'allin', 'AQo': ['call', 'fold'], 'AQs': 'call', 'ATs': ['call', 'fold'], 'JJ': 'call',
    'JTs': ['call', 'fold'], 'KJs': ['call', 'fold'], 'KK': 'allin', 'KQs': ['call', 'fold'], 'KTs': ['call', 'fold'],
    'QJs': ['call', 'fold'], 'QQ': 'call', 'QTs': ['call', 'fold'], 'TT': 'call',
  },

  'SB-vs-4bet-UTG': {
    '99': ['call', 'fold'], 'A5s': ['call', 'fold'], 'AA': 'allin', 'AJs': ['call', 'fold'], 'AKo': 'call',
    'AKs': 'allin', 'AQo': ['call', 'fold'], 'AQs': 'call', 'ATs': ['call', 'fold'], 'JJ': 'call',
    'JTs': ['call', 'fold'], 'KJs': ['call', 'fold'], 'KK': 'allin', 'KQs': ['call', 'fold'], 'QJs': ['call', 'fold'],
    'QQ': 'call', 'TT': 'call',
  },

  'SB-vs-open-BTN': {
    '44': ['call', 'fold'], '55': ['call', 'fold'], '66': ['call', 'fold'], '76s': 'raise', '77': 'raise',
    '87s': 'raise', '88': 'raise', '98s': 'raise', '99': 'raise', 'A2s': 'raise', 'A3s': 'raise', 'A4s': 'raise',
    'A5s': 'raise', 'A6s': 'raise', 'A7s': 'raise', 'A8s': 'raise', 'A9s': 'raise', 'AA': 'raise', 'AJo': 'raise',
    'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATo': 'raise', 'ATs': 'raise',
    'J8s': ['call', 'fold'], 'J9s': 'raise', 'JJ': 'raise', 'JTo': ['call', 'fold'], 'JTs': 'raise',
    'K7s': ['call', 'fold'], 'K8s': ['call', 'fold'], 'K9s': 'raise', 'KJo': ['call', 'fold'], 'KJs': 'raise',
    'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise', 'KTs': 'raise', 'Q7s': ['call', 'fold'], 'Q8s': ['call', 'fold'],
    'Q9s': 'raise', 'QJo': ['call', 'fold'], 'QJs': 'raise', 'QQ': 'raise', 'QTs': 'raise', 'T8s': 'raise',
    'T9s': 'raise', 'TT': 'raise',
  },

  'SB-vs-open-CO': {
    '66': ['call', 'fold'], '76s': ['call', 'fold'], '77': ['call', 'fold'], '86s': ['call', 'fold'], '87s': 'raise',
    '88': 'raise', '98s': 'raise', '99': 'raise', 'A2s': ['call', 'fold'], 'A3s': ['call', 'fold'], 'A4s': 'raise',
    'A5s': 'raise', 'A9s': 'raise', 'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise',
    'AQo': 'raise', 'AQs': 'raise', 'ATs': 'raise', 'J9s': ['call', 'fold'], 'JJ': 'raise', 'JTs': 'raise',
    'K9s': ['call', 'fold'], 'KJs': 'raise', 'KK': 'raise', 'KQo': 'raise', 'KQs': 'raise', 'KTs': 'raise',
    'Q9s': ['call', 'fold'], 'QJs': 'raise', 'QQ': 'raise', 'QTs': 'raise', 'T9s': 'raise', 'TT': 'raise',
  },

  'SB-vs-open-MP': {
    '76s': 'raise', '87s': 'raise', '88': 'raise', '98s': ['call', 'fold'], '99': 'raise', 'A2s': ['call', 'fold'],
    'A3s': ['call', 'fold'], 'A4s': 'raise', 'A5s': 'raise', 'A9s': ['call', 'fold'], 'AA': 'raise', 'AJs': 'raise',
    'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATs': 'raise', 'JJ': 'raise', 'JTs': 'raise',
    'KJs': 'raise', 'KK': 'raise', 'KQs': 'raise', 'KTs': 'raise', 'QJs': 'raise', 'QQ': 'raise', 'QTs': 'raise',
    'T9s': ['call', 'fold'], 'TT': 'raise',
  },

  'SB-vs-open-UTG': {
    '87s': ['call', 'fold'], '88': ['call', 'fold'], '98s': ['call', 'fold'], '99': 'raise', 'A2s': ['call', 'fold'],
    'A3s': ['call', 'fold'], 'A4s': ['call', 'fold'], 'A5s': 'raise', 'A9s': ['call', 'fold'], 'AA': 'raise',
    'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise', 'ATs': 'raise', 'JJ': 'raise',
    'JTs': 'raise', 'KJs': 'raise', 'KK': 'raise', 'KQs': 'raise', 'QJs': 'raise', 'QQ': 'raise',
    'T9s': ['call', 'fold'], 'TT': 'raise',
  },

  'UTG-RFI': {
    '22': ['raise', 'fold'], '33': ['raise', 'fold'], '44': ['raise', 'fold'], '55': 'raise', '66': 'raise',
    '77': 'raise', '87s': ['raise', 'fold'], '88': 'raise', '98s': 'raise', '99': 'raise', 'A2s': 'raise',
    'A3s': 'raise', 'A4s': 'raise', 'A5s': 'raise', 'A6s': 'raise', 'A7s': 'raise', 'A8s': 'raise', 'A9s': 'raise',
    'AA': 'raise', 'AJo': 'raise', 'AJs': 'raise', 'AKo': 'raise', 'AKs': 'raise', 'AQo': 'raise', 'AQs': 'raise',
    'ATo': ['raise', 'fold'], 'ATs': 'raise', 'JJ': 'raise', 'JTs': 'raise', 'KJs': 'raise', 'KK': 'raise',
    'KQo': 'raise', 'KQs': 'raise', 'KTs': 'raise', 'QJs': 'raise', 'QQ': 'raise', 'QTs': 'raise', 'T9s': 'raise',
    'TT': 'raise',
  },

  'UTG-vs-3bet-BB': {
    '87s': 'call', '88': 'call', '99': 'call', 'A4s': ['raise', 'fold'], 'A5s': ['raise', 'fold'], 'AA': 'allin',
    'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call',
    'KJs': 'call', 'KK': 'allin', 'KQs': 'call', 'KTs': ['raise', 'fold'], 'QJs': 'call', 'QQ': 'allin', 'T9s': 'call',
    'TT': 'call',
  },

  'UTG-vs-3bet-BTN': {
    '55': 'call', '66': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call', 'A4s': ['raise', 'fold'],
    'A5s': ['raise', 'fold'], 'AA': 'allin', 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin', 'AQo': ['raise', 'fold'],
    'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'allin', 'KQs': 'call',
    'KTs': 'call', 'QJs': 'call', 'QQ': 'allin', 'QTs': 'call', 'T9s': 'call', 'TT': 'call',
  },

  'UTG-vs-3bet-CO': {
    '88': 'call', '99': 'call', 'A5s': ['raise', 'fold'], 'AA': 'allin', 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin',
    'AQo': ['raise', 'fold'], 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'KJs': 'call', 'KK': 'allin', 'KQs': 'call',
    'KTs': 'call', 'QJs': 'call', 'QQ': 'allin', 'TT': 'call',
  },

  'UTG-vs-3bet-MP': {
    '99': 'call', 'A5s': ['raise', 'fold'], 'AA': 'allin', 'AJs': 'call', 'AKo': 'allin', 'AKs': 'allin',
    'AQo': ['raise', 'fold'], 'AQs': 'call', 'ATs': 'call', 'JJ': 'call', 'KJs': 'call', 'KK': 'allin', 'KQs': 'call',
    'KTs': 'call', 'QQ': 'allin', 'TT': 'call',
  },

  'UTG-vs-3bet-SB': {
    '66': 'call', '77': 'call', '87s': 'call', '88': 'call', '99': 'call', 'A4s': ['raise', 'fold'],
    'A5s': ['raise', 'fold'], 'AA': 'allin', 'AJs': 'call', 'AKo': 'call', 'AKs': 'allin', 'AQs': 'call',
    'ATs': 'call', 'JJ': 'call', 'JTs': 'call', 'KJs': 'call', 'KK': 'allin', 'KQs': 'call', 'KTs': ['raise', 'fold'],
    'QJs': 'call', 'QQ': 'allin', 'T9s': 'call', 'TT': 'call',
  },
}
